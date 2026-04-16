// Database Tool: Bookings
import { z } from "zod";
import * as db from "@/memory/episodic/supabase-client";

export const bookingDbTools = {
  save_booking: {
    name: "save_booking",
    schema: z.object({
      userId: z.string(),
      tripId: z.string(),
      bookingData: z.record(z.unknown()),
    }),
    func: async (input: {
      userId: string;
      tripId: string;
      bookingData: Record<string, unknown>;
    }) => db.saveBooking(input.userId, input.tripId, input.bookingData),
  },
  get_booking: {
    name: "get_booking",
    schema: z.object({ bookingId: z.string(), userId: z.string() }),
    func: async (input: { bookingId: string; userId: string }) =>
      db.getBooking(input.bookingId, input.userId),
  },
  list_bookings: {
    name: "list_bookings",
    schema: z.object({ tripId: z.string(), userId: z.string() }),
    func: async (input: { tripId: string; userId: string }) =>
      db.listBookings(input.tripId, input.userId),
  },
  update_booking_status: {
    name: "update_booking_status",
    schema: z.object({ bookingId: z.string(), status: z.string() }),
    func: async (input: { bookingId: string; status: string }) =>
      db.updateBookingStatus(input.bookingId, input.status),
  },
};
