// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Memory Consolidation
// Post-session analysis: extracts preferences, constraints,
// and writing style from conversations and stores them in
// long-term vector memory.
// ═══════════════════════════════════════════════════════════


import { v4 as uuidv4 } from "uuid";
import type {
  AgentSession,
  ConsolidatedMemory,
  MemoryRecord,
} from "@/lib/types";
import { upsertMemory } from "@/memory/long-term/pinecone-client";
import { loadPrompt } from "@/prompts/registry";
import { createLogger } from "@/lib/utils/logger";
import { withRetry } from "@/lib/utils/ai";
import { MODEL_CONFIG } from "@/lib/constants";

const log = createLogger("MemoryConsolidation");

// ── OpenAI Client ─────────────────────────────────────────


/**
 * Consolidate a session into long-term memory.
 *
 * After each session ends (or periodically during long sessions),
 * this function:
 * 1. Summarises the conversation with the active AI provider
 * 2. Extracts user preferences, constraints, and writing style
 * 3. Embeds and upserts each insight into Pinecone
 */
export async function consolidateSession(session: AgentSession): Promise<void> {
  const userId = session.user_id;

  try {
    log.info("Starting memory consolidation", {
      sessionId: session.session_id,
      messageCount: session.conversation.length,
    });

    // Skip if conversation is too short to extract insights
    if (session.conversation.length < 3) {
      log.debug("Skipping consolidation — conversation too short");
      return;
    }

    // Format conversation for analysis
    const conversationText = session.conversation
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    // Load the memory consolidation prompt
    const systemPrompt = await loadPrompt("memory-consolidation");

    // Call AI provider to extract insights (with automatic failover)
    const response = await withRetry<{ choices: { message: { content: string | null } }[] }>(
      (client, model) =>
        client.chat.completions.create({
          model: model || MODEL_CONFIG.DEFAULT_MODEL,
          temperature: MODEL_CONFIG.CLASSIFICATION_TEMPERATURE,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: conversationText },
          ],
        }),
      3,
    );

    const content = response.choices[0]?.message?.content;
    if (!content) {
      log.warn("Empty response from consolidation model");
      return;
    }

    const insights: ConsolidatedMemory = JSON.parse(content);
    const now = new Date().toISOString();
    const tripId = session.active_trip_id || undefined;

    // Store each preference as a separate memory record
    for (const pref of insights.preferences) {
      const memory: MemoryRecord = {
        id: uuidv4(),
        user_id: userId,
        content: pref,
        type: "preference",
        trip_id: tripId,
        timestamp: now,
      };
      await upsertMemory(userId, memory);
    }

    // Store each constraint
    for (const constraint of insights.constraints) {
      const memory: MemoryRecord = {
        id: uuidv4(),
        user_id: userId,
        content: constraint,
        type: "constraint",
        trip_id: tripId,
        timestamp: now,
      };
      await upsertMemory(userId, memory);
    }

    // Store writing style if detected
    if (insights.writing_style_description) {
      const memory: MemoryRecord = {
        id: uuidv4(),
        user_id: userId,
        content: insights.writing_style_description,
        type: "writing_style",
        timestamp: now,
      };
      await upsertMemory(userId, memory);
    }

    // Store trip summary from key decisions
    if (insights.key_decisions.length > 0) {
      const summary =
        `Trip decisions: ${insights.key_decisions.join("; ")}. ` +
        `Destinations: ${insights.destinations_mentioned.join(", ")}. ` +
        `Budget level: ${insights.budget_indicators}.`;

      const memory: MemoryRecord = {
        id: uuidv4(),
        user_id: userId,
        content: summary,
        type: "trip_summary",
        trip_id: tripId,
        timestamp: now,
      };
      await upsertMemory(userId, memory);
    }

    log.info("Memory consolidation complete", {
      sessionId: session.session_id,
      preferences: insights.preferences.length,
      constraints: insights.constraints.length,
      decisions: insights.key_decisions.length,
    });
  } catch (error) {
    // Don't throw — consolidation is non-critical
    log.error("Memory consolidation failed", error, {
      sessionId: session.session_id,
    });
  }
}
