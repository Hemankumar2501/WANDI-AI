// ═══════════════════════════════════════════════════════════
// Tool: amadeus_hotel_search
// Searches for hotels via Amadeus Hotel Search v3 API.
// Falls back to GPT-generated realistic results when
// Amadeus credentials are not configured.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { amadeusBreaker } from "@/lib/utils/circuit-breaker";
import type { HotelOffer } from "@/lib/types";

const log = createLogger("Tool:HotelSearch");



export const amadeusHotelSearchSchema = z.object({
  cityCode: z.string().describe('IATA city code (e.g., "PAR")'),
  checkIn: z.string().describe("Check-in date (YYYY-MM-DD)"),
  checkOut: z.string().describe("Check-out date (YYYY-MM-DD)"),
  adults: z.number().default(1),
  roomQuantity: z.number().default(1),
  maxRate: z.number().optional().describe("Maximum nightly rate in USD"),
});

/**
 * Check if Amadeus credentials are configured.
 */
function hasAmadeusCredentials(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

/**
 * Generate realistic hotel results using GPT-4o-mini when Amadeus is unavailable.
 */
async function generateSmartHotelResults(
  input: z.infer<typeof amadeusHotelSearchSchema>,
): Promise<HotelOffer[]> {
  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(input.checkOut).getTime() - new Date(input.checkIn).getTime()) /
        86400000,
    ),
  );

  const client = getAiClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a hotel data simulator. Generate 3 realistic hotel options for the given city. Use real hotel names that exist in that city, realistic star ratings, real addresses, and market-accurate pricing. Include a mix of budget, mid-range, and upscale options.

Respond with JSON:
{
  "hotels": [
    {
      "offer_id": "sim-hotel-1",
      "hotel_name": "Real Hotel Name",
      "hotel_id": "sim-id-1",
      "rating": 4,
      "address": "Real street address in the city",
      "price_per_night": 120.00,
      "total_price": 360.00,
      "currency": "USD",
      "room_type": "Deluxe Double Room",
      "cancellation_policy": "Free cancellation until 24h before check-in",
      "check_in": "YYYY-MM-DD",
      "check_out": "YYYY-MM-DD"
    }
  ]
}`,
      },
      {
        role: "user",
        content: `Generate 3 real hotels in city code "${input.cityCode}" for ${nights} night(s), check-in ${input.checkIn}, check-out ${input.checkOut}, ${input.adults} adult(s). Total price should be price_per_night × ${nights}.${input.maxRate ? ` Max nightly rate: $${input.maxRate}.` : ""}`,
      },
    ],
  });

  try {
    const parsed = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return (parsed.hotels || []) as HotelOffer[];
  } catch {
    log.warn("Failed to parse GPT hotel data");
    return [];
  }
}

/**
 * Authenticate with Amadeus and return an access token.
 */
async function getAmadeusToken(): Promise<string> {
  const clientId = process.env.AMADEUS_CLIENT_ID || "";
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET || "";

  const tokenRes = await fetch(
    "https://api.amadeus.com/v1/security/oauth2/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    },
  );
  const { access_token } = await tokenRes.json();
  return access_token;
}

export async function amadeusHotelSearch(
  input: z.infer<typeof amadeusHotelSearchSchema>,
): Promise<{ hotels: HotelOffer[]; count: number; simulated?: boolean }> {
  // ── Fallback: use GPT when no Amadeus credentials ──────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, using AI-generated hotel data", {
      city: input.cityCode,
    });
    const hotels = await generateSmartHotelResults(input);
    return {
      hotels: hotels.slice(0, 3),
      count: hotels.length,
      simulated: true,
    };
  }

  // ── Real Amadeus API ───────────────────────────────────
  return amadeusBreaker.execute(async () => {
    try {
      log.info("Searching hotels", { city: input.cityCode });
      const accessToken = await getAmadeusToken();

      // Step 1: Get hotel IDs by city
      const hotelListRes = await fetch(
        `https://api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=${input.cityCode}&radius=30&radiusUnit=KM`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const hotelListData = await hotelListRes.json();
      const hotelIds: string[] = (hotelListData.data || [])
        .slice(0, 20)
        .map((h: Record<string, unknown>) => h.hotelId as string);

      if (hotelIds.length === 0) return { hotels: [], count: 0 };

      // Step 2: Get offers for those hotels
      const params = new URLSearchParams({
        hotelIds: hotelIds.join(","),
        checkInDate: input.checkIn,
        checkOutDate: input.checkOut,
        adults: String(input.adults),
        roomQuantity: String(input.roomQuantity),
        currency: "USD",
      });

      const offersRes = await fetch(
        `https://api.amadeus.com/v3/shopping/hotel-offers?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const offersData = await offersRes.json();

      const nights = Math.max(
        1,
        Math.ceil(
          (new Date(input.checkOut).getTime() -
            new Date(input.checkIn).getTime()) /
            86400000,
        ),
      );

      const hotels: HotelOffer[] = (offersData.data || [])
        .slice(0, 5)
        .map((item: Record<string, unknown>) => {
          const hotel = item.hotel as Record<string, unknown>;
          const offers = (item.offers as Record<string, unknown>[]) || [];
          const bestOffer = offers[0] || {};
          const price = bestOffer.price as Record<string, unknown> | undefined;
          const room = bestOffer.room as Record<string, unknown> | undefined;
          const policies = bestOffer.policies as
            | Record<string, unknown>
            | undefined;
          const cancellation = policies?.cancellation as
            | Record<string, unknown>
            | undefined;

          const totalPrice = parseFloat((price?.total as string) || "0");
          const perNight = Math.round((totalPrice / nights) * 100) / 100;

          return {
            offer_id:
              ((bestOffer as Record<string, unknown>).id as string) ||
              `offer-${hotel?.hotelId}`,
            hotel_name: (hotel?.name as string) || "Unknown Hotel",
            hotel_id: (hotel?.hotelId as string) || "",
            rating: parseInt((hotel?.rating as string) || "0", 10) || 3,
            address:
              (
                (hotel?.address as Record<string, unknown>)?.lines as string[]
              )?.join(", ") ||
              (hotel?.cityCode as string) ||
              input.cityCode,
            price_per_night: perNight,
            total_price: totalPrice,
            currency: (price?.currency as string) || "USD",
            room_type:
              ((room?.description as Record<string, unknown>)
                ?.text as string) ||
              ((room?.typeEstimated as Record<string, unknown>)
                ?.category as string) ||
              "Standard Room",
            cancellation_policy:
              ((cancellation?.description as Record<string, unknown>)
                ?.text as string) ||
              (cancellation?.type === "FULL_STAY"
                ? "Non-refundable"
                : "Free cancellation available"),
            check_in: input.checkIn,
            check_out: input.checkOut,
          };
        });

      // Sort by price
      hotels.sort((a, b) => a.total_price - b.total_price);

      return { hotels: hotels.slice(0, 3), count: hotels.length };
    } catch (error) {
      log.error("Hotel search failed", error);
      throw error;
    }
  });
}

export const amadeusHotelSearchTool = {
  name: "amadeus_hotel_search",
  description: "Search for hotels in a city for specific dates",
  schema: amadeusHotelSearchSchema,
  func: amadeusHotelSearch,
};
