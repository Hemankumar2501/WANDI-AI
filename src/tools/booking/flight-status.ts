// ═══════════════════════════════════════════════════════════
// Tool: check_flight_status
// Checks real-time flight status via Amadeus Flight Status API.
// Falls back to GPT-generated status when Amadeus is unavailable.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { amadeusBreaker } from "@/lib/utils/circuit-breaker";
import type { FlightStatus } from "@/lib/types";

const log = createLogger("Tool:FlightStatus");



export const checkFlightStatusSchema = z.object({
  carrierCode: z.string().describe('Airline IATA code (e.g., "BA")'),
  flightNumber: z.string().describe('Flight number (e.g., "1234")'),
  date: z.string().describe("Flight date (YYYY-MM-DD)"),
});

/**
 * Check if Amadeus credentials are configured.
 */
function hasAmadeusCredentials(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

export async function checkFlightStatus(
  input: z.infer<typeof checkFlightStatusSchema>,
): Promise<{
  status: FlightStatus;
  delay_minutes?: number;
  departure?: string;
  arrival?: string;
  simulated?: boolean;
}> {
  // ── Fallback: use GPT for realistic status ─────────────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, generating simulated flight status", {
      flight: `${input.carrierCode}${input.flightNumber}`,
    });

    try {
      const client = getAiClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You simulate flight status data. Given a flight, return a realistic status.
Most flights are on time (~85%). Some have minor delays (~10%). Rarely cancelled (~5%).
Respond with JSON: { "status": "on_time"|"delayed"|"cancelled", "delay_minutes": number|null }`,
          },
          {
            role: "user",
            content: `Flight ${input.carrierCode}${input.flightNumber} on ${input.date}`,
          },
        ],
      });

      const parsed = parseJsonResponse<any>(response.choices[0]?.message?.content);
      return {
        status: (parsed.status as FlightStatus) || "on_time",
        delay_minutes: parsed.delay_minutes || undefined,
        simulated: true,
      };
    } catch {
      log.warn("GPT flight status failed, returning on_time");
    }

    return { status: "on_time", simulated: true };
  }

  // ── Real Amadeus Flight Schedule API ───────────────────
  return amadeusBreaker.execute(async () => {
    try {
      log.info("Checking flight status", {
        flight: `${input.carrierCode}${input.flightNumber}`,
      });

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

      const params = new URLSearchParams({
        carrierCode: input.carrierCode,
        flightNumber: input.flightNumber,
        scheduledDepartureDate: input.date,
      });

      const res = await fetch(
        `https://api.amadeus.com/v2/schedule/flights?${params}`,
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      const data = await res.json();
      const flight = (data.data || [])[0];

      if (!flight) {
        return { status: "unknown" as FlightStatus };
      }

      const legs = flight.flightPoints || [];
      const departure = legs[0];
      const arrival = legs[legs.length - 1];

      // Determine delay
      const scheduledDep = departure?.departure?.timings?.find(
        (t: Record<string, unknown>) => t.qualifier === "STD",
      )?.value;
      const estimatedDep = departure?.departure?.timings?.find(
        (t: Record<string, unknown>) => t.qualifier === "ETD",
      )?.value;

      let delayMinutes: number | undefined;
      let status: FlightStatus = "on_time";

      if (scheduledDep && estimatedDep) {
        const scheduled = new Date(scheduledDep).getTime();
        const estimated = new Date(estimatedDep).getTime();
        delayMinutes = Math.round((estimated - scheduled) / 60000);

        if (delayMinutes > 15) {
          status = "delayed";
        }
      }

      return {
        status,
        delay_minutes: delayMinutes,
        departure: scheduledDep,
        arrival: arrival?.arrival?.timings?.find(
          (t: Record<string, unknown>) => t.qualifier === "STA",
        )?.value,
      };
    } catch (error) {
      log.error("Flight status check failed", error);
      return { status: "unknown" as FlightStatus };
    }
  });
}

export const checkFlightStatusTool = {
  name: "check_flight_status",
  description: "Check the current status of a flight",
  schema: checkFlightStatusSchema,
  func: checkFlightStatus,
};
