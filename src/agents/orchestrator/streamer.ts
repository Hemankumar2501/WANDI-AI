// ═══════════════════════════════════════════════════════════
// WanderWiseAI — SSE Streamer
// Formats StreamChunk events into Server-Sent Events.
// ═══════════════════════════════════════════════════════════

import type { StreamChunk } from "@/lib/types";

/**
 * Format a StreamChunk into an SSE-compatible string.
 */
export function formatSSEChunk(chunk: StreamChunk): string {
  return `data: ${JSON.stringify(chunk)}\n\n`;
}

/**
 * Format a stream of chunks into SSE events.
 */
export async function* formatSSEStream(
  chunks: AsyncGenerator<StreamChunk>,
): AsyncGenerator<string> {
  for await (const chunk of chunks) {
    yield formatSSEChunk(chunk);
  }
}

/**
 * Create SSE headers for the response.
 */
export function getSSEHeaders(): Record<string, string> {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
