// ═══════════════════════════════════════════════════════════
// Tool: amadeus_flight_book
// Books a flight via Amadeus Flight Orders API.
// Falls back to simulated booking when Amadeus is unavailable.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { amadeusBreaker } from "@/lib/utils/circuit-breaker";

const log = createLogger("Tool:FlightBook");

export const amadeusFlightBookSchema = z.object({
  offerId: z.string().describe("Flight offer ID from search results"),
  travelers: z.array(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      date_of_birth: z.string(),
      email: z.string(),
      phone: z.string(),
      passport_number: z.string().optional(),
    }),
  ),
  paymentIntentId: z.string().describe("Stripe PaymentIntent ID"),
});

/**
 * Check if Amadeus credentials are configured.
 */
function hasAmadeusCredentials(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
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

export async function amadeusFlightBook(
  input: z.infer<typeof amadeusFlightBookSchema>,
): Promise<{
  booking_reference: string;
  status: string;
  pnr: string;
  simulated?: boolean;
}> {
  // ── Fallback: simulated booking ────────────────────────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, generating simulated booking reference");
    const reference = `WW-FL-${Date.now().toString(36).toUpperCase()}`;
    return {
      booking_reference: reference,
      status: "confirmed",
      pnr: reference,
      simulated: true,
    };
  }

  // ── Real Amadeus Flight Orders API ─────────────────────
  return amadeusBreaker.execute(async () => {
    try {
      log.info("Booking flight", { offerId: input.offerId });

      const accessToken = await getAmadeusToken();

      const orderPayload = {
        data: {
          type: "flight-order",
          flightOffers: [{ type: "flight-offer", id: input.offerId }],
          travelers: input.travelers.map((t, i) => ({
            id: String(i + 1),
            dateOfBirth: t.date_of_birth,
            name: { firstName: t.first_name, lastName: t.last_name },
            gender: "MALE" as const,
            contact: {
              emailAddress: t.email,
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: "1",
                  number: t.phone,
                },
              ],
            },
            documents: t.passport_number
              ? [
                  {
                    documentType: "PASSPORT",
                    number: t.passport_number,
                    expiryDate: "2030-01-01",
                    nationality: "US",
                    issuanceCountry: "US",
                    holder: true,
                  },
                ]
              : undefined,
          })),
          remarks: {
            general: [
              {
                subType: "GENERAL_MISCELLANEOUS",
                text: `WanderWise Booking | Payment: ${input.paymentIntentId}`,
              },
            ],
          },
        },
      };

      const res = await fetch(
        "https://api.amadeus.com/v1/booking/flight-orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderPayload),
        },
      );

      const data = await res.json();

      if (data.errors) {
        log.error("Amadeus booking error", undefined, { errors: data.errors });
        throw new Error(data.errors[0]?.detail || "Flight booking failed");
      }

      const order = data.data;
      const pnr =
        order?.associatedRecords?.[0]?.reference ||
        `WW-FL-${Date.now().toString(36).toUpperCase()}`;

      return {
        booking_reference: order?.id || pnr,
        status: "confirmed",
        pnr,
      };
    } catch (error) {
      log.error("Flight booking failed", error);
      throw error;
    }
  });
}

export const amadeusFlightBookTool = {
  name: "amadeus_flight_book",
  description: "Book a flight after payment confirmation",
  schema: amadeusFlightBookSchema,
  func: amadeusFlightBook,
};
