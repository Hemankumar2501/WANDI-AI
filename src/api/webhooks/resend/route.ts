// WanderWiseAI — Webhook: Resend (Inbound Email)
import crypto from "crypto";
import { ImportAgent } from "@/agents/import";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Webhook:Resend");

export async function handleResendWebhook(
  body: string,
  signature: string,
): Promise<{ status: number; body: string }> {
  try {
    // Verify HMAC-SHA256 signature
    const secret = process.env.RESEND_WEBHOOK_SECRET || "";
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (signature !== expected) {
      log.warn("Invalid Resend webhook signature");
      return {
        status: 401,
        body: JSON.stringify({ error: "Invalid signature" }),
      };
    }

    const event = JSON.parse(body);
    if (event.type === "email.received") {
      const emailText = event.data?.text || event.data?.html || "";
      const subject = event.data?.subject || "";
      log.info("Inbound email received", { subject });

      // Process with Import Agent
      const importAgent = new ImportAgent();
      // Agent execution would happen asynchronously
    }

    return { status: 200, body: JSON.stringify({ received: true }) };
  } catch (error) {
    log.error("Resend webhook error", error);
    return {
      status: 400,
      body: JSON.stringify({ error: "Webhook processing failed" }),
    };
  }
}
