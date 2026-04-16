// Tool: stripe_confirm_payment
import { z } from "zod";
import Stripe from "stripe";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Tool:ConfirmPayment");
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe)
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  return stripe;
}

export const stripeConfirmPaymentSchema = z.object({
  payment_intent_id: z.string(),
});

export async function stripeConfirmPayment(
  input: z.infer<typeof stripeConfirmPaymentSchema>,
): Promise<{ status: string; amount: number; currency: string }> {
  try {
    log.info("Confirming payment", { intentId: input.payment_intent_id });
    const intent = await getStripe().paymentIntents.retrieve(
      input.payment_intent_id,
    );
    return {
      status: intent.status,
      amount: intent.amount,
      currency: intent.currency,
    };
  } catch (error) {
    log.error("Payment confirmation failed", error);
    throw error;
  }
}

export const stripeConfirmPaymentTool = {
  name: "stripe_confirm_payment",
  description: "Check the status of a Stripe payment",
  schema: stripeConfirmPaymentSchema,
  func: stripeConfirmPayment,
};
