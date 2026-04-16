// Tool: categorise_expense — GPT-4o-mini classification
import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import type { ExpenseCategory } from "@/lib/types";

const log = createLogger("Tool:CategoriseExpense");


export const categoriseExpenseSchema = z.object({
  title: z.string().describe("Expense description"),
  amount: z.number().describe("Expense amount"),
  context: z.string().optional().describe("Additional context"),
});

export async function categoriseExpense(
  input: z.infer<typeof categoriseExpenseSchema>,
): Promise<{ category: ExpenseCategory; confidence: number }> {
  try {
    log.info("Categorising expense", { title: input.title });
    const client = getAiClient();
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'Categorise this travel expense. Respond with JSON: { "category": "accommodation|transport|food|activities|shopping|health|communication|other", "confidence": 0.0-1.0 }',
        },
        {
          role: "user",
          content: `Expense: "${input.title}" — $${input.amount}${input.context ? ` (Context: ${input.context})` : ""}`,
        },
      ],
    });
    const result = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return {
      category: result.category || "other",
      confidence: result.confidence || 0.5,
    };
  } catch (error) {
    log.error("Categorisation failed", error);
    throw error;
  }
}

export const categoriseExpenseTool = {
  name: "categorise_expense",
  description: "Auto-categorise a travel expense",
  schema: categoriseExpenseSchema,
  func: categoriseExpense,
};
