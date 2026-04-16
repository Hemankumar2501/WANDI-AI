// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Rate Limiter
// Uses Upstash Redis for distributed rate limiting.
// Enforces per-user request limits and AI cost caps.
// ═══════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis";
import type { RateLimitResult, CostLimitResult } from "@/lib/types";
import { RATE_LIMITS } from "@/lib/constants";

// ── Redis Client (lazy-initialized) ──────────────────────
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_TOKEN || "",
    });
  }
  return redis;
}

// ── Request Rate Limiting ─────────────────────────────────

/**
 * Check if a user has remaining request quota.
 * Uses a sliding window counter with 1-hour TTL.
 *
 * @param userId - The user's unique identifier
 * @returns RateLimitResult with allowed status and remaining count
 */
export async function checkUserRequestLimit(
  userId: string,
): Promise<RateLimitResult> {
  const client = getRedis();
  const key = `ratelimit:req:${userId}`;
  const now = Date.now();
  const windowMs = RATE_LIMITS.REQUEST_WINDOW_MS;
  const maxRequests = RATE_LIMITS.MAX_REQUESTS_PER_HOUR;

  try {
    // Remove old entries outside the window
    await client.zremrangebyscore(key, 0, now - windowMs);

    // Count current entries in the window
    const count = await client.zcard(key);

    if (count >= maxRequests) {
      // Get the oldest entry to calculate reset time
      const oldest = (await client.zrange(key, 0, 0, {
        withScores: true,
      })) as unknown[];
      const resetAt =
        oldest.length > 1
          ? new Date(Number(oldest[1]) + windowMs).toISOString()
          : new Date(now + windowMs).toISOString();

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Add this request to the window
    await client.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await client.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxRequests - count - 1,
      resetAt: new Date(now + windowMs).toISOString(),
    };
  } catch (error) {
    // On Redis failure, allow the request (fail open) but log
    console.error("[RateLimiter] Redis error, failing open:", error);
    return {
      allowed: true,
      remaining: maxRequests,
      resetAt: new Date(now + windowMs).toISOString(),
    };
  }
}

// ── AI Cost Limiting ──────────────────────────────────────

/**
 * Check if a user has remaining AI spend budget for today.
 *
 * @param userId - The user's unique identifier
 * @param estimatedCost - Estimated cost of the upcoming operation in USD
 * @returns CostLimitResult with allowed status and current spend
 */
export async function checkUserCostLimit(
  userId: string,
  estimatedCost: number,
): Promise<CostLimitResult> {
  const client = getRedis();
  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:cost:${userId}:${today}`;
  const maxCost = RATE_LIMITS.MAX_DAILY_COST_USD;

  try {
    const currentSpend = parseFloat((await client.get<string>(key)) || "0");

    if (currentSpend + estimatedCost > maxCost) {
      return {
        allowed: false,
        spent: currentSpend,
        limit: maxCost,
      };
    }

    return {
      allowed: true,
      spent: currentSpend,
      limit: maxCost,
    };
  } catch (error) {
    console.error("[RateLimiter] Cost check Redis error, failing open:", error);
    return {
      allowed: true,
      spent: 0,
      limit: maxCost,
    };
  }
}

/**
 * Increment the user's daily AI cost after a successful operation.
 *
 * @param userId - The user's unique identifier
 * @param actualCost - Actual cost of the operation in USD
 */
export async function incrementCost(
  userId: string,
  actualCost: number,
): Promise<void> {
  const client = getRedis();
  const today = new Date().toISOString().split("T")[0];
  const key = `ratelimit:cost:${userId}:${today}`;

  try {
    await client.incrbyfloat(key, actualCost);
    // Expire at midnight — TTL of 86400 seconds (24h)
    await client.expire(key, 86400);
  } catch (error) {
    console.error("[RateLimiter] Cost increment failed:", error);
  }
}

/**
 * Check booking attempt rate limit (fraud prevention).
 * 5 booking attempts per user per hour.
 */
export async function checkBookingRateLimit(
  userId: string,
): Promise<RateLimitResult> {
  const client = getRedis();
  const key = `ratelimit:booking:${userId}`;
  const now = Date.now();
  const windowMs = RATE_LIMITS.REQUEST_WINDOW_MS;
  const maxAttempts = RATE_LIMITS.MAX_BOOKING_ATTEMPTS_PER_HOUR;

  try {
    await client.zremrangebyscore(key, 0, now - windowMs);
    const count = await client.zcard(key);

    if (count >= maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now + windowMs).toISOString(),
      };
    }

    await client.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await client.expire(key, Math.ceil(windowMs / 1000));

    return {
      allowed: true,
      remaining: maxAttempts - count - 1,
      resetAt: new Date(now + windowMs).toISOString(),
    };
  } catch (error) {
    console.error("[RateLimiter] Booking rate check failed:", error);
    return {
      allowed: true,
      remaining: maxAttempts,
      resetAt: new Date(now + windowMs).toISOString(),
    };
  }
}
