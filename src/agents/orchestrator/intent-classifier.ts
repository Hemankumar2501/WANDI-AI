// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Intent Classifier
// Classifies user messages using the active AI provider.
// ═══════════════════════════════════════════════════════════

import type { IntentClassification, Message } from "@/lib/types";
import { IntentClassificationSchema } from "@/lib/schemas";
import { loadPrompt } from "@/prompts/registry";
import { createLogger } from "@/lib/utils/logger";
import { parseJsonResponse, withRetry, getActiveProviderName } from "@/lib/utils/ai";
import { MODEL_CONFIG } from "@/lib/constants";

const log = createLogger("IntentClassifier");

/**
 * Classify a user message into one of 22 intent types.
 *
 * Uses the active AI provider (Gemini → Groq fallback) with
 * automatic retry and provider failover.
 */
export async function classifyIntent(
  message: string,
  history: Message[],
): Promise<IntentClassification> {
  const systemPrompt = await loadPrompt("intent-classifier");

  // Include last 5 messages for context
  const recentHistory = history
    .filter((m) => m.role !== "system")
    .slice(-5)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");

  const userContent = recentHistory
    ? `Recent conversation:\n${recentHistory}\n\nNew message to classify: "${message}"`
    : `Message to classify: "${message}"`;

  let retries = MODEL_CONFIG.MAX_PARSE_RETRIES;

  while (retries >= 0) {
    try {
      // withRetry handles provider failover + exponential backoff
      const response = await withRetry(
        (client, model) =>
          client.chat.completions.create({
            model: model || MODEL_CONFIG.FAST_MODEL,
            temperature: MODEL_CONFIG.CLASSIFICATION_TEMPERATURE,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
          }),
        3,
      );

      const validated = IntentClassificationSchema.parse(
        parseJsonResponse((response as any).choices[0]?.message?.content),
      ) as IntentClassification;

      log.debug("Classification result", {
        intent: validated.intent,
        confidence: validated.confidence,
        provider: getActiveProviderName(),
      });

      return validated;
    } catch (error: any) {
      retries--;
      const status = error?.status ?? error?.statusCode ?? "N/A";
      console.error(
        "[IntentClassifier] ERROR:",
        error?.message || error,
        "| Status:",
        status,
        "| Provider:",
        getActiveProviderName(),
      );

      if (retries < 0) {
        log.error("Intent classification failed after retries", error);

        const isQuotaError =
          status === 429 ||
          String(error?.message || "").toLowerCase().includes("quota");
        const isAuthError =
          status === 400 || status === 401 || status === 403;

        let clarification =
          "I'm having trouble connecting to my AI brain right now. Please try again in a moment! 🙏";

        if (isQuotaError) {
          clarification =
            "The AI service quota has been reached. Please wait a minute and try again, " +
            "or add a GROQ_API_KEY to your .env file for automatic fallback. 🙏";
        } else if (isAuthError) {
          clarification =
            "The AI service key is invalid or expired. " +
            "Please update GEMINI_API_KEY or add GROQ_API_KEY in your .env file.";
        }

        return {
          intent: "general_travel_q",
          confidence: 0,
          entities: {
            destination: null,
            dates: null,
            party_size: null,
            budget: null,
            interests: null,
            trip_id: null,
          },
          needs_clarification: true,
          clarification_question: clarification,
        };
      }
      log.warn(
        `Classification retry (${MODEL_CONFIG.MAX_PARSE_RETRIES - retries}/${MODEL_CONFIG.MAX_PARSE_RETRIES})`,
      );
    }
  }

  // TypeScript requires a return here
  return {
    intent: "general_travel_q",
    confidence: 0,
    entities: {
      destination: null,
      dates: null,
      party_size: null,
      budget: null,
      interests: null,
      trip_id: null,
    },
    needs_clarification: true,
    clarification_question:
      "Could you tell me more about what you need help with?",
  };
}
