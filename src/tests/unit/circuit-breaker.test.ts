// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Unit Tests: Circuit Breaker
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { CircuitBreaker } from "@/lib/utils/circuit-breaker";

describe("CircuitBreaker", () => {
  it("should start in closed state", () => {
    const cb = new CircuitBreaker({
      name: "test",
      minCalls: 3,
      errorThreshold: 0.5,
    });
    expect(cb.getState()).toBe("closed");
  });

  it("should allow calls in closed state", async () => {
    const cb = new CircuitBreaker({ name: "test", minCalls: 3 });
    const result = await cb.execute(async () => "success");
    expect(result).toBe("success");
  });

  it("should trip to open state after error threshold exceeded", async () => {
    const cb = new CircuitBreaker({
      name: "test",
      minCalls: 3,
      errorThreshold: 0.5,
      windowMs: 60000,
    });

    // Record enough failures to trip the breaker
    for (let i = 0; i < 3; i++) {
      try {
        await cb.execute(async () => {
          throw new Error("fail");
        });
      } catch {
        /* expected */
      }
    }

    expect(cb.getState()).toBe("open");
  });

  it("should reject calls when circuit is open", async () => {
    const cb = new CircuitBreaker({
      name: "test",
      minCalls: 2,
      errorThreshold: 0.5,
      resetTimeoutMs: 60000,
    });

    for (let i = 0; i < 3; i++) {
      try {
        await cb.execute(async () => {
          throw new Error("fail");
        });
      } catch {
        /* expected */
      }
    }

    await expect(cb.execute(async () => "should not run")).rejects.toThrow();
  });

  it("should use fallback when circuit is open", async () => {
    const cb = new CircuitBreaker({
      name: "test",
      minCalls: 2,
      errorThreshold: 0.5,
      resetTimeoutMs: 60000,
      fallback: () => "fallback value",
    });

    for (let i = 0; i < 3; i++) {
      try {
        await cb.execute(async () => {
          throw new Error("fail");
        });
      } catch {
        /* expected */
      }
    }

    const result = await cb.execute(async () => "should not run");
    expect(result).toBe("fallback value");
  });

  it("should reset when manually reset", () => {
    const cb = new CircuitBreaker({ name: "test" });
    cb.reset();
    expect(cb.getState()).toBe("closed");
  });

  it("should return metrics", () => {
    const cb = new CircuitBreaker({ name: "test" });
    const metrics = cb.getMetrics();
    expect(metrics.state).toBe("closed");
    expect(metrics.totalCalls).toBe(0);
    expect(metrics.errorRate).toBe(0);
  });
});
