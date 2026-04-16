// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Long-Term Memory (Pinecone)
// Vector memory store with per-user namespace isolation.
// Uses text-embedding-3-large for embeddings.
// ═══════════════════════════════════════════════════════════

import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import type { MemoryRecord } from "@/lib/types";
import { PINECONE_CONFIG, MODEL_CONFIG } from "@/lib/constants";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient } from "@/lib/utils/ai";

const log = createLogger("PineconeMemory");

// ── Clients (lazy-initialized) ────────────────────────────
let pinecone: Pinecone | null = null;

function getPinecone(): Pinecone {
  if (!pinecone) {
    pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }
  return pinecone;
}


function getIndex() {
  const indexName =
    process.env.PINECONE_INDEX_NAME || PINECONE_CONFIG.INDEX_NAME;
  return getPinecone().index({ name: indexName });
}

// ── Embedding ─────────────────────────────────────────────

/**
 * Generate text embeddings using text-embedding-3-large.
 */
export async function embedText(text: string): Promise<number[]> {
  try {
    const client = getAiClient();
    const response = await client.embeddings.create({
      model: MODEL_CONFIG.EMBEDDING_MODEL,
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    log.error("Failed to generate embedding", error);
    throw error;
  }
}

// ── Memory Operations ─────────────────────────────────────

/**
 * Upsert a memory record into Pinecone.
 * Memories are namespaced by user_id for full isolation.
 */
export async function upsertMemory(
  userId: string,
  memory: MemoryRecord,
): Promise<void> {
  try {
    const index = getIndex();
    const namespace = index.namespace(userId);

    const embedding = await embedText(memory.content);

    await namespace.upsert({
      records: [
        {
          id: memory.id,
          values: embedding,
          metadata: {
            user_id: memory.user_id,
            content: memory.content,
            type: memory.type,
            trip_id: memory.trip_id || "",
            timestamp: memory.timestamp,
          },
        },
      ],
    });

    log.info("Memory upserted", {
      userId,
      memoryId: memory.id,
      type: memory.type,
    });
  } catch (error) {
    log.error("Failed to upsert memory", error, {
      userId,
      memoryId: memory.id,
    });
    throw error;
  }
}

/**
 * Retrieve the most relevant memories for a given query.
 * Uses cosine similarity to find the top-K matches.
 */
export async function retrieveRelevantMemories(
  userId: string,
  query: string,
  topK: number = PINECONE_CONFIG.DEFAULT_TOP_K,
): Promise<MemoryRecord[]> {
  try {
    const index = getIndex();
    const namespace = index.namespace(userId);

    const queryEmbedding = await embedText(query);

    const results = await namespace.query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    });

    const memories: MemoryRecord[] = (results.matches || [])
      .filter(
        (match) => (match.score || 0) >= PINECONE_CONFIG.MIN_SCORE_THRESHOLD,
      )
      .map((match) => ({
        id: match.id,
        user_id: (match.metadata?.user_id as string) || userId,
        content: (match.metadata?.content as string) || "",
        type: (match.metadata?.type as MemoryRecord["type"]) || "preference",
        trip_id: (match.metadata?.trip_id as string) || undefined,
        timestamp: (match.metadata?.timestamp as string) || "",
      }));

    log.debug("Memories retrieved", {
      userId,
      query: query.substring(0, 50),
      results: memories.length,
    });

    return memories;
  } catch (error) {
    log.error("Failed to retrieve memories", error, { userId });
    return []; // Return empty on failure — don't block the agent
  }
}

/**
 * Delete all memories for a user (GDPR compliance).
 */
export async function deleteUserMemories(userId: string): Promise<void> {
  try {
    const index = getIndex();
    const namespace = index.namespace(userId);

    await namespace.deleteAll();

    log.info("All user memories deleted", { userId });
  } catch (error) {
    log.error("Failed to delete user memories", error, { userId });
    throw error;
  }
}
