// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Rate Limit Middleware
// Wraps rate-limiter.ts for request-level enforcement.
// ═══════════════════════════════════════════════════════════

import {
  checkUserRequestLimit,
  checkBookingRateLimit,
} from "@/lib/utils/rate-limiter";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("RateLimitMiddleware");

export interface RateLimitResponse {
  allowed: boolean;
  statusCode: number;
  headers: Record<string, string>;
  message?: string;
}

/**
 * Check rate limits for an API request.
 */
export async function checkRateLimit(
  userId: string,
  isBooking: boolean = false,
): Promise<RateLimitResponse> {
  // Check general request limit
  const requestLimit = await checkUserRequestLimit(userId);

  if (!requestLimit.allowed) {
    log.warn("Rate limit exceeded", { userId, resetAt: requestLimit.resetAt });
    return {
      allowed: false,
      statusCode: 429,
      headers: {
        "Retry-After": String(
          Math.ceil(
            (new Date(requestLimit.resetAt).getTime() - Date.now()) / 1000,
          ),
        ),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": requestLimit.resetAt,
      },
      message: "Too many requests. Please try again later.",
    };
  }

  // Check booking-specific limit for fraud prevention
  if (isBooking) {
    const bookingLimit = await checkBookingRateLimit(userId);
    if (!bookingLimit.allowed) {
      log.warn("Booking rate limit exceeded — possible fraud", { userId });
      return {
        allowed: false,
        statusCode: 429,
        headers: { "Retry-After": "3600" },
        message: "Too many booking attempts. Please try again later.",
      };
    }
  }

  return {
    allowed: true,
    statusCode: 200,
    headers: {
      "X-RateLimit-Remaining": String(requestLimit.remaining),
      "X-RateLimit-Reset": requestLimit.resetAt,
    },
  };
}
