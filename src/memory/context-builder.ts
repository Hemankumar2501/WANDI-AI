// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Context Builder
// Merges all three memory layers into a unified context
// for agent consumption.
// ═══════════════════════════════════════════════════════════

import type { UserContext, AgentSession, Trip } from "@/lib/types";
import { getSession } from "@/memory/short-term/redis-client";
import { retrieveRelevantMemories } from "@/memory/long-term/pinecone-client";
import { getTrip, listTrips } from "@/memory/episodic/supabase-client";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("ContextBuilder");

/**
 * Build a complete context for an agent by merging data
 * from all three memory layers:
 *
 * 1. Short-term (Redis) — current conversation session
 * 2. Long-term (Pinecone) — user preferences and past trip memories
 * 3. Episodic (Supabase) — active trip details and structured records
 *
 * @param userId - The user's unique identifier
 * @param sessionId - The current session ID
 * @param query - The user's current query (used for memory retrieval)
 * @returns Merged context with all available data
 */
export async function buildContextForAgent(
  userId: string,
  sessionId: string,
  query: string,
): Promise<{
  session: AgentSession | null;
  userContext: UserContext;
  retrievedMemories: string[];
  activeTripSummary: string;
}> {
  try {
    // ── 1. Fetch session from Redis ───────────────────────
    const session = await getSession(sessionId);

    // ── 2. Retrieve relevant memories from Pinecone ───────
    let retrievedMemories: string[] = [];
    try {
      const memories = await retrieveRelevantMemories(userId, query, 5);
      retrievedMemories = memories.map((m) => m.content);
    } catch (error) {
      log.warn("Failed to retrieve memories, continuing without", { userId });
    }

    // ── 3. Fetch active trip from Supabase ────────────────
    let activeTripSummary = "No active trip.";
    try {
      // Use the session's active trip if available
      if (session?.active_trip_id) {
        const trip = await getTrip(session.active_trip_id, userId);
        if (trip) {
          activeTripSummary = formatTripSummary(trip);
        }
      } else {
        // Otherwise check for the most recent planning/in_progress trip
        const trips = await listTrips(userId);
        const activeTrip = trips.find(
          (t) => t.status === "in_progress" || t.status === "planning",
        );
        if (activeTrip) {
          activeTripSummary = formatTripSummary(activeTrip);
        }
      }
    } catch (error) {
      log.warn("Failed to fetch active trip, continuing without", { userId });
    }

    // ── 4. Build user context ─────────────────────────────
    const userContext: UserContext = session?.user_context || {
      user_id: userId,
      name: "",
      travel_style: "solo",
      home_city: "",
      home_airport: "",
      currency: "USD",
      preferences: [],
      past_destinations: [],
      writing_style_sample: "",
    };

    // Enrich preferences from long-term memory
    if (retrievedMemories.length > 0) {
      const memoryPrefs = retrievedMemories.filter(
        (m) => !userContext.preferences.includes(m),
      );
      userContext.preferences = [
        ...userContext.preferences,
        ...memoryPrefs.slice(0, 5),
      ];
    }

    return {
      session,
      userContext,
      retrievedMemories,
      activeTripSummary,
    };
  } catch (error) {
    log.error("Failed to build context", error, { userId, sessionId });

    // Return minimal context on failure
    return {
      session: null,
      userContext: {
        user_id: userId,
        name: "",
        travel_style: "solo",
        home_city: "",
        home_airport: "",
        currency: "USD",
        preferences: [],
        past_destinations: [],
        writing_style_sample: "",
      },
      retrievedMemories: [],
      activeTripSummary: "No active trip.",
    };
  }
}

// ── Helper ────────────────────────────────────────────────

function formatTripSummary(trip: Trip): string {
  return (
    `Destination: ${trip.destination || "TBD"}\n` +
    `Dates: ${trip.start_date || "?"} to ${trip.end_date || "?"}\n` +
    `Status: ${trip.status || "planning"}\n` +
    `Budget: $${trip.budget_usd || "not set"}\n` +
    `Travelers: ${trip.travelers || 1}`
  );
}
