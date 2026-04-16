// WanderWiseAI — Import: Email Route
import { ImportAgent } from "@/agents/import";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("API:ImportEmail");

export async function handleEmailImport(body: {
  email_text: string;
  email_subject: string;
  user_id: string;
  session_id: string;
  trip_id?: string;
}) {
  try {
    log.info("Processing email import");
    const agent = new ImportAgent();
    // Build minimal task for the agent
    return { status: 200, body: { message: "Email import queued" } };
  } catch (error) {
    log.error("Email import failed", error);
    return { status: 500, body: { error: "Import failed" } };
  }
}
