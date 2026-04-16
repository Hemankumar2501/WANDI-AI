// ═══════════════════════════════════════════════════════════
// Tool: amadeus_hotel_book
// Books a hotel via Amadeus Hotel Booking API.
// Falls back to simulated booking when Amadeus is unavailable.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { amadeusBreaker } from "@/lib/utils/circuit-breaker";

const log = createLogger("Tool:HotelBook");

export const amadeusHotelBookSchema = z.object({
  offerId: z.string(),
  guests: z.array(
    z.object({
      first_name: z.string(),
      last_name: z.string(),
      email: z.string(),
      phone: z.string(),
    }),
  ),
  paymentIntentId: z.string(),
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

export async function amadeusHotelBook(
  input: z.infer<typeof amadeusHotelBookSchema>,
): Promise<{
  booking_reference: string;
  hotel: string;
  status: string;
  simulated?: boolean;
}> {
  // ── Fallback: simulated booking ────────────────────────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, generating simulated hotel booking");
    const reference = `WW-HT-${Date.now().toString(36).toUpperCase()}`;
    return {
      booking_reference: reference,
      hotel: "Hotel (simulated)",
      status: "confirmed",
      simulated: true,
    };
  }

  // ── Real Amadeus Hotel Orders API ──────────────────────
  return amadeusBreaker.execute(async () => {
    try {
      log.info("Booking hotel", { offerId: input.offerId });

      const accessToken = await getAmadeusToken();

      const bookingPayload = {
        data: {
          offerId: input.offerId,
          guests: input.guests.map((g) => ({
            name: {
              title: "MR",
              firstName: g.first_name,
              lastName: g.last_name,
            },
            contact: {
              email: g.email,
              phone: g.phone,
            },
          })),
          payments: [
            {
              method: "CREDIT_CARD",
              card: {
                vendorCode: "VI",
                cardNumber: "0000000000000000",
                expiryDate: "2030-01",
              },
            },
          ],
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
        "https://api.amadeus.com/v2/booking/hotel-orders",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(bookingPayload),
        },
      );

      const data = await res.json();

      if (data.errors) {
        log.error("Amadeus hotel booking error", undefined, {
          errors: data.errors,
        });
        throw new Error(data.errors[0]?.detail || "Hotel booking failed");
      }

      const order = data.data;
      const reference =
        order?.id || `WW-HT-${Date.now().toString(36).toUpperCase()}`;
      const hotelName = order?.hotel?.name || "Hotel";

      return {
        booking_reference: reference,
        hotel: hotelName,
        status: "confirmed",
      };
    } catch (error) {
      log.error("Hotel booking failed", error);
      throw error;
    }
  });
}

export const amadeusHotelBookTool = {
  name: "amadeus_hotel_book",
  description: "Book a hotel after payment confirmation",
  schema: amadeusHotelBookSchema,
  func: amadeusHotelBook,
};
