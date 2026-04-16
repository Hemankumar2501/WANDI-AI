// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Health Check Endpoint
// GET /api/health — checks all service connections.
// ═══════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis";
import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";
import type { HealthStatus } from "@/lib/types";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("HealthCheck");

export async function handleHealthCheck(): Promise<{
  status: number;
  body: HealthStatus;
}> {
  const services: Record<string, "ok" | "error"> = {};

  // Check Redis
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_TOKEN || "",
    });
    await redis.ping();
    services.redis = "ok";
  } catch {
    services.redis = "error";
  }

  // Check Pinecone
  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
    const index = pinecone.index({
      name: process.env.PINECONE_INDEX_NAME || "wanderwiseai-memory",
    });
    await index.describeIndexStats();
    services.pinecone = "ok";
  } catch {
    services.pinecone = "error";
  }

  // Check Supabase
  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
    );
    await supabase.from("trips").select("count").limit(1);
    services.supabase = "ok";
  } catch {
    services.supabase = "error";
  }

  // Check OpenAI (lightweight)
  try {
    const baseUrl = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/";
    const res = await fetch(`${baseUrl}models`, {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY || ""}` },
    });
    services.openai = res.ok ? "ok" : "error";
  } catch {
    services.openai = "error";
  }

  const allOk = Object.values(services).every((s) => s === "ok");
  const someOk = Object.values(services).some((s) => s === "ok");

  const healthStatus: HealthStatus = {
    status: allOk ? "healthy" : someOk ? "degraded" : "unhealthy",
    services,
    timestamp: new Date().toISOString(),
  };

  log.info("Health check", { status: healthStatus.status });

  return {
    status: allOk ? 200 : someOk ? 200 : 503,
    body: healthStatus,
  };
}
