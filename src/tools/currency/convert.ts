// ═══════════════════════════════════════════════════════════
// Tool: fx_convert — Currency conversion with Redis caching
// Falls back to GPT-estimated rates when APIs are unavailable.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import OpenAI from "openai";
import { Redis } from "@upstash/redis";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import { CACHE_TTL } from "@/lib/constants";

const log = createLogger("Tool:FxConvert");



export const fxConvertSchema = z.object({
  amount: z.number().describe("Amount to convert"),
  from: z.string().describe('Source currency code (e.g., "EUR")'),
  to: z.string().describe('Target currency code (e.g., "USD")'),
});

/**
 * Get exchange rate from GPT when external API is down.
 */
async function getGPTRate(from: string, to: string): Promise<number> {
  const client = getAiClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You provide approximate current exchange rates based on your training data. Respond with JSON: { "rate": number }. This should be the rate to convert 1 unit of the source currency to the target currency. Be as accurate as possible.`,
      },
      { role: "user", content: `Exchange rate from ${from} to ${to}` },
    ],
  });

  try {
    const parsed = parseJsonResponse<any>(response.choices[0]?.message?.content);
    if (parsed.rate && typeof parsed.rate === "number") return parsed.rate;
  } catch {
    log.warn("Failed to parse GPT exchange rate");
  }
  return 1; // fallback to 1:1
}

export async function fxConvert(
  input: z.infer<typeof fxConvertSchema>,
): Promise<{
  converted: number;
  rate: number;
  timestamp: string;
  estimated?: boolean;
}> {
  try {
    log.info("Converting currency", {
      from: input.from,
      to: input.to,
      amount: input.amount,
    });

    // Same currency — no conversion needed
    if (input.from === input.to) {
      return {
        converted: input.amount,
        rate: 1,
        timestamp: new Date().toISOString(),
      };
    }

    // Check Redis cache first
    const cacheKey = `fx:${input.from}:${input.to}`;
    let rate: number | null = null;

    try {
      const redisUrl = process.env.UPSTASH_REDIS_URL;
      const redisToken = process.env.UPSTASH_REDIS_TOKEN;
      if (redisUrl && redisToken) {
        const redis = new Redis({ url: redisUrl, token: redisToken });
        const cached = await redis.get<string>(cacheKey);
        if (cached) rate = parseFloat(cached);
      }
    } catch {
      /* Redis unavailable, proceed without cache */
    }

    if (!rate) {
      // Try exchangerate.host API first
      try {
        const res = await fetch(
          `https://api.exchangerate.host/convert?from=${input.from}&to=${input.to}&amount=1`,
        );
        const data = await res.json();
        rate = data.result || data.info?.rate || null;
      } catch {
        log.warn("exchangerate.host API failed, falling back to GPT");
      }

      // Fallback to GPT estimate if API failed
      if (!rate) {
        rate = await getGPTRate(input.from, input.to);
        const converted = Math.round(input.amount * rate * 100) / 100;
        return {
          converted,
          rate,
          timestamp: new Date().toISOString(),
          estimated: true,
        };
      }

      // Cache the rate
      try {
        const redisUrl = process.env.UPSTASH_REDIS_URL;
        const redisToken = process.env.UPSTASH_REDIS_TOKEN;
        if (redisUrl && redisToken) {
          const redis = new Redis({ url: redisUrl, token: redisToken });
          await redis.set(cacheKey, String(rate), {
            ex: CACHE_TTL.FX_RATE_SECONDS,
          });
        }
      } catch {
        /* Cache write failed, non-critical */
      }
    }

    const converted = Math.round(input.amount * rate * 100) / 100;
    return { converted, rate, timestamp: new Date().toISOString() };
  } catch (error) {
    log.error("FX conversion failed", error);
    throw error;
  }
}

export const fxConvertTool = {
  name: "fx_convert",
  description: "Convert amount between currencies",
  schema: fxConvertSchema,
  func: fxConvert,
};
