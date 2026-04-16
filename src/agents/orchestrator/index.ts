// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Orchestrator Agent
// Central brain: classifies intent → routes to sub-agent →
// streams response via SSE → consolidates memory.
// ═══════════════════════════════════════════════════════════

import { v4 as uuidv4 } from "uuid";
import type {
  AgentSession,
  AgentTask,
  AgentResult,
  Message,
  StreamChunk,
  Attachment,
  UserContext,
  IntentType,
  AgentType,
} from "@/lib/types";
import { classifyIntent } from "@/agents/orchestrator/intent-classifier";
import { routeToAgent } from "@/agents/orchestrator/router";
import { formatSSEChunk } from "@/agents/orchestrator/streamer";
import {
  getSession,
  saveSession,
  createNewSession,
  appendMessage,
} from "@/memory/short-term/redis-client";
import { buildContextForAgent } from "@/memory/context-builder";
import { consolidateSession } from "@/memory/long-term/consolidation";
import { loadPromptWithVariables } from "@/prompts/registry";
import { selectModel } from "@/lib/utils/model-selector";
import {
  checkUserRequestLimit,
  checkUserCostLimit,
} from "@/lib/utils/rate-limiter";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, withRetry } from "@/lib/utils/ai";
import { MODEL_CONFIG } from "@/lib/constants";

const log = createLogger("Orchestrator");

// ── OpenAI Client ─────────────────────────────────────────


// ── Orchestrator Agent Class ──────────────────────────────

export class OrchestratorAgent {
  /**
   * Handle an incoming user message.
   * Returns an async generator of StreamChunk events for SSE.
   */
  async *handle(
    message: string,
    userId: string,
    sessionId: string,
    attachments?: Attachment[],
  ): AsyncGenerator<StreamChunk> {
    const startTime = Date.now();

    try {
      // ── 1. Rate Limit Check ─────────────────────────────
      yield { type: "thinking", label: "Checking access..." };

      const rateLimit = await checkUserRequestLimit(userId);
      if (!rateLimit.allowed) {
        yield {
          type: "error",
          code: "RATE_LIMIT_EXCEEDED",
          message: `You've reached the request limit. Try again after ${rateLimit.resetAt}.`,
        };
        yield { type: "done" };
        return;
      }

      const costLimit = await checkUserCostLimit(userId, 0.02);
      if (!costLimit.allowed) {
        yield {
          type: "error",
          code: "COST_LIMIT_EXCEEDED",
          message: "Daily AI usage limit reached. Try again tomorrow.",
        };
        yield { type: "done" };
        return;
      }

      // ── 2. Build Context ────────────────────────────────
      yield { type: "thinking", label: "Understanding your request..." };

      const context = await buildContextForAgent(userId, sessionId, message);

      // Initialize or retrieve session
      let session = context.session;
      if (!session) {
        session = createNewSession(sessionId, userId, context.userContext);
      }

      // Add user message to conversation
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      session.conversation.push(userMessage);

      // ── 3. Classify Intent ──────────────────────────────
      yield { type: "thinking", label: "Analyzing intent..." };

      const classification = await classifyIntent(
        message,
        session.conversation,
      );

      log.info("Intent classified", {
        intent: classification.intent,
        confidence: classification.confidence,
      });

      // Handle ambiguous intent
      if (
        classification.needs_clarification &&
        classification.clarification_question
      ) {
        yield { type: "text", content: classification.clarification_question };
        const assistantMsg: Message = {
          role: "assistant",
          content: classification.clarification_question,
          timestamp: new Date().toISOString(),
        };
        session.conversation.push(assistantMsg);
        await saveSession(session);
        yield { type: "done" };
        return;
      }

      // Push intent onto stack
      session.intent_stack.push(classification.intent);

      // ── 4. Route to Agent ───────────────────────────────
      const agentType = routeToAgent(classification.intent);

      // Handle general travel questions directly
      if (agentType === "orchestrator") {
        yield* this.handleDirectResponse(
          message,
          session,
          context.userContext,
          context.retrievedMemories,
          context.activeTripSummary,
        );
        await saveSession(session);
        yield { type: "done" };
        return;
      }

      // ── 5. Build Agent Task ─────────────────────────────
      yield { type: "thinking", label: `Connecting to ${agentType} agent...` };

      const task: AgentTask = {
        task_id: uuidv4(),
        type: classification.intent,
        payload: {
          message,
          entities: classification.entities,
          attachments: attachments || [],
        },
        context: session,
        user_id: userId,
        session_id: sessionId,
        complexity: this.assessComplexity(classification.intent),
        requiresVision: attachments?.some((a) => a.type === "image") || false,
        latencyBudgetMs: 10000,
      };

      // ── 6. Invoke Sub-Agent ─────────────────────────────
      yield {
        type: "tool_start",
        tool: agentType,
        label: `${agentType} is working...`,
      };

      const result = await this.invokeAgent(agentType, task);

      yield { type: "tool_done", tool: agentType };

      // ── 7. Stream Result ────────────────────────────────
      if (result.status === "error" && result.error) {
        yield {
          type: "error",
          code: result.error.code,
          message: result.error.user_message,
        };
      } else if (result.status === "needs_clarification") {
        yield {
          type: "text",
          content: (result.data.message as string) || "Could you clarify that?",
        };
      } else {
        // Stream the response text
        const responseText =
          (result.data.response as string) || JSON.stringify(result.data);
        yield { type: "text", content: responseText };

        // Send any UI hints
        if (result.ui_hints) {
          for (const hint of result.ui_hints) {
            yield {
              type: "ui_hint",
              action: hint.action,
              payload: hint.payload,
            };
          }
        }
      }

      // ── 8. Save State ───────────────────────────────────
      const assistantMessage: Message = {
        role: "assistant",
        content: (result.data.response as string) || "",
        timestamp: new Date().toISOString(),
      };
      session.conversation.push(assistantMessage);
      await saveSession(session);

      // ── 9. Background: Consolidate Memory ───────────────
      // Don't await — fire and forget
      consolidateSession(session).catch((err) =>
        log.error("Background consolidation failed", err),
      );

      const latency = Date.now() - startTime;
      log.info("Request complete", {
        latency,
        intent: classification.intent,
        agent: agentType,
      });

      yield { type: "done" };
    } catch (error) {
      log.error("Orchestrator error", error);
      yield {
        type: "error",
        code: "ORCHESTRATOR_ERROR",
        message: "Something went wrong. Please try again.",
      };
      yield { type: "done" };
    }
  }

  /**
   * Handle general travel questions directly with GPT-4o.
   */
  private async *handleDirectResponse(
    message: string,
    session: AgentSession,
    userContext: UserContext,
    memories: string[],
    tripSummary: string,
  ): AsyncGenerator<StreamChunk> {
    try {
      const systemPrompt = await loadPromptWithVariables(
        "orchestrator-system",
        {
          user_name: userContext.name || "Traveler",
          travel_style: userContext.travel_style || "solo",
          home_city: userContext.home_city || "Unknown",
          retrieved_memories: memories.join("\n") || "None",
          active_trip_summary: tripSummary,
        },
      );

      const client = getAiClient();

      // Use withRetry for non-streaming call first, then send result
      // (Streaming + provider failover is complex, so we do a non-streaming
      //  call with full failover, then deliver the text.)
      const response = await withRetry(
        (providerClient, model) =>
          providerClient.chat.completions.create({
            model: model || MODEL_CONFIG.DEFAULT_MODEL,
            temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
            messages: [
              { role: "system", content: systemPrompt },
              ...session.conversation.slice(-10).map((m) => ({
                role: m.role as "user" | "assistant" | "system",
                content: m.content,
              })),
            ],
          }),
        3,
      );

      const fullResponse = (response as any).choices[0]?.message?.content || "";
      yield { type: "text", content: fullResponse };

      // Save assistant response
      session.conversation.push({
        role: "assistant",
        content: fullResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      log.error("Direct response failed", error);
      const status = error?.status ?? 0;
      const isQuota = status === 429 || String(error?.message || "").toLowerCase().includes("quota");
      const isExpired = status === 400 && String(error?.message || "").toLowerCase().includes("expired");

      let msg: string;
      if (isQuota) {
        msg = "⏳ The AI service quota has been reached. Please add a GROQ_API_KEY to your .env file for automatic fallback, or wait a minute and try again!";
      } else if (isExpired) {
        msg = "🔑 Your AI API key has expired. Please generate a new one or add a GROQ_API_KEY to your .env for automatic fallback.";
      } else {
        msg = "I apologize, but I encountered an issue. Could you try again?";
      }

      yield {
        type: "text",
        content: msg,
      };
    }
  }

  /**
   * Invoke a sub-agent with the given task.
   */
  private async invokeAgent(
    agentType: string,
    task: AgentTask,
  ): Promise<AgentResult> {
    // Dynamic import of sub-agents to avoid circular dependencies
    try {
      switch (agentType) {
        case "trip-planner": {
          const { TripPlannerAgent } = await import("@/agents/trip-planner");
          const agent = new TripPlannerAgent();
          return agent.execute(task);
        }
        case "booking": {
          const { BookingAgent } = await import("@/agents/booking");
          const agent = new BookingAgent();
          return agent.execute(task);
        }
        case "import": {
          const { ImportAgent } = await import("@/agents/import");
          const agent = new ImportAgent();
          return agent.execute(task);
        }
        case "expense": {
          const { ExpenseAgent } = await import("@/agents/expense");
          const agent = new ExpenseAgent();
          return agent.execute(task);
        }
        case "journal": {
          const { JournalAgent } = await import("@/agents/journal");
          const agent = new JournalAgent();
          return agent.execute(task);
        }
        case "group": {
          const { GroupAgent } = await import("@/agents/group");
          const agent = new GroupAgent();
          return agent.execute(task);
        }
        case "nudge": {
          const { NudgeAgent } = await import("@/agents/nudge");
          const agent = new NudgeAgent();
          return agent.execute(task);
        }
        default:
          return {
            task_id: task.task_id,
            agent_type: "orchestrator",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNKNOWN_AGENT",
              message: `No agent found for type: ${agentType}`,
              retryable: false,
              user_message:
                "I'm not sure how to handle that. Could you try rephrasing?",
            },
          };
      }
    } catch (error) {
      log.error(`Failed to invoke ${agentType}`, error);
      return {
        task_id: task.task_id,
        agent_type: agentType as AgentType,
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "AGENT_INVOCATION_FAILED",
          message: String(error),
          retryable: true,
          user_message: "Something went wrong. Let me try again.",
        },
      };
    }
  }

  /**
   * Run multiple tasks in parallel.
   */
  async runParallel(tasks: AgentTask[]): Promise<AgentResult[]> {
    return Promise.all(
      tasks.map((task) => {
        const agentType = routeToAgent(task.type);
        return this.invokeAgent(agentType, task);
      }),
    );
  }

  /**
   * Assess task complexity based on intent type.
   */
  private assessComplexity(intent: IntentType): "low" | "medium" | "high" {
    const highComplexity: IntentType[] = [
      "plan_trip",
      "modify_itinerary",
      "book_flight",
      "book_hotel",
    ];
    const lowComplexity: IntentType[] = [
      "convert_currency",
      "add_expense",
      "nudge_setup",
      "general_travel_q",
    ];

    if (highComplexity.includes(intent)) return "high";
    if (lowComplexity.includes(intent)) return "low";
    return "medium";
  }
}
