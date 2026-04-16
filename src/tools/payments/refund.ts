// Tool: stripe_refund
import { z } from "zod";
import Stripe from "stripe";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Tool:Refund");
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe)
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  return stripe;
}

export const stripeRefundSchema = z.object({
  payment_intent_id: z.string(),
  amount: z.number().optional().describe("Partial refund amount in cents"),
  reason: z.string(),
});

export async function stripeRefund(
  input: z.infer<typeof stripeRefundSchema>,
): Promise<{ refund_id: string; status: string; amount: number }> {
  try {
    log.info("Processing refund", { intentId: input.payment_intent_id });
    const refund = await getStripe().refunds.create({
      payment_intent: input.payment_intent_id,
      ...(input.amount && { amount: input.amount }),
      reason: "requested_by_customer" as Stripe.RefundCreateParams.Reason,
    });
    return {
      refund_id: refund.id,
      status: refund.status || "pending",
      amount: refund.amount,
    };
  } catch (error) {
    log.error("Refund failed", error);
    throw error;
  }
}

export const stripeRefundTool = {
  name: "stripe_refund",
  description: "Process a refund for a payment",
  schema: stripeRefundSchema,
  func: stripeRefund,
};
