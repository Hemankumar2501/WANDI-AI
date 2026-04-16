// Tool: analyse_photo — GPT-4o Vision
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";

const log = createLogger("Tool:AnalysePhoto");


export const analysePhotoSchema = z.object({
  image_url: z.string().describe("URL of the image to analyse"),
  context: z.string().optional().describe("Additional context about the photo"),
});

export async function analysePhoto(
  input: z.infer<typeof analysePhotoSchema>,
): Promise<{
  description: string;
  landmarks: string[];
  mood: string;
  suggested_caption: string;
}> {
  try {
    log.info("Analysing photo");
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyse this travel photo. ${input.context || ""}\nRespond in JSON: { "description": "string", "landmarks": ["string"], "mood": "string", "suggested_caption": "string" }`,
            },
            { type: "image_url", image_url: { url: input.image_url } },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });
    const result = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return {
      description: result.description || "",
      landmarks: result.landmarks || [],
      mood: result.mood || "",
      suggested_caption: result.suggested_caption || "",
    };
  } catch (error) {
    log.error("Photo analysis failed", error);
    throw error;
  }
}

export const analysePhotoTool = {
  name: "analyse_photo",
  description: "Analyse a travel photo using GPT-4o Vision",
  schema: analysePhotoSchema,
  func: analysePhoto,
};
