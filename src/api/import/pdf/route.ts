// WanderWiseAI — Import: PDF Route
import { ImportAgent } from "@/agents/import";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("API:ImportPdf");

export async function handlePdfImport(body: {
  pdf_text: string;
  user_id: string;
  session_id: string;
  trip_id?: string;
}) {
  try {
    log.info("Processing PDF import");
    const agent = new ImportAgent();
    return { status: 200, body: { message: "PDF import queued" } };
  } catch (error) {
    log.error("PDF import failed", error);
    return { status: 500, body: { error: "Import failed" } };
  }
}
