// Tool: extract_email_booking — GPT-4o structured extraction
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { loadPrompt } from "@/prompts/registry";
import type { PartialBooking } from "@/lib/types";

const log = createLogger("Tool:ExtractEmail");


export const extractEmailBookingSchema = z.object({
  email_text: z.string().describe("The email body text"),
  email_subject: z.string().describe("The email subject line"),
});

export async function extractEmailBooking(
  input: z.infer<typeof extractEmailBookingSchema>,
): Promise<{ booking: PartialBooking; confidence: Record<string, number> }> {
  try {
    log.info("Extracting booking from email");
    const systemPrompt = await loadPrompt("import-agent");
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Subject: ${input.email_subject}\n\n${input.email_text}`,
        },
      ],
    });
    const result = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return {
      booking: result as PartialBooking,
      confidence: result.confidence || {},
    };
  } catch (error) {
    log.error("Email extraction failed", error);
    throw error;
  }
}

export const extractEmailBookingTool = {
  name: "extract_email_booking",
  description: "Extract structured booking data from an email",
  schema: extractEmailBookingSchema,
  func: extractEmailBooking,
};
