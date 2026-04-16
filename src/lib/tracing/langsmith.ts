// ═══════════════════════════════════════════════════════════
// WanderWiseAI — LangSmith Tracing
// Wraps agent executions with LangSmith run tracking.
// ═══════════════════════════════════════════════════════════

import { createLogger } from "@/lib/utils/logger";
import type { AgentType, AgentResult } from "@/lib/types";

const log = createLogger("LangSmith");

interface TraceMetadata {
  agent_type: AgentType;
  user_id_hash: string;
  intent: string;
  model: string;
}

/**
 * Wrap an agent execution with LangSmith tracing.
 */
export async function withLangSmithTrace<T>(
  metadata: TraceMetadata,
  fn: () => Promise<T>,
): Promise<T> {
  const startTime = Date.now();
  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  try {
    log.debug("Starting trace", { runId, ...metadata });

    const result = await fn();

    const latencyMs = Date.now() - startTime;
    log.info("Trace complete", {
      runId,
      agent_type: metadata.agent_type,
      latency_ms: latencyMs,
      status: "success",
    });

    // In production: send to LangSmith API
    // await langsmith.createRun({ ... })

    return result;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    log.error("Trace error", error, {
      runId,
      agent_type: metadata.agent_type,
      latency_ms: latencyMs,
    });
    throw error;
  }
}

/**
 * Hash a user ID for privacy-safe tracing.
 */
export function hashUserId(userId: string): string {
  // Simple hash for tracing — not cryptographic
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `user-${Math.abs(hash).toString(36)}`;
}
