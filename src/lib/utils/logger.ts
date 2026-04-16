// ═══════════════════════════════════════════════════════════
// WanderWiseAI — PII-Safe Logger
// Automatically redacts sensitive data from all log output.
// Never logs: emails, card numbers, API keys, phone numbers.
// ═══════════════════════════════════════════════════════════

import { redactAll } from "@/lib/security/pii-redactor";

// ── Log Levels ────────────────────────────────────────────
export type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default minimum log level
const MIN_LOG_LEVEL: LogLevel = ((typeof process !== "undefined" &&
  process.env?.LOG_LEVEL) ||
  "info") as LogLevel;

// ── Logger Class ──────────────────────────────────────────

class Logger {
  private context: string;
  private minLevel: number;

  constructor(context: string) {
    this.context = context;
    this.minLevel = LOG_LEVEL_PRIORITY[MIN_LOG_LEVEL] ?? 1;
  }

  /**
   * Create a child logger with additional context.
   */
  child(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }

  /**
   * Debug-level log (development only).
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Info-level log (standard operations).
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Warning-level log (unexpected but non-critical).
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Error-level log (failures and exceptions).
   */
  error(
    message: string,
    error?: unknown,
    data?: Record<string, unknown>,
  ): void {
    const errorData: Record<string, unknown> = { ...data };

    if (error instanceof Error) {
      errorData.error_name = error.name;
      errorData.error_message = redactAll(error.message);
      errorData.error_stack = error.stack
        ? redactAll(error.stack.split("\n").slice(0, 5).join("\n"))
        : undefined;
    } else if (error) {
      errorData.error_raw = redactAll(String(error));
    }

    this.log("error", message, errorData);
  }

  /**
   * Internal log method — applies PII redaction to all output.
   */
  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
  ): void {
    if (LOG_LEVEL_PRIORITY[level] < this.minLevel) return;

    const timestamp = new Date().toISOString();
    const safeMessage = redactAll(message);

    // Redact all values in the data object
    const safeData = data ? this.redactObject(data) : undefined;

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message: safeMessage,
      ...(safeData && { data: safeData }),
    };

    switch (level) {
      case "debug":
        console.debug(JSON.stringify(logEntry));
        break;
      case "info":
        console.info(JSON.stringify(logEntry));
        break;
      case "warn":
        console.warn(JSON.stringify(logEntry));
        break;
      case "error":
        console.error(JSON.stringify(logEntry));
        break;
    }
  }

  /**
   * Deep-redact all string values in an object.
   */
  private redactObject(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        result[key] = redactAll(value);
      } else if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        result[key] = this.redactObject(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[key] = value.map((v) =>
          typeof v === "string" ? redactAll(v) : v,
        );
      } else {
        result[key] = value;
      }
    }

    return result;
  }
}

// ── Factory Function ──────────────────────────────────────

/**
 * Create a logger instance with a context label.
 *
 * @param context - Label for the logger (e.g., 'Orchestrator', 'BookingAgent')
 * @returns Logger instance with PII-safe output
 *
 * @example
 * const log = createLogger('TripPlanner');
 * log.info('Generating itinerary', { destination: 'Kyoto', days: 5 });
 * log.error('Failed to generate', error, { tripId });
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

export default createLogger;
