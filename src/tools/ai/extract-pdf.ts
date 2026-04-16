// Tool: extract_pdf_booking
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { loadPrompt } from "@/prompts/registry";
import type { PartialBooking } from "@/lib/types";

const log = createLogger("Tool:ExtractPdf");


export const extractPdfBookingSchema = z.object({
  pdf_text: z.string().describe("Text extracted from PDF via pdf-parse"),
});

export async function extractPdfBooking(
  input: z.infer<typeof extractPdfBookingSchema>,
): Promise<{ booking: PartialBooking; confidence: Record<string, number> }> {
  try {
    log.info("Extracting booking from PDF");
    const systemPrompt = await loadPrompt("import-agent");
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input.pdf_text },
      ],
    });
    const result = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return {
      booking: result as PartialBooking,
      confidence: result.confidence || {},
    };
  } catch (error) {
    log.error("PDF extraction failed", error);
    throw error;
  }
}

export const extractPdfBookingTool = {
  name: "extract_pdf_booking",
  description: "Extract booking info from PDF text",
  schema: extractPdfBookingSchema,
  func: extractPdfBooking,
};
