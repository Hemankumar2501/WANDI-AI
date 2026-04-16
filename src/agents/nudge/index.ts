// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Nudge Agent
// Proactive travel alerts via push, email, and in-app.
// ═══════════════════════════════════════════════════════════

import OpenAI from "openai";
import type { AgentTask, AgentResult } from "@/lib/types";
import { checkFlightStatus } from "@/tools/booking/flight-status";
import { getWeatherForecast } from "@/tools/travel/weather";
import { sendPushNotification } from "@/tools/notifications/push";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient } from "@/lib/utils/ai";

const log = createLogger("NudgeAgent");



export class NudgeAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      log.info("Processing nudge", { type: task.type });

      switch (task.type) {
        case "nudge_setup":
          return this.setupNudge(task);
        case "send_reminder":
          return this.sendReminder(task);
        default:
          return {
            task_id: task.task_id,
            agent_type: "nudge",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNSUPPORTED",
              message: `Unsupported: ${task.type}`,
              retryable: false,
              user_message: "I can set up travel reminders and alerts.",
            },
          };
      }
    } catch (error) {
      log.error("Nudge agent failed", error);
      return {
        task_id: task.task_id,
        agent_type: "nudge",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "NUDGE_FAILED",
          message: String(error),
          retryable: true,
          user_message: "Couldn't set up the reminder. Please try again.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  private async setupNudge(task: AgentTask): Promise<AgentResult> {
    const message = (task.payload.message as string) || "";

    // Generate personalised nudge copy
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: `Write a friendly, warm travel reminder notification. Keep it under 2 sentences. User name: ${task.context.user_context.name || "Traveler"}.`,
        },
        { role: "user", content: message },
      ],
    });

    const nudgeText = response.choices[0]?.message?.content || "Reminder set!";

    return {
      task_id: task.task_id,
      agent_type: "nudge",
      status: "success",
      data: {
        response: `🔔 Reminder set! Here's a preview:\n\n"${nudgeText}"\n\nI'll send this at the right time.`,
      },
      confidence: 0.9,
    };
  }

  private async sendReminder(task: AgentTask): Promise<AgentResult> {
    await sendPushNotification({
      user_id: task.user_id,
      title: "WanderWise Reminder",
      body:
        (task.payload.message as string) ||
        "Don't forget about your upcoming trip!",
    });

    return {
      task_id: task.task_id,
      agent_type: "nudge",
      status: "success",
      data: { response: "✅ Reminder sent!" },
      confidence: 0.95,
    };
  }
}
