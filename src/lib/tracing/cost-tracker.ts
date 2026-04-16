// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Cost Tracker
// Tracks per-user AI spend with Redis + Supabase persistence.
// ═══════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis";
import { getModelCost } from "@/lib/utils/model-selector";
import { incrementCost } from "@/lib/utils/rate-limiter";
import type { CostSummary } from "@/lib/types";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("CostTracker");

/**
 * Calculate and record the cost of an LLM call.
 */
export async function trackLLMCost(
  userId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
): Promise<number> {
  const costs = getModelCost(model);
  const inputCost = (inputTokens / 1000) * costs.input;
  const outputCost = (outputTokens / 1000) * costs.output;
  const totalCost = inputCost + outputCost;

  try {
    // Update rate limiter cost tracking
    await incrementCost(userId, totalCost);

    log.debug("LLM cost tracked", {
      model,
      inputTokens,
      outputTokens,
      cost: totalCost.toFixed(6),
    });
  } catch (error) {
    log.error("Cost tracking failed", error);
  }

  return totalCost;
}

/**
 * Get the daily cost summary for a user.
 */
export async function getDailyCostSummary(
  userId: string,
): Promise<CostSummary> {
  const today = new Date().toISOString().split("T")[0];

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_TOKEN || "",
    });

    const totalCost = parseFloat(
      (await redis.get<string>(`ratelimit:cost:${userId}:${today}`)) || "0",
    );

    return {
      user_id: userId,
      date: today,
      total_cost: totalCost,
      breakdown: [],
    };
  } catch (error) {
    log.error("Failed to get cost summary", error);
    return { user_id: userId, date: today, total_cost: 0, breakdown: [] };
  }
}
