// Database Tool: Trips
import { z } from "zod";
import * as db from "@/memory/episodic/supabase-client";

export const tripTools = {
  create_trip: {
    name: "create_trip",
    schema: z.object({
      userId: z.string(),
      destination: z.string(),
      start_date: z.string(),
      end_date: z.string(),
      budget_usd: z.number(),
      travelers: z.number(),
    }),
    func: async (input: {
      userId: string;
      destination: string;
      start_date: string;
      end_date: string;
      budget_usd: number;
      travelers: number;
    }) =>
      db.createTrip(input.userId, {
        destination: input.destination,
        start_date: input.start_date,
        end_date: input.end_date,
        status: "planning",
        budget_usd: input.budget_usd,
        travelers: input.travelers,
      }),
  },
  get_trip: {
    name: "get_trip",
    schema: z.object({ tripId: z.string(), userId: z.string() }),
    func: async (input: { tripId: string; userId: string }) =>
      db.getTrip(input.tripId, input.userId),
  },
  list_trips: {
    name: "list_trips",
    schema: z.object({ userId: z.string(), status: z.string().optional() }),
    func: async (input: { userId: string; status?: string }) =>
      db.listTrips(input.userId, input.status as never),
  },
  update_trip: {
    name: "update_trip",
    schema: z.object({
      tripId: z.string(),
      userId: z.string(),
      updates: z.record(z.unknown()),
    }),
    func: async (input: {
      tripId: string;
      userId: string;
      updates: Record<string, unknown>;
    }) => db.updateTrip(input.tripId, input.userId, input.updates as never),
  },
  delete_trip: {
    name: "delete_trip",
    schema: z.object({ tripId: z.string(), userId: z.string() }),
    func: async (input: { tripId: string; userId: string }) =>
      db.deleteTrip(input.tripId, input.userId),
  },
};
