// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Short-Term Memory (Redis)
// Upstash Redis session store with 24h TTL.
// Stores active conversation sessions.
// ═══════════════════════════════════════════════════════════

import { Redis } from "@upstash/redis";
import type { AgentSession, Message } from "@/lib/types";
import { SESSION_CONFIG } from "@/lib/constants";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("RedisMemory");

// ── Redis Client ──────────────────────────────────────────
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL || "",
      token: process.env.UPSTASH_REDIS_TOKEN || "",
    });
  }
  return redis;
}

function sessionKey(sessionId: string): string {
  return `${SESSION_CONFIG.KEY_PREFIX}${sessionId}`;
}

// ── Session Operations ────────────────────────────────────

/**
 * Retrieve a session by ID from Redis.
 * Returns null if the session doesn't exist or has expired.
 */
export async function getSession(
  sessionId: string,
): Promise<AgentSession | null> {
  try {
    const client = getRedis();
    const data = await client.get<string>(sessionKey(sessionId));

    if (!data) {
      log.debug("Session not found", { sessionId });
      return null;
    }

    const session: AgentSession =
      typeof data === "string" ? JSON.parse(data) : data;
    log.debug("Session retrieved", {
      sessionId,
      messageCount: session.conversation.length,
    });
    return session;
  } catch (error) {
    log.error("Failed to retrieve session", error, { sessionId });
    return null;
  }
}

/**
 * Save a session to Redis with 24h TTL.
 * Creates or overwrites the session.
 */
export async function saveSession(session: AgentSession): Promise<void> {
  try {
    const client = getRedis();
    session.updated_at = new Date().toISOString();

    await client.set(sessionKey(session.session_id), JSON.stringify(session), {
      ex: SESSION_CONFIG.TTL_SECONDS,
    });

    log.debug("Session saved", {
      sessionId: session.session_id,
      messageCount: session.conversation.length,
    });
  } catch (error) {
    log.error("Failed to save session", error, {
      sessionId: session.session_id,
    });
    throw error;
  }
}

/**
 * Delete a session from Redis.
 */
export async function deleteSession(sessionId: string): Promise<void> {
  try {
    const client = getRedis();
    await client.del(sessionKey(sessionId));
    log.info("Session deleted", { sessionId });
  } catch (error) {
    log.error("Failed to delete session", error, { sessionId });
    throw error;
  }
}

/**
 * Append a message to an existing session's conversation.
 * Refreshes the TTL on the session.
 */
export async function appendMessage(
  sessionId: string,
  message: Message,
): Promise<void> {
  try {
    const session = await getSession(sessionId);
    if (!session) {
      log.warn("Cannot append message — session not found", { sessionId });
      return;
    }

    session.conversation.push(message);
    session.updated_at = new Date().toISOString();

    // Trim conversation if it exceeds the max length
    if (session.conversation.length > SESSION_CONFIG.MAX_CONVERSATION_LENGTH) {
      // Keep system messages and the most recent messages
      const systemMessages = session.conversation.filter(
        (m) => m.role === "system",
      );
      const recentMessages = session.conversation
        .filter((m) => m.role !== "system")
        .slice(-SESSION_CONFIG.MAX_CONVERSATION_LENGTH + systemMessages.length);

      session.conversation = [...systemMessages, ...recentMessages];
      log.info("Conversation trimmed", {
        sessionId,
        newLength: session.conversation.length,
      });
    }

    await saveSession(session);
  } catch (error) {
    log.error("Failed to append message", error, { sessionId });
    throw error;
  }
}

/**
 * Create a new session with default values.
 */
export function createNewSession(
  sessionId: string,
  userId: string,
  userContext: AgentSession["user_context"],
): AgentSession {
  const now = new Date().toISOString();

  return {
    session_id: sessionId,
    user_id: userId,
    active_trip_id: null,
    conversation: [],
    intent_stack: [],
    pending_action: null,
    user_context: userContext,
    tool_results: [],
    created_at: now,
    updated_at: now,
  };
}
