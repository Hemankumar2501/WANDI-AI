// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Datadog Metrics
// Custom metrics for observability and alerting.
// ═══════════════════════════════════════════════════════════

import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Datadog");

// Metric types
type MetricType = "counter" | "gauge" | "histogram";

interface Metric {
  name: string;
  type: MetricType;
  value: number;
  tags: Record<string, string>;
  timestamp: string;
}

// In-memory metrics buffer (in production, use Datadog Agent or API)
const metricsBuffer: Metric[] = [];

/**
 * Record an agent latency metric.
 */
export function recordAgentLatency(agentType: string, latencyMs: number): void {
  pushMetric("wanderwiseai.agent.latency", "histogram", latencyMs, {
    agent_type: agentType,
  });
}

/**
 * Record an agent error.
 */
export function recordAgentError(agentType: string, errorCode: string): void {
  pushMetric("wanderwiseai.agent.errors", "counter", 1, {
    agent_type: agentType,
    error_code: errorCode,
  });
}

/**
 * Record token cost.
 */
export function recordTokenCost(userId: string, costUsd: number): void {
  pushMetric("wanderwiseai.token.cost", "gauge", costUsd, {
    user_id_hash: hashId(userId),
  });
}

/**
 * Record tool latency.
 */
export function recordToolLatency(toolName: string, latencyMs: number): void {
  pushMetric("wanderwiseai.tool.latency", "histogram", latencyMs, {
    tool_name: toolName,
  });
}

/**
 * Record tool error.
 */
export function recordToolError(toolName: string): void {
  pushMetric("wanderwiseai.tool.errors", "counter", 1, { tool_name: toolName });
}

/**
 * Record an injection attempt.
 */
export function recordInjectionAttempt(): void {
  pushMetric("wanderwiseai.security.injection_attempts", "counter", 1, {});
}

// Internal
function pushMetric(
  name: string,
  type: MetricType,
  value: number,
  tags: Record<string, string>,
): void {
  const metric: Metric = {
    name,
    type,
    value,
    tags,
    timestamp: new Date().toISOString(),
  };
  metricsBuffer.push(metric);
  log.debug("Metric recorded", { name, value, ...tags });

  // In production: batch submit to Datadog API
  if (metricsBuffer.length > 100) metricsBuffer.splice(0, 50);
}

function hashId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/** Get buffered metrics (for debugging). */
export function getMetricsBuffer(): Metric[] {
  return [...metricsBuffer];
}
