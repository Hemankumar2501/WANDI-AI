// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Unit Tests: Token Counter
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  countTokens,
  countMessageTokens,
  assertUnderLimit,
  truncateToTokenLimit,
  getModelTokenLimit,
} from "@/lib/utils/token-counter";

describe("countTokens", () => {
  it("should return 0 for empty string", () => {
    expect(countTokens("")).toBe(0);
  });

  it("should return positive count for non-empty text", () => {
    expect(countTokens("Hello, world!")).toBeGreaterThan(0);
  });

  it("should count longer text with more tokens", () => {
    const short = countTokens("Hello");
    const long = countTokens(
      "Hello, this is a much longer sentence with many more words.",
    );
    expect(long).toBeGreaterThan(short);
  });
});

describe("countMessageTokens", () => {
  it("should include message overhead", () => {
    const messages = [{ role: "user", content: "Hi" }];
    const tokens = countMessageTokens(messages);
    expect(tokens).toBeGreaterThan(countTokens("Hi"));
  });

  it("should count multiple messages", () => {
    const single = countMessageTokens([{ role: "user", content: "Hi" }]);
    const multiple = countMessageTokens([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello!" },
    ]);
    expect(multiple).toBeGreaterThan(single);
  });
});

describe("assertUnderLimit", () => {
  it("should not throw for short text", () => {
    expect(() => assertUnderLimit("Hello", "gpt-4o")).not.toThrow();
  });

  it("should throw for extremely long text with small limit", () => {
    const longText = "word ".repeat(10000);
    expect(() => assertUnderLimit(longText, "gpt-4o", 10)).toThrow();
  });
});

describe("truncateToTokenLimit", () => {
  it("should return original text if under limit", () => {
    expect(truncateToTokenLimit("Hello", 100)).toBe("Hello");
  });

  it("should truncate long text", () => {
    const longText = "word ".repeat(1000);
    const truncated = truncateToTokenLimit(longText, 10);
    expect(truncated.length).toBeLessThan(longText.length);
    expect(truncated.endsWith("...")).toBe(true);
  });
});

describe("getModelTokenLimit", () => {
  it("should return 128000 for GPT-4o", () => {
    expect(getModelTokenLimit("gpt-4o")).toBe(128000);
  });

  it("should return default for unknown model", () => {
    expect(getModelTokenLimit("unknown")).toBe(128000);
  });
});
