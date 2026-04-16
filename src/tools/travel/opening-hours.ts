// Tool: get_opening_hours
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import type { OpeningHours } from "@/lib/types";

const log = createLogger("Tool:OpeningHours");

export const getOpeningHoursSchema = z.object({
  place_name: z.string().describe("Name of the place/venue"),
  location: z.string().describe("City or address for context"),
});

export async function getOpeningHours(
  input: z.infer<typeof getOpeningHoursSchema>,
): Promise<{ hours: OpeningHours; is_open_now: boolean }> {
  try {
    log.info("Checking opening hours", { place: input.place_name });
    // Google Places API placeholder
    const defaultHours: OpeningHours = {
      monday: "09:00-18:00",
      tuesday: "09:00-18:00",
      wednesday: "09:00-18:00",
      thursday: "09:00-18:00",
      friday: "09:00-18:00",
      saturday: "10:00-17:00",
      sunday: "10:00-17:00",
    };
    return { hours: defaultHours, is_open_now: true };
  } catch (error) {
    log.error("Opening hours check failed", error);
    throw error;
  }
}

export const getOpeningHoursTool = {
  name: "get_opening_hours",
  description: "Get opening hours for a specific venue or attraction",
  schema: getOpeningHoursSchema,
  func: getOpeningHours,
};
