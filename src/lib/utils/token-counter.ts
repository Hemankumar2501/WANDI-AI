// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Token Counter
// Uses tiktoken-compatible counting for accurate token
// budgeting before LLM calls.
// ═══════════════════════════════════════════════════════════

import type { AgentError } from "@/lib/types";

// ── Token limits per model ────────────────────────────────
const MODEL_TOKEN_LIMITS: Record<string, number> = {
  "gpt-4o": 128000,
  "gpt-4o-mini": 128000,
  "text-embedding-3-large": 8191,
};

// ── Approximate token counting ────────────────────────────
// Uses character-based heuristic (~4 chars per token for English)
// This avoids the heavy tiktoken WASM dependency in the browser.
// For server-side precision, swap in tiktoken's encode().

/**
 * Count the approximate number of tokens in a text string.
 * Uses the ~4 chars/token heuristic for GPT models.
 */
export function countTokens(text: string, _model?: string): number {
  if (!text) return 0;

  // Heuristic: ~4 characters per token for English text
  // This is accurate to within ~10% for most English content
  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  // Blend character and word-based estimates for better accuracy
  const charEstimate = Math.ceil(charCount / 4);
  const wordEstimate = Math.ceil(wordCount * 1.3);

  return Math.ceil((charEstimate + wordEstimate) / 2);
}

/**
 * Count tokens for a chat message array (includes role overhead).
 * Each message has ~4 tokens of overhead for role/formatting.
 */
export function countMessageTokens(
  messages: { role: string; content: string }[],
  model?: string,
): number {
  const MESSAGE_OVERHEAD = 4; // tokens per message for role/formatting
  const REPLY_OVERHEAD = 3; // tokens for reply priming

  let total = 0;
  for (const msg of messages) {
    total += MESSAGE_OVERHEAD;
    total += countTokens(msg.content, model);
    total += countTokens(msg.role, model);
  }
  total += REPLY_OVERHEAD;

  return total;
}

/**
 * Assert that text is under the token limit for a model.
 * Throws a typed AgentError if the limit is exceeded.
 */
export function assertUnderLimit(
  text: string,
  model: string,
  maxTokens?: number,
): void {
  const limit = maxTokens ?? MODEL_TOKEN_LIMITS[model] ?? 128000;
  const tokens = countTokens(text, model);

  if (tokens > limit) {
    const error: AgentError = {
      code: "TOKEN_LIMIT_EXCEEDED",
      message: `Text has ~${tokens} tokens, exceeding the ${limit} token limit for ${model}`,
      retryable: false,
      user_message: "Your message is too long. Please try a shorter version.",
      recovery_action: "truncate_input",
    };
    throw error;
  }
}

/**
 * Truncate text to fit within a token budget.
 * Truncates at word boundaries to avoid cutting mid-word.
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  model?: string,
): string {
  const currentTokens = countTokens(text, model);
  if (currentTokens <= maxTokens) return text;

  // Approximate character limit from token limit
  const charLimit = maxTokens * 4;
  const truncated = text.substring(0, charLimit);

  // Find the last word boundary
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > charLimit * 0.8) {
    return truncated.substring(0, lastSpace) + "...";
  }

  return truncated + "...";
}

/**
 * Get the token limit for a given model.
 */
export function getModelTokenLimit(model: string): number {
  return MODEL_TOKEN_LIMITS[model] ?? 128000;
}
