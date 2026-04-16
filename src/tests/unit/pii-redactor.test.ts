// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Unit Tests: PII Redactor
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  redactEmail,
  redactCard,
  redactPhone,
  redactApiKey,
  redactJwt,
  redactAll,
} from "@/lib/security/pii-redactor";

describe("redactEmail", () => {
  it("should redact email addresses", () => {
    expect(redactEmail("Contact user@example.com for help")).toBe(
      "Contact [EMAIL] for help",
    );
  });

  it("should redact multiple emails", () => {
    const result = redactEmail("From: a@b.com To: c@d.com");
    expect(result).not.toContain("@");
    expect(result).toContain("[EMAIL]");
  });

  it("should not modify strings without emails", () => {
    expect(redactEmail("No emails here")).toBe("No emails here");
  });
});

describe("redactCard", () => {
  it("should redact 16-digit card numbers", () => {
    expect(redactCard("Card: 4111111111111111")).toContain("[CARD]");
  });

  it("should redact cards with dashes", () => {
    expect(redactCard("Card: 4111-1111-1111-1111")).toContain("[CARD]");
  });
});

describe("redactApiKey", () => {
  it("should redact API keys", () => {
    expect(redactApiKey("Token: sk_live_abc123456789012345678")).toContain(
      "[API_KEY]",
    );
  });

  it("should redact keys with different prefixes", () => {
    expect(redactApiKey("key_abc12345678901234567890")).toContain("[API_KEY]");
  });
});

describe("redactJwt", () => {
  it("should redact JWT tokens", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XljN7FFoZP2";
    expect(redactJwt(jwt)).toContain("[JWT]");
  });
});

describe("redactAll", () => {
  it("should redact all PII in one pass", () => {
    const text =
      "User user@example.com called from 555-123-4567 with card 4111111111111111";
    const result = redactAll(text);
    expect(result).not.toContain("user@example.com");
    expect(result).not.toContain("4111111111111111");
  });

  it("should handle null/undefined gracefully", () => {
    expect(redactAll("")).toBe("");
    expect(redactAll(null as unknown as string)).toBe(null);
  });
});
