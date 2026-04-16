// Database Tool: Itinerary
import { z } from "zod";
import * as db from "@/memory/episodic/supabase-client";

export const itineraryTools = {
  create_itinerary_days: {
    name: "create_itinerary_days",
    schema: z.object({
      tripId: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    }),
    func: async (input: {
      tripId: string;
      startDate: string;
      endDate: string;
    }) => db.createItineraryDays(input.tripId, input.startDate, input.endDate),
  },
  add_activity: {
    name: "add_activity",
    schema: z.object({
      dayId: z.string(),
      name: z.string(),
      category: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      location: z.string(),
      notes: z.string(),
      estimated_cost_usd: z.number(),
      order: z.number(),
    }),
    func: async (input: {
      dayId: string;
      name: string;
      category:
        | "flight"
        | "hotel"
        | "experience"
        | "restaurant"
        | "transport"
        | "note";
      start_time: string;
      end_time: string;
      location: string;
      notes: string;
      estimated_cost_usd: number;
      order: number;
    }) => {
      const { dayId, ...rest } = input;
      return db.addActivity(dayId, rest);
    },
  },
  update_activity: {
    name: "update_activity",
    schema: z.object({
      activityId: z.string(),
      updates: z.record(z.unknown()),
    }),
    func: async (input: {
      activityId: string;
      updates: Record<string, unknown>;
    }) => db.updateActivity(input.activityId, input.updates as never),
  },
  reorder_activities: {
    name: "reorder_activities",
    schema: z.object({ dayId: z.string(), orderedIds: z.array(z.string()) }),
    func: async (input: { dayId: string; orderedIds: string[] }) =>
      db.reorderActivities(input.dayId, input.orderedIds),
  },
  delete_activity: {
    name: "delete_activity",
    schema: z.object({ activityId: z.string() }),
    func: async (input: { activityId: string }) =>
      db.deleteActivity(input.activityId),
  },
};
