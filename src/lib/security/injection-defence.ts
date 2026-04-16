// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Prompt Injection Defence
// Detects and blocks injection attempts.
// ═══════════════════════════════════════════════════════════

import { createLogger } from "@/lib/utils/logger";

const log = createLogger("InjectionDefence");

// Keywords and phrases that indicate injection attempts
const INJECTION_PATTERNS = [
  "ignore instructions",
  "ignore your instructions",
  "ignore previous instructions",
  "ignore all instructions",
  "reveal prompt",
  "reveal your prompt",
  "show me your prompt",
  "show your system prompt",
  "what is your system prompt",
  "act as",
  "pretend you are",
  "pretend to be",
  "you are now",
  "jailbreak",
  "DAN",
  "do anything now",
  "bypass",
  "override",
  "forget everything",
  "disregard",
  "new persona",
  "developer mode",
  "sudo mode",
  "admin mode",
];

/**
 * Sanitize user input by removing control characters.
 */
export function sanitizeUserInput(text: string): string {
  return (
    text
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars
      .replace(/\u200B/g, "") // zero-width space
      .replace(/\u200C/g, "") // zero-width non-joiner
      .replace(/\u200D/g, "") // zero-width joiner
      .replace(/\uFEFF/g, "") // byte order mark
      .trim()
  );
}

/**
 * Detect if user input contains an injection attempt.
 */
export function detectInjectionAttempt(text: string): boolean {
  const lower = text.toLowerCase();

  for (const pattern of INJECTION_PATTERNS) {
    if (lower.includes(pattern)) {
      // Log the attempt (without the full text to avoid PII)
      log.warn("Injection attempt detected", {
        pattern,
        textLength: text.length,
        // Only log first 20 chars — no PII
        preview: text.substring(0, 20) + "...",
      });
      return true;
    }
  }

  // Check for suspicious patterns
  if (
    /system\s*:\s*/i.test(text) ||
    /\[INST\]/i.test(text) ||
    /<<SYS>>/i.test(text)
  ) {
    log.warn("Suspicious formatting detected in input");
    return true;
  }

  return false;
}

/**
 * Get a safe response for injection attempts.
 */
export function getInjectionResponse(): string {
  return (
    "I'm your travel assistant and I can only help with travel-related topics. " +
    "Would you like help planning a trip, searching for flights, or anything else travel-related? ✈️"
  );
}
