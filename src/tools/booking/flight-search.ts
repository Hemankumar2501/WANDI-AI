// ═══════════════════════════════════════════════════════════
// Tool: amadeus_flight_search
// Searches for flights via Amadeus v2 Flight Offers API.
// Falls back to GPT-generated realistic results when
// Amadeus credentials are not configured.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { amadeusBreaker } from "@/lib/utils/circuit-breaker";
import type { FlightOffer } from "@/lib/types";

const log = createLogger("Tool:FlightSearch");



export const amadeusFlightSearchSchema = z.object({
  origin: z.string().describe('IATA airport code for departure (e.g., "LHR")'),
  destination: z
    .string()
    .describe('IATA airport code for arrival (e.g., "NRT")'),
  date: z.string().describe("Departure date (YYYY-MM-DD)"),
  returnDate: z.string().optional().describe("Return date for round trips"),
  adults: z.number().default(1).describe("Number of adult passengers"),
  travelClass: z
    .string()
    .optional()
    .describe("ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST"),
});

/**
 * Check if Amadeus credentials are configured.
 */
function hasAmadeusCredentials(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

/**
 * Generate realistic flight results using GPT-4o-mini when Amadeus is unavailable.
 */
async function generateSmartFlightResults(
  input: z.infer<typeof amadeusFlightSearchSchema>,
): Promise<FlightOffer[]> {
  const client = getAiClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a flight data simulator. Generate 3 realistic flight offers based on real airline routes, realistic prices, and actual airline codes. Use real airlines that operate on the given route. Prices should reflect real-world market rates for the cabin class.

Respond with JSON:
{
  "flights": [
    {
      "offer_id": "sim-1",
      "airline": "Full Airline Name",
      "airline_code": "IATA code (2 letters)",
      "departure": "ISO 8601 datetime",
      "arrival": "ISO 8601 datetime",
      "duration": "PTxHxM format",
      "stops": 0,
      "price": 123.45,
      "currency": "USD",
      "cabin_class": "ECONOMY",
      "segments": [
        {
          "departure_airport": "IATA",
          "arrival_airport": "IATA",
          "departure_time": "ISO 8601",
          "arrival_time": "ISO 8601",
          "carrier": "IATA code",
          "flight_number": "XX1234",
          "duration": "PTxHxM"
        }
      ]
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Generate 3 realistic flights from ${input.origin} to ${input.destination} on ${input.date}${input.returnDate ? ` (return ${input.returnDate})` : ""}, ${input.adults} adult(s), class: ${input.travelClass || "ECONOMY"}. Include 1 direct flight and 1-2 with stops if applicable.`,
      },
    ],
  });

  try {
    const parsed = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return (parsed.flights || []) as FlightOffer[];
  } catch {
    log.warn("Failed to parse GPT flight data");
    return [];
  }
}

export async function amadeusFlightSearch(
  input: z.infer<typeof amadeusFlightSearchSchema>,
): Promise<{ flights: FlightOffer[]; count: number; simulated?: boolean }> {
  // ── Fallback: use GPT when no Amadeus credentials ──────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, using AI-generated flight data", {
      origin: input.origin,
      destination: input.destination,
    });
    const flights = await generateSmartFlightResults(input);
    return {
      flights: flights.slice(0, 3),
      count: flights.length,
      simulated: true,
    };
  }

  // ── Real Amadeus API ───────────────────────────────────
  return amadeusBreaker.execute(async () => {
    try {
      log.info("Searching flights", {
        origin: input.origin,
        destination: input.destination,
      });

      const clientId = process.env.AMADEUS_CLIENT_ID || "";
      const clientSecret = process.env.AMADEUS_CLIENT_SECRET || "";

      // Auth
      const tokenRes = await fetch(
        "https://api.amadeus.com/v1/security/oauth2/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
        },
      );
      const { access_token } = await tokenRes.json();

      // Search
      const params = new URLSearchParams({
        originLocationCode: input.origin,
        destinationLocationCode: input.destination,
        departureDate: input.date,
        adults: String(input.adults),
        max: "10",
      });
      if (input.returnDate) params.set("returnDate", input.returnDate);
      if (input.travelClass) params.set("travelClass", input.travelClass);

      const res = await fetch(
        `https://api.amadeus.com/v2/shopping/flight-offers?${params}`,
        {
          headers: { Authorization: `Bearer ${access_token}` },
        },
      );
      const data = await res.json();

      const flights: FlightOffer[] = (data.data || []).map(
        (offer: Record<string, unknown>) => {
          const itinerary = (
            offer.itineraries as Record<string, unknown>[]
          )?.[0];
          const segments =
            (itinerary?.segments as Record<string, unknown>[]) || [];
          const price = offer.price as Record<string, unknown>;

          return {
            offer_id: offer.id as string,
            airline: (segments[0]?.carrierCode as string) || "",
            airline_code: (segments[0]?.carrierCode as string) || "",
            departure:
              ((segments[0]?.departure as Record<string, unknown>)
                ?.at as string) || "",
            arrival:
              ((
                segments[segments.length - 1]?.arrival as Record<
                  string,
                  unknown
                >
              )?.at as string) || "",
            duration: (itinerary?.duration as string) || "",
            stops: segments.length - 1,
            price: parseFloat((price?.grandTotal as string) || "0"),
            currency: (price?.currency as string) || "USD",
            cabin_class: input.travelClass || "ECONOMY",
            segments: segments.map((seg: Record<string, unknown>) => ({
              departure_airport:
                ((seg.departure as Record<string, unknown>)
                  ?.iataCode as string) || "",
              arrival_airport:
                ((seg.arrival as Record<string, unknown>)
                  ?.iataCode as string) || "",
              departure_time:
                ((seg.departure as Record<string, unknown>)?.at as string) ||
                "",
              arrival_time:
                ((seg.arrival as Record<string, unknown>)?.at as string) || "",
              carrier: (seg.carrierCode as string) || "",
              flight_number: `${seg.carrierCode}${seg.number}`,
              duration: (seg.duration as string) || "",
            })),
          };
        },
      );

      // Sort: price → stops → duration
      flights.sort((a, b) => a.price - b.price || a.stops - b.stops);

      return { flights: flights.slice(0, 3), count: flights.length };
    } catch (error) {
      log.error("Flight search failed", error);
      throw error;
    }
  });
}

export const amadeusFlightSearchTool = {
  name: "amadeus_flight_search",
  description: "Search for flights between two airports on specific dates",
  schema: amadeusFlightSearchSchema,
  func: amadeusFlightSearch,
};
