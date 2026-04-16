// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Model Selector
// Routes tasks to the optimal GPT model based on complexity,
// vision requirements, and latency budget.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, IntentType } from "@/lib/types";

// ── Model Constants ───────────────────────────────────────
export const MODELS = {
  GPT4O: "gemini-2.5-pro",
  GPT4O_MINI: "gemini-2.0-flash",
  EMBEDDING: "text-embedding-004",
} as const;

// ── Low-complexity intents that can use the cheaper model ──
const LOW_COMPLEXITY_INTENTS: IntentType[] = [
  "convert_currency",
  "add_expense",
  "settle_up",
  "send_reminder",
  "nudge_setup",
  "general_travel_q",
  "ambiguous",
];

/**
 * Select the optimal model for a given agent task.
 *
 * Decision tree:
 * 1. Vision required → GPT-4o (only model with vision)
 * 2. Low complexity or classification → GPT-4o-mini (fast + cheap)
 * 3. High complexity → GPT-4o (best reasoning)
 * 4. Tight latency budget (<1500ms) → GPT-4o-mini
 * 5. Default → GPT-4o
 */
export function selectModel(task: AgentTask): string {
  // Vision tasks always need GPT-4o
  if (task.requiresVision) {
    return MODELS.GPT4O;
  }

  // Low complexity or classification intents use mini
  if (task.complexity === "low" || LOW_COMPLEXITY_INTENTS.includes(task.type)) {
    return MODELS.GPT4O_MINI;
  }

  // High complexity always gets the full model
  if (task.complexity === "high") {
    return MODELS.GPT4O;
  }

  // Tight latency budget → use faster model
  if (task.latencyBudgetMs < 1500) {
    return MODELS.GPT4O_MINI;
  }

  // Default to GPT-4o for best quality
  return MODELS.GPT4O;
}

/**
 * Get the cost per 1K tokens for a model.
 * Used by cost-tracker to estimate spend.
 */
export function getModelCost(model: string): { input: number; output: number } {
  switch (model) {
    case MODELS.GPT4O:
      return { input: 0.005, output: 0.015 }; // per 1K tokens
    case MODELS.GPT4O_MINI:
      return { input: 0.00015, output: 0.0006 };
    case MODELS.EMBEDDING:
      return { input: 0.00013, output: 0 };
    default:
      return { input: 0.005, output: 0.015 }; // default to GPT-4o pricing
  }
}
