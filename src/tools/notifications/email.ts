// Tool: send_email via Resend
import { z } from "zod";
import { Resend } from "resend";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Tool:Email");
let resend: Resend | null = null;
function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY || "");
  return resend;
}

export const sendEmailSchema = z.object({
  to: z.string().describe("Recipient email"),
  subject: z.string(),
  html: z.string(),
  from: z.string().optional().default("WanderWise <noreply@wanderwise.ai>"),
});

export async function sendEmail(
  input: z.infer<typeof sendEmailSchema>,
): Promise<{ message_id: string }> {
  try {
    log.info("Sending email", { subject: input.subject });
    const result = await getResend().emails.send({
      from: input.from || "WanderWise <noreply@wanderwise.ai>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    return { message_id: result.data?.id || "" };
  } catch (error) {
    log.error("Email send failed", error);
    throw error;
  }
}

export const sendEmailTool = {
  name: "send_email",
  description: "Send an email via Resend",
  schema: sendEmailSchema,
  func: sendEmail,
};
