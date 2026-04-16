// ═══════════════════════════════════════════════════════════
// WanderWiseAI — API Route: Agent Endpoint
// POST /api/agent — SSE streaming agent responses.
// ═══════════════════════════════════════════════════════════

import { OrchestratorAgent } from "@/agents/orchestrator";
import { validateJWT } from "@/lib/middleware/auth";
import { checkRateLimit } from "@/lib/middleware/rate-limit";
import {
  sanitizeUserInput,
  detectInjectionAttempt,
  getInjectionResponse,
} from "@/lib/security/injection-defence";
import { formatSSEChunk, getSSEHeaders } from "@/agents/orchestrator/streamer";
import type { Attachment } from "@/lib/types";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("API:Agent");

/**
 * Handle POST /api/agent requests.
 * This is designed to be used with an Express server or similar.
 */
export async function handleAgentRequest(request: {
  headers: Record<string, string>;
  body: { message: string; session_id: string; attachments?: unknown[] };
}): Promise<{
  status: number;
  headers: Record<string, string>;
  body: ReadableStream | string;
}> {
  try {
    // ── Auth ──────────────────────────────────────────────
    const auth = await validateJWT(request.headers.authorization || null);
    
    if (!auth) {
      log.warn("Unauthorized attempt to access agent API");
      return {
        status: 401,
        headers: {},
        body: JSON.stringify({ error: "Unauthorized" }),
      };
    }

    // ── Rate Limit ───────────────────────────────────────
    const rateLimit = await checkRateLimit(auth.userId);
    if (!rateLimit.allowed) {
      return {
        status: rateLimit.statusCode,
        headers: rateLimit.headers,
        body: JSON.stringify({ error: rateLimit.message }),
      };
    }

    // ── Input Validation ─────────────────────────────────
    const { message, session_id, attachments } = request.body;
    if (!message || !session_id) {
      return {
        status: 400,
        headers: {},
        body: JSON.stringify({ error: "Missing message or session_id" }),
      };
    }

    // ── Sanitize & Check Injection ───────────────────────
    const sanitized = sanitizeUserInput(message);

    if (detectInjectionAttempt(sanitized)) {
      const injectionResponse = getInjectionResponse();
      const chunk = formatSSEChunk({
        type: "text",
        content: injectionResponse,
      });
      const done = formatSSEChunk({ type: "done" });

      return {
        status: 200,
        headers: getSSEHeaders(),
        body: chunk + done,
      };
    }

    // ── Invoke Orchestrator ──────────────────────────────
    const orchestrator = new OrchestratorAgent();
    const stream = orchestrator.handle(
      sanitized,
      auth.userId,
      session_id,
      attachments as Attachment[],
    );

    // Create a ReadableStream from the async generator
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(new TextEncoder().encode(formatSSEChunk(chunk)));
          }
          controller.close();
        } catch (error) {
          log.error("Stream error", error);
          controller.enqueue(
            new TextEncoder().encode(
              formatSSEChunk({
                type: "error",
                code: "STREAM_ERROR",
                message: "Connection error",
              }),
            ),
          );
          controller.close();
        }
      },
    });

    return {
      status: 200,
      headers: { ...getSSEHeaders(), ...rateLimit.headers },
      body: readableStream,
    };
  } catch (error) {
    log.error("Agent endpoint error", error);
    return {
      status: 500,
      headers: {},
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
}
