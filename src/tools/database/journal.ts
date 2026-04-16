// Database Tool: Journal
import { z } from "zod";
import * as db from "@/memory/episodic/supabase-client";

export const journalDbTools = {
  save_journal_entry: {
    name: "save_journal_entry",
    schema: z.object({ userId: z.string(), entryData: z.record(z.unknown()) }),
    func: async (input: {
      userId: string;
      entryData: Record<string, unknown>;
    }) => db.saveJournalEntry(input.userId, input.entryData as never),
  },
  get_entries: {
    name: "get_entries",
    schema: z.object({
      userId: z.string(),
      filters: z.record(z.string()).optional(),
    }),
    func: async (input: { userId: string; filters?: Record<string, string> }) =>
      db.getJournalEntries(input.userId, input.filters),
  },
  update_entry: {
    name: "update_entry",
    schema: z.object({
      entryId: z.string(),
      userId: z.string(),
      updates: z.record(z.unknown()),
    }),
    func: async (input: {
      entryId: string;
      userId: string;
      updates: Record<string, unknown>;
    }) =>
      db.updateJournalEntry(
        input.entryId,
        input.userId,
        input.updates as never,
      ),
  },
  delete_entry: {
    name: "delete_entry",
    schema: z.object({ entryId: z.string(), userId: z.string() }),
    func: async (input: { entryId: string; userId: string }) =>
      db.deleteJournalEntry(input.entryId, input.userId),
  },
};
