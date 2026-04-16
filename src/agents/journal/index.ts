// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Journal Agent
// Photo analysis, caption generation, and travel diary.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, AgentResult } from "@/lib/types";
import { analysePhoto } from "@/tools/ai/analyse-photo";
import {
  saveJournalEntry,
  getJournalEntries,
} from "@/memory/episodic/supabase-client";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("JournalAgent");

export class JournalAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      log.info("Processing journal request", { type: task.type });

      switch (task.type) {
        case "suggest_caption":
          return this.suggestCaption(task);
        case "enrich_entry":
          return this.enrichEntry(task);
        case "create_album":
          return this.createAlbum(task);
        default:
          return {
            task_id: task.task_id,
            agent_type: "journal",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNSUPPORTED",
              message: `Unsupported: ${task.type}`,
              retryable: false,
              user_message:
                "I can help with captions, journal entries, and album creation.",
            },
          };
      }
    } catch (error) {
      log.error("Journal agent failed", error);
      return {
        task_id: task.task_id,
        agent_type: "journal",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "JOURNAL_FAILED",
          message: String(error),
          retryable: true,
          user_message: "Something went wrong with your journal entry.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  private async suggestCaption(task: AgentTask): Promise<AgentResult> {
    const attachments =
      (task.payload.attachments as { url: string; type: string }[]) || [];
    const imageUrl = attachments.find((a) => a.type === "image")?.url;

    if (!imageUrl) {
      return {
        task_id: task.task_id,
        agent_type: "journal",
        status: "needs_clarification",
        data: {
          response: "Please share a photo and I'll suggest some captions! 📸",
        },
        confidence: 0.5,
      };
    }

    const analysis = await analysePhoto({
      image_url: imageUrl,
      context: task.payload.message as string,
    });

    const response =
      `📸 **Photo Analysis**\n\n${analysis.description}\n\n` +
      `🏛️ Landmarks: ${analysis.landmarks.join(", ") || "None detected"}\n` +
      `😊 Mood: ${analysis.mood}\n\n` +
      `**Suggested captions:**\n1. "${analysis.suggested_caption}"\n2. "✨ ${analysis.mood} vibes"\n3. "📍 ${analysis.landmarks[0] || "Exploring new places"}"`;

    return {
      task_id: task.task_id,
      agent_type: "journal",
      status: "success",
      data: { response, analysis },
      confidence: 0.85,
      latency_ms: Date.now(),
    };
  }

  private async enrichEntry(task: AgentTask): Promise<AgentResult> {
    const message = (task.payload.message as string) || "";
    const tripId = task.context.active_trip_id;

    if (tripId) {
      await saveJournalEntry(task.user_id, {
        trip_id: tripId,
        title: message.substring(0, 50),
        content: message,
        photos: [],
        location: "",
        mood: "happy",
        visibility: "private",
      });
    }

    return {
      task_id: task.task_id,
      agent_type: "journal",
      status: "success",
      data: {
        response: `📝 Journal entry saved! "${message.substring(0, 50)}..."`,
      },
      confidence: 0.9,
    };
  }

  private async createAlbum(task: AgentTask): Promise<AgentResult> {
    const tripId = task.context.active_trip_id;
    if (!tripId) {
      return {
        task_id: task.task_id,
        agent_type: "journal",
        status: "needs_clarification",
        data: { response: "Which trip would you like to create an album for?" },
        confidence: 0.5,
      };
    }

    const entries = await getJournalEntries(task.user_id, { trip_id: tripId });
    const response =
      entries.length > 0
        ? `📚 Album created with ${entries.length} entries from your trip!`
        : "No journal entries found for this trip yet. Start documenting your journey!";

    return {
      task_id: task.task_id,
      agent_type: "journal",
      status: "success",
      data: { response, entries: entries.length },
      confidence: 0.9,
    };
  }
}
