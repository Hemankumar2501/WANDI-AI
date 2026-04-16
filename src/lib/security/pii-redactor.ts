// ═══════════════════════════════════════════════════════════
// WanderWiseAI — PII Redactor
// Strips sensitive data from strings before logging.
// ═══════════════════════════════════════════════════════════

// ── Redaction Patterns ────────────────────────────────────

/** Email pattern: user@domain.tld */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/** Credit card pattern: 4/8/12/16 digits with separators */
const CARD_REGEX = /\b(?:\d[ -]*?){13,19}\b/g;

/** Phone pattern: various international formats */
const PHONE_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;

/** API key pattern: long alphanumeric strings prefixed with common patterns */
const API_KEY_REGEX = /(?:sk|pk|key|token|api)[_-]?[a-zA-Z0-9_-]{20,}/gi;

/** JWT token pattern */
const JWT_REGEX =
  /eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;

/** Password-like patterns in key-value strings */
const PASSWORD_REGEX = /(?:password|passwd|pwd|secret)\s*[=:]\s*\S+/gi;

// ── Redaction Functions ───────────────────────────────────

/**
 * Redact email addresses → [EMAIL]
 */
export function redactEmail(text: string): string {
  return text.replace(EMAIL_REGEX, "[EMAIL]");
}

/**
 * Redact credit card numbers → [CARD]
 */
export function redactCard(text: string): string {
  return text.replace(CARD_REGEX, "[CARD]");
}

/**
 * Redact phone numbers → [PHONE]
 */
export function redactPhone(text: string): string {
  return text.replace(PHONE_REGEX, "[PHONE]");
}

/**
 * Redact API keys → [API_KEY]
 */
export function redactApiKey(text: string): string {
  return text.replace(API_KEY_REGEX, "[API_KEY]");
}

/**
 * Redact JWT tokens → [JWT]
 */
export function redactJwt(text: string): string {
  return text.replace(JWT_REGEX, "[JWT]");
}

/**
 * Redact password values → [PASSWORD]
 */
export function redactPassword(text: string): string {
  return text.replace(PASSWORD_REGEX, "[PASSWORD]");
}

/**
 * Apply ALL redaction rules to a string.
 * Order matters — apply most specific patterns first.
 */
export function redactAll(text: string): string {
  if (!text || typeof text !== "string") return text;

  let result = text;
  result = redactJwt(result);
  result = redactApiKey(result);
  result = redactEmail(result);
  result = redactCard(result);
  result = redactPhone(result);
  result = redactPassword(result);

  return result;
}
