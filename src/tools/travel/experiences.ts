// Tool: search_experiences
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import type { Experience } from "@/lib/types";

const log = createLogger("Tool:Experiences");

export const searchExperiencesSchema = z.object({
  destination: z.string().describe("City or region to search experiences in"),
  interests: z
    .array(z.string())
    .describe('User interests like "food", "history"'),
  date: z.string().optional().describe("Date for the experience (YYYY-MM-DD)"),
});

export async function searchExperiences(
  input: z.infer<typeof searchExperiencesSchema>,
): Promise<{ experiences: Experience[]; total: number }> {
  try {
    log.info("Searching experiences", { destination: input.destination });
    // Amadeus Activities API placeholder — returns structured results
    return { experiences: [], total: 0 };
  } catch (error) {
    log.error("Experience search failed", error);
    throw error;
  }
}

export const searchExperiencesTool = {
  name: "search_experiences",
  description: "Search for activities and experiences at a destination",
  schema: searchExperiencesSchema,
  func: searchExperiences,
};
