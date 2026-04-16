// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Expense Agent
// Tracks, splits, and settles travel expenses with
// multi-currency support.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, AgentResult, ExpenseSplit } from "@/lib/types";
import { categoriseExpense } from "@/tools/currency/categorise-expense";
import { fxConvert } from "@/tools/currency/convert";
import {
  addExpense,
  getExpenses,
  calculateBalances,
  markSettled,
} from "@/memory/episodic/supabase-client";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("ExpenseAgent");

export class ExpenseAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      log.info("Processing expense", { type: task.type });

      switch (task.type) {
        case "add_expense":
          return this.addExpense(task);
        case "split_expense":
          return this.splitExpense(task);
        case "settle_up":
          return this.settleUp(task);
        case "summarise_expenses":
          return this.summariseExpenses(task);
        case "convert_currency":
          return this.convertCurrency(task);
        default:
          return {
            task_id: task.task_id,
            agent_type: "expense",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNSUPPORTED_EXPENSE_TYPE",
              message: `Unsupported: ${task.type}`,
              retryable: false,
              user_message:
                "I can help track expenses, split costs, and settle up. What would you like to do?",
            },
          };
      }
    } catch (error) {
      log.error("Expense agent failed", error);
      return {
        task_id: task.task_id,
        agent_type: "expense",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "EXPENSE_FAILED",
          message: String(error),
          retryable: true,
          user_message:
            "Something went wrong with the expense. Please try again.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  private async addExpense(task: AgentTask): Promise<AgentResult> {
    const message = (task.payload.message as string) || "";
    const entities = (task.payload.entities as Record<string, unknown>) || {};

    // Auto-categorise
    const category = await categoriseExpense({ title: message, amount: 0 });

    // Convert to USD if needed
    const currency =
      (entities.currency as string) ||
      task.context.user_context.currency ||
      "USD";
    let usdEquivalent = (entities.amount as number) || 0;
    if (currency !== "USD") {
      const fx = await fxConvert({
        amount: usdEquivalent,
        from: currency,
        to: "USD",
      });
      usdEquivalent = fx.converted;
    }

    const tripId = task.context.active_trip_id;
    if (tripId) {
      await addExpense(tripId, task.user_id, {
        title: message,
        amount: (entities.amount as number) || 0,
        currency,
        usd_equivalent: usdEquivalent,
        category: category.category,
        paid_by: task.user_id,
        split_type: "equal",
        splits: [],
        settled: false,
      });
    }

    return {
      task_id: task.task_id,
      agent_type: "expense",
      status: "success",
      data: {
        response: `✅ Expense added: **${message}** — ${currency} ${(entities.amount as number) || 0} (${category.category})\nUSD equivalent: $${usdEquivalent.toFixed(2)}`,
      },
      confidence: category.confidence,
      ui_hints: [
        {
          action: "show_expense_summary",
          payload: { category: category.category },
        },
      ],
    };
  }

  private async splitExpense(task: AgentTask): Promise<AgentResult> {
    const entities = (task.payload.entities as Record<string, unknown>) || {};
    const amount = (entities.amount as number) || 0;
    const partySize = (entities.party_size as number) || 2;

    const perPerson = this.calculateEqualSplit(amount, partySize);

    return {
      task_id: task.task_id,
      agent_type: "expense",
      status: "success",
      data: {
        response: `💰 Split $${amount} equally between ${partySize} people:\n**$${perPerson} per person**`,
        splits: Array(partySize).fill(perPerson),
      },
      confidence: 0.95,
    };
  }

  private calculateEqualSplit(amount: number, members: number): number {
    const base = Math.floor((amount / members) * 100) / 100;
    return base;
  }

  private async settleUp(task: AgentTask): Promise<AgentResult> {
    const tripId = task.context.active_trip_id;
    if (!tripId) {
      return {
        task_id: task.task_id,
        agent_type: "expense",
        status: "needs_clarification",
        data: { response: "Which trip would you like to settle expenses for?" },
        confidence: 0.5,
      };
    }

    const balances = await calculateBalances(tripId);
    const response =
      balances.length > 0
        ? `Here are the current balances:\n\n` +
          balances
            .map(
              (b) =>
                `${b.user_id}: ${b.net_balance >= 0 ? "+" : ""}$${b.net_balance.toFixed(2)}`,
            )
            .join("\n")
        : "All expenses are settled! 🎉";

    return {
      task_id: task.task_id,
      agent_type: "expense",
      status: "success",
      data: { response, balances },
      confidence: 0.9,
    };
  }

  private async summariseExpenses(task: AgentTask): Promise<AgentResult> {
    const tripId = task.context.active_trip_id;
    if (!tripId) {
      return {
        task_id: task.task_id,
        agent_type: "expense",
        status: "needs_clarification",
        data: { response: "Which trip expenses would you like to see?" },
        confidence: 0.5,
      };
    }

    const expenses = await getExpenses(tripId, task.user_id);
    const total = expenses.reduce((sum, e) => sum + e.usd_equivalent, 0);
    const byCategory = expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.usd_equivalent;
        return acc;
      },
      {} as Record<string, number>,
    );

    const response =
      `📊 **Expense Summary**\nTotal: $${total.toFixed(2)}\n\n` +
      Object.entries(byCategory)
        .map(([cat, amt]) => `- ${cat}: $${(amt as number).toFixed(2)}`)
        .join("\n");

    return {
      task_id: task.task_id,
      agent_type: "expense",
      status: "success",
      data: { response, total, byCategory },
      confidence: 0.9,
      ui_hints: [
        { action: "show_expense_summary", payload: { total, byCategory } },
      ],
    };
  }

  private async convertCurrency(task: AgentTask): Promise<AgentResult> {
    const entities = (task.payload.entities as Record<string, unknown>) || {};
    const result = await fxConvert({
      amount: (entities.amount as number) || 100,
      from: (entities.from as string) || "USD",
      to: (entities.to as string) || "EUR",
    });

    return {
      task_id: task.task_id,
      agent_type: "expense",
      status: "success",
      data: {
        response: `💱 ${entities.amount || 100} ${entities.from || "USD"} = **${result.converted} ${entities.to || "EUR"}**\nRate: ${result.rate} (as of ${result.timestamp})`,
      },
      confidence: 0.95,
    };
  }
}
