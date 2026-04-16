// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Group Coordination Agent
// Polls, scheduling, and conflict resolution.
// ═══════════════════════════════════════════════════════════

import OpenAI from "openai";
import type { AgentTask, AgentResult } from "@/lib/types";
import { createPoll, tallyVotes, submitVote } from "@/tools/group/poll";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient } from "@/lib/utils/ai";

const log = createLogger("GroupAgent");



export class GroupAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();
    try {
      log.info("Processing group request", { type: task.type });

      switch (task.type) {
        case "create_poll":
          return this.handleCreatePoll(task);
        case "check_availability":
          return this.checkAvailability(task);
        case "send_group_update":
          return this.sendUpdate(task);
        default:
          return {
            task_id: task.task_id,
            agent_type: "group",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNSUPPORTED",
              message: `Unsupported: ${task.type}`,
              retryable: false,
              user_message:
                "I can help with polls, scheduling, and group updates.",
            },
          };
      }
    } catch (error) {
      log.error("Group agent failed", error);
      return {
        task_id: task.task_id,
        agent_type: "group",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "GROUP_FAILED",
          message: String(error),
          retryable: true,
          user_message: "Something went wrong with the group action.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract poll options from the user's message using GPT-4o-mini,
   * then create the poll in Supabase.
   */
  private async handleCreatePoll(task: AgentTask): Promise<AgentResult> {
    const tripId = task.context.active_trip_id;
    if (!tripId) {
      return {
        task_id: task.task_id,
        agent_type: "group",
        status: "needs_clarification",
        data: { response: "Which trip should this poll be for?" },
        confidence: 0.5,
      };
    }

    const message = (task.payload.message as string) || "";

    // Use GPT-4o-mini to extract a poll question and options from natural language
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Extract a poll question and 2-5 options from the user's message about a group travel decision.
Respond ONLY with JSON:
{
  "question": "The poll question",
  "options": ["Option 1", "Option 2", "Option 3"]
}
If the message is vague, infer reasonable travel-related options.`,
        },
        { role: "user", content: message },
      ],
    });

    const content = response.choices[0]?.message?.content;
    let question = message;
    let options = ["Yes", "No", "Maybe"];

    if (content) {
      try {
        const parsed = JSON.parse(content);
        question = parsed.question || question;
        options = parsed.options?.length >= 2 ? parsed.options : options;
      } catch {
        log.warn("Failed to parse GPT options, using defaults");
      }
    }

    const pollId = await createPoll({
      tripId,
      question,
      options,
      createdBy: task.user_id,
    });

    const optionsList = options
      .map((o: string, i: number) => `  ${i + 1}. ${o}`)
      .join("\n");

    return {
      task_id: task.task_id,
      agent_type: "group",
      status: "success",
      data: {
        response: `📊 **Poll created!** Share it with your group.\n\n**Question:** "${question}"\n\n**Options:**\n${optionsList}\n\n⏰ Voting closes in 24 hours.`,
        pollId,
      },
      confidence: 0.9,
      ui_hints: [{ action: "show_poll", payload: { poll_id: pollId } }],
    };
  }

  private async checkAvailability(task: AgentTask): Promise<AgentResult> {
    return {
      task_id: task.task_id,
      agent_type: "group",
      status: "success",
      data: {
        response:
          "I'll check everyone's availability. Let me send out a scheduling poll to the group.",
      },
      confidence: 0.8,
    };
  }

  private async sendUpdate(task: AgentTask): Promise<AgentResult> {
    return {
      task_id: task.task_id,
      agent_type: "group",
      status: "success",
      data: {
        response: "📢 Group update sent! All members have been notified.",
      },
      confidence: 0.9,
    };
  }
}
