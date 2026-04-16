// Tool: calculate_route_time
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Tool:Route");

export const calculateRouteTimeSchema = z.object({
  origin: z.string().describe("Starting location"),
  destination: z.string().describe("End location"),
  mode: z
    .enum(["driving", "walking", "cycling", "transit"])
    .describe("Transport mode"),
});

export async function calculateRouteTime(
  input: z.infer<typeof calculateRouteTimeSchema>,
): Promise<{ duration_minutes: number; distance_km: number }> {
  try {
    log.info("Calculating route", {
      from: input.origin,
      to: input.destination,
      mode: input.mode,
    });
    // Mapbox Directions API placeholder
    return { duration_minutes: 30, distance_km: 15 };
  } catch (error) {
    log.error("Route calculation failed", error);
    throw error;
  }
}

export const calculateRouteTimeTool = {
  name: "calculate_route_time",
  description: "Calculate travel time and distance between two locations",
  schema: calculateRouteTimeSchema,
  func: calculateRouteTime,
};
