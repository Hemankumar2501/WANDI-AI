// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Circuit Breaker
// Generic circuit breaker pattern to protect against
// cascading failures from external APIs (Amadeus, Stripe, etc.)
// ═══════════════════════════════════════════════════════════

import { createLogger } from "@/lib/utils/logger";

const log = createLogger("CircuitBreaker");

// ── Circuit States ────────────────────────────────────────
export type CircuitState = "closed" | "open" | "half-open";

// ── Configuration ─────────────────────────────────────────
export interface CircuitBreakerOptions {
  /** Name for logging/identification */
  name: string;
  /** Error rate threshold (0-1) to trip the breaker. Default: 0.1 (10%) */
  errorThreshold?: number;
  /** Time window in ms to measure error rate. Default: 60000 (60s) */
  windowMs?: number;
  /** Time in ms to wait before attempting half-open. Default: 30000 (30s) */
  resetTimeoutMs?: number;
  /** Minimum number of calls before evaluating error rate. Default: 5 */
  minCalls?: number;
  /** Optional fallback function when circuit is open */
  fallback?: (...args: unknown[]) => unknown;
}

// ── Circuit Breaker Class ─────────────────────────────────

export class CircuitBreaker {
  private name: string;
  private state: CircuitState = "closed";
  private errorThreshold: number;
  private windowMs: number;
  private resetTimeoutMs: number;
  private minCalls: number;
  private fallback?: (...args: unknown[]) => unknown;

  // Tracking
  private calls: { timestamp: number; success: boolean }[] = [];
  private lastFailureTime: number = 0;
  private consecutiveSuccesses: number = 0;

  constructor(options: CircuitBreakerOptions) {
    this.name = options.name;
    this.errorThreshold = options.errorThreshold ?? 0.1;
    this.windowMs = options.windowMs ?? 60000;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
    this.minCalls = options.minCalls ?? 5;
    this.fallback = options.fallback;
  }

  /**
   * Execute a function through the circuit breaker.
   *
   * @param fn - The async function to protect
   * @returns The result of the function or fallback
   * @throws If circuit is open and no fallback is defined
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Clean old entries outside the window
    this.pruneOldCalls();

    // Check circuit state
    if (this.state === "open") {
      if (this.shouldAttemptReset()) {
        this.state = "half-open";
        log.info(`Circuit ${this.name}: transitioning to half-open`);
      } else {
        log.warn(`Circuit ${this.name}: rejecting call (circuit open)`);
        return this.invokeFallback<T>();
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Get the current state of the circuit breaker.
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get circuit breaker metrics.
   */
  getMetrics(): {
    state: CircuitState;
    totalCalls: number;
    errorRate: number;
    lastFailure: number;
  } {
    this.pruneOldCalls();
    const total = this.calls.length;
    const errors = this.calls.filter((c) => !c.success).length;

    return {
      state: this.state,
      totalCalls: total,
      errorRate: total > 0 ? errors / total : 0,
      lastFailure: this.lastFailureTime,
    };
  }

  /**
   * Manually reset the circuit breaker to closed state.
   */
  reset(): void {
    this.state = "closed";
    this.calls = [];
    this.consecutiveSuccesses = 0;
    log.info(`Circuit ${this.name}: manually reset to closed`);
  }

  // ── Private Methods ───────────────────────────────────

  private recordSuccess(): void {
    this.calls.push({ timestamp: Date.now(), success: true });

    if (this.state === "half-open") {
      this.consecutiveSuccesses++;
      // After 3 consecutive successes in half-open, close the circuit
      if (this.consecutiveSuccesses >= 3) {
        this.state = "closed";
        this.consecutiveSuccesses = 0;
        log.info(`Circuit ${this.name}: recovered, transitioning to closed`);
      }
    }
  }

  private recordFailure(): void {
    this.calls.push({ timestamp: Date.now(), success: false });
    this.lastFailureTime = Date.now();

    if (this.state === "half-open") {
      // Any failure in half-open immediately opens the circuit
      this.state = "open";
      this.consecutiveSuccesses = 0;
      log.warn(`Circuit ${this.name}: failure in half-open, reopening`);
      return;
    }

    // Check if we should trip the circuit
    this.evaluateCircuit();
  }

  private evaluateCircuit(): void {
    if (this.calls.length < this.minCalls) return;

    const errors = this.calls.filter((c) => !c.success).length;
    const errorRate = errors / this.calls.length;

    if (errorRate >= this.errorThreshold) {
      this.state = "open";
      log.warn(
        `Circuit ${this.name}: tripped! Error rate ${(errorRate * 100).toFixed(1)}% ` +
          `exceeds threshold ${(this.errorThreshold * 100).toFixed(1)}%`,
      );
    }
  }

  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime >= this.resetTimeoutMs;
  }

  private pruneOldCalls(): void {
    const cutoff = Date.now() - this.windowMs;
    this.calls = this.calls.filter((c) => c.timestamp > cutoff);
  }

  private invokeFallback<T>(): T {
    if (this.fallback) {
      return this.fallback() as T;
    }
    throw new Error(
      `Circuit breaker ${this.name} is open. Service temporarily unavailable.`,
    );
  }
}

// ── Pre-configured Circuit Breakers ───────────────────────

/** Circuit breaker for Amadeus API calls */
export const amadeusBreaker = new CircuitBreaker({
  name: "amadeus",
  errorThreshold: 0.1,
  windowMs: 60000,
  resetTimeoutMs: 30000,
  minCalls: 5,
});

/** Circuit breaker for Stripe API calls */
export const stripeBreaker = new CircuitBreaker({
  name: "stripe",
  errorThreshold: 0.05,
  windowMs: 60000,
  resetTimeoutMs: 30000,
  minCalls: 3,
});

/** Circuit breaker for OpenAI API calls */
export const openaiBreaker = new CircuitBreaker({
  name: "openai",
  errorThreshold: 0.15,
  windowMs: 60000,
  resetTimeoutMs: 20000,
  minCalls: 5,
});
