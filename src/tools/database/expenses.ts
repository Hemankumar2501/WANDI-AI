// Database Tool: Expenses
import { z } from "zod";
import * as db from "@/memory/episodic/supabase-client";

export const expenseDbTools = {
  add_expense: {
    name: "add_expense",
    schema: z.object({
      tripId: z.string(),
      userId: z.string(),
      expenseData: z.record(z.unknown()),
    }),
    func: async (input: {
      tripId: string;
      userId: string;
      expenseData: Record<string, unknown>;
    }) => db.addExpense(input.tripId, input.userId, input.expenseData as never),
  },
  get_expenses: {
    name: "get_expenses",
    schema: z.object({ tripId: z.string(), userId: z.string() }),
    func: async (input: { tripId: string; userId: string }) =>
      db.getExpenses(input.tripId, input.userId),
  },
  mark_settled: {
    name: "mark_settled",
    schema: z.object({ expenseId: z.string() }),
    func: async (input: { expenseId: string }) =>
      db.markSettled(input.expenseId),
  },
  calculate_balances: {
    name: "calculate_balances",
    schema: z.object({ tripId: z.string() }),
    func: async (input: { tripId: string }) =>
      db.calculateBalances(input.tripId),
  },
};
