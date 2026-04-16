// Tool: Group Polls — create, tally, and submit votes
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/utils/logger";
import type { VoteCount } from "@/lib/types";

const log = createLogger("Tool:Poll");

function getSupabase() {
  return createClient(
    process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "",
  );
}

// ── Create Poll ───────────────────────────────────────────
export const createPollSchema = z.object({
  tripId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  createdBy: z.string(),
});

export async function createPoll(
  input: z.infer<typeof createPollSchema>,
): Promise<string> {
  try {
    log.info("Creating poll", { tripId: input.tripId });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("polls")
      .insert({
        trip_id: input.tripId,
        question: input.question,
        options: input.options,
        created_by: input.createdBy,
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: "active",
      })
      .select("poll_id")
      .single();
    if (error) throw error;
    return data.poll_id;
  } catch (error) {
    log.error("Poll creation failed", error);
    throw error;
  }
}

export const createPollTool = {
  name: "create_poll",
  description: "Create a new group poll",
  schema: createPollSchema,
  func: createPoll,
};

// ── Tally Votes ───────────────────────────────────────────
export const tallyVotesSchema = z.object({ pollId: z.string() });

export async function tallyVotes(
  input: z.infer<typeof tallyVotesSchema>,
): Promise<{ winner: string; votes: VoteCount[] }> {
  try {
    log.info("Tallying votes", { pollId: input.pollId });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("votes")
      .select("*")
      .eq("poll_id", input.pollId);
    if (error) throw error;

    const counts = new Map<string, { count: number; voters: string[] }>();
    for (const vote of data || []) {
      const entry = counts.get(vote.option) || { count: 0, voters: [] };
      entry.count++;
      entry.voters.push(vote.user_id);
      counts.set(vote.option, entry);
    }

    const votes: VoteCount[] = Array.from(counts.entries()).map(
      ([option, { count, voters }]) => ({ option, count, voters }),
    );
    votes.sort((a, b) => b.count - a.count);
    return { winner: votes[0]?.option || "No votes", votes };
  } catch (error) {
    log.error("Vote tally failed", error);
    throw error;
  }
}

export const tallyVotesTool = {
  name: "tally_votes",
  description: "Tally poll votes and determine winner",
  schema: tallyVotesSchema,
  func: tallyVotes,
};

// ── Submit Vote ───────────────────────────────────────────
export const submitVoteSchema = z.object({
  pollId: z.string(),
  userId: z.string(),
  option: z.string(),
});

export async function submitVote(
  input: z.infer<typeof submitVoteSchema>,
): Promise<void> {
  try {
    log.info("Submitting vote", { pollId: input.pollId });
    const supabase = getSupabase();
    await supabase
      .from("votes")
      .upsert(
        { poll_id: input.pollId, user_id: input.userId, option: input.option },
        { onConflict: "poll_id,user_id" },
      );
  } catch (error) {
    log.error("Vote submission failed", error);
    throw error;
  }
}

export const submitVoteTool = {
  name: "submit_vote",
  description: "Submit a vote in a group poll",
  schema: submitVoteSchema,
  func: submitVote,
};
