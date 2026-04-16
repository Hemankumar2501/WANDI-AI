// Tool: stripe_create_payment_intent
import { z } from "zod";
import Stripe from "stripe";
import { createLogger } from "@/lib/utils/logger";
import { stripeBreaker } from "@/lib/utils/circuit-breaker";

const log = createLogger("Tool:CreatePayment");

let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe)
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
  return stripe;
}

export const stripeCreatePaymentIntentSchema = z.object({
  amount: z.number().describe("Amount in smallest currency unit (e.g., cents)"),
  currency: z.string().default("usd"),
  user_id: z.string(),
  metadata: z.record(z.string()).default({}),
});

export async function stripeCreatePaymentIntent(
  input: z.infer<typeof stripeCreatePaymentIntentSchema>,
): Promise<{ client_secret: string; payment_intent_id: string }> {
  return stripeBreaker.execute(async () => {
    try {
      log.info("Creating payment intent", {
        amount: input.amount,
        currency: input.currency,
      });
      const intent = await getStripe().paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        metadata: { ...input.metadata, user_id: input.user_id },
      });
      return {
        client_secret: intent.client_secret || "",
        payment_intent_id: intent.id,
      };
    } catch (error) {
      log.error("Payment intent creation failed", error);
      throw error;
    }
  });
}

export const stripeCreatePaymentIntentTool = {
  name: "stripe_create_payment_intent",
  description: "Create a Stripe payment intent for a booking",
  schema: stripeCreatePaymentIntentSchema,
  func: stripeCreatePaymentIntent,
};
