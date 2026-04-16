// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Import Agent
// Parses booking data from emails and PDFs.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, AgentResult } from "@/lib/types";
import { extractEmailBooking } from "@/tools/ai/extract-booking";
import { extractPdfBooking } from "@/tools/ai/extract-pdf";
import { saveBooking } from "@/memory/episodic/supabase-client";
import { AGENT_CONFIG } from "@/lib/constants";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("ImportAgent");

export class ImportAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      log.info("Processing import", { type: task.type });

      const payload = task.payload;
      let booking: Record<string, unknown> = {};
      let confidence: Record<string, number> = {};

      if (task.type === "import_booking") {
        const result = await extractEmailBooking({
          email_text: (payload.message as string) || "",
          email_subject: (payload.subject as string) || "Booking Confirmation",
        });
        booking = result.booking as unknown as Record<string, unknown>;
        confidence = result.confidence;
      } else if (task.type === "parse_pdf") {
        const result = await extractPdfBooking({
          pdf_text: (payload.message as string) || "",
        });
        booking = result.booking as unknown as Record<string, unknown>;
        confidence = result.confidence;
      }

      // Check if all confidence scores are above threshold
      const allConfident = Object.values(confidence).every(
        (c) => c >= AGENT_CONFIG.IMPORT_AUTO_SAVE_THRESHOLD,
      );

      if (allConfident && task.context.active_trip_id) {
        try {
          await saveBooking(task.user_id, task.context.active_trip_id, booking);
          return {
            task_id: task.task_id,
            agent_type: "import",
            status: "success",
            data: {
              response: `✅ Booking imported successfully!\n\n**${booking.provider}** — ${booking.type}\n📍 ${booking.from} → ${booking.to}\n📅 ${booking.start_datetime}\n💰 ${booking.amount} ${booking.currency}`,
              booking,
            },
            confidence: 0.95,
            ui_hints: [{ action: "show_booking_card", payload: booking }],
            latency_ms: Date.now() - startTime,
          };
        } catch {
          log.warn("Auto-save failed, returning for review");
        }
      }

      return {
        task_id: task.task_id,
        agent_type: "import",
        status: "needs_clarification",
        data: {
          response: `I extracted this booking but some fields need your review:\n\n${JSON.stringify(booking, null, 2)}\n\nPlease confirm or correct the details.`,
          booking,
          confidence,
        },
        confidence: 0.7,
        latency_ms: Date.now() - startTime,
      };
    } catch (error) {
      log.error("Import failed", error);
      return {
        task_id: task.task_id,
        agent_type: "import",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "IMPORT_FAILED",
          message: String(error),
          retryable: true,
          user_message:
            "I couldn't parse that booking. Try forwarding the email or uploading the PDF again.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }
}
