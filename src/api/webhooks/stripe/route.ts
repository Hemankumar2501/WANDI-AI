// WanderWiseAI — Webhook: Stripe
import Stripe from "stripe";
import { createLogger } from "@/lib/utils/logger";
import { updateBookingStatus } from "@/memory/episodic/supabase-client";

const log = createLogger("Webhook:Stripe");

export async function handleStripeWebhook(
  body: string,
  signature: string,
): Promise<{ status: number; body: string }> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia" as Stripe.LatestApiVersion,
    });
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || "",
    );

    switch (event.type) {
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        const bookingId = intent.metadata?.booking_id;
        if (bookingId) await updateBookingStatus(bookingId, "confirmed");
        log.info("Payment succeeded", { intentId: intent.id });
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        log.warn("Payment failed", { intentId: intent.id });
        break;
      }
      default:
        log.debug("Unhandled Stripe event", { type: event.type });
    }

    return { status: 200, body: JSON.stringify({ received: true }) };
  } catch (error) {
    log.error("Stripe webhook error", error);
    return {
      status: 400,
      body: JSON.stringify({ error: "Webhook signature verification failed" }),
    };
  }
}
