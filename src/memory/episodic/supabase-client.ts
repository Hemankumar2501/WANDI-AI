// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Episodic Memory (Supabase)
// Server-side Supabase client for structured data access.
// All queries scoped by user_id for RLS enforcement.
// ═══════════════════════════════════════════════════════════

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Trip,
  Activity,
  Expense,
  JournalEntry,
  ItineraryDay,
  ExpenseSplit,
  Balance,
} from "@/lib/types";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("SupabaseEpisodic");

// ── Supabase Client (service role — server-only) ──────────
let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

    supabase = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

// ── Trips ─────────────────────────────────────────────────

export async function createTrip(
  userId: string,
  tripData: Omit<Trip, "trip_id" | "user_id" | "created_at" | "updated_at">,
): Promise<string> {
  const client = getSupabase();
  const { data, error } = await client
    .from("trips")
    .insert({ ...tripData, user_id: userId })
    .select("trip_id")
    .single();

  if (error) {
    log.error("Failed to create trip", error, { userId });
    throw error;
  }

  log.info("Trip created", { tripId: data.trip_id, userId });
  return data.trip_id;
}

export async function getTrip(
  tripId: string,
  userId: string,
): Promise<Trip | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from("trips")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .single();

  if (error) {
    log.error("Failed to get trip", error, { tripId, userId });
    return null;
  }

  return data as Trip;
}

export async function updateTrip(
  tripId: string,
  userId: string,
  updates: Partial<Trip>,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("trips")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("trip_id", tripId)
    .eq("user_id", userId);

  if (error) {
    log.error("Failed to update trip", error, { tripId });
    throw error;
  }
}

export async function listTrips(
  userId: string,
  status?: Trip["status"],
): Promise<Trip[]> {
  const client = getSupabase();
  let query = client.from("trips").select("*").eq("user_id", userId);

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to list trips", error, { userId });
    return [];
  }

  return (data || []) as Trip[];
}

export async function deleteTrip(
  tripId: string,
  userId: string,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("trips")
    .delete()
    .eq("trip_id", tripId)
    .eq("user_id", userId);

  if (error) {
    log.error("Failed to delete trip", error, { tripId });
    throw error;
  }
}

// ── Itinerary Days ────────────────────────────────────────

export async function createItineraryDays(
  tripId: string,
  startDate: string,
  endDate: string,
): Promise<string[]> {
  const client = getSupabase();
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: {
    trip_id: string;
    day_number: number;
    date: string;
    theme: string;
  }[] = [];

  let dayNum = 1;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push({
      trip_id: tripId,
      day_number: dayNum++,
      date: d.toISOString().split("T")[0],
      theme: "",
    });
  }

  const { data, error } = await client
    .from("itinerary_days")
    .insert(days)
    .select("day_id");

  if (error) {
    log.error("Failed to create itinerary days", error, { tripId });
    throw error;
  }

  return (data || []).map((d: { day_id: string }) => d.day_id);
}

export async function addActivity(
  dayId: string,
  activity: Omit<Activity, "activity_id" | "day_id">,
): Promise<string> {
  const client = getSupabase();
  const { data, error } = await client
    .from("activities")
    .insert({ ...activity, day_id: dayId })
    .select("activity_id")
    .single();

  if (error) {
    log.error("Failed to add activity", error, { dayId });
    throw error;
  }

  return data.activity_id;
}

export async function updateActivity(
  activityId: string,
  updates: Partial<Activity>,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("activities")
    .update(updates)
    .eq("activity_id", activityId);

  if (error) {
    log.error("Failed to update activity", error, { activityId });
    throw error;
  }
}

export async function reorderActivities(
  dayId: string,
  orderedIds: string[],
): Promise<void> {
  const client = getSupabase();

  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await client
      .from("activities")
      .update({ order: i })
      .eq("activity_id", orderedIds[i])
      .eq("day_id", dayId);

    if (error) {
      log.error("Failed to reorder activity", error, {
        activityId: orderedIds[i],
      });
    }
  }
}

export async function deleteActivity(activityId: string): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("activities")
    .delete()
    .eq("activity_id", activityId);

  if (error) {
    log.error("Failed to delete activity", error, { activityId });
    throw error;
  }
}

// ── Bookings ──────────────────────────────────────────────

export async function saveBooking(
  userId: string,
  tripId: string,
  bookingData: Record<string, unknown>,
): Promise<string> {
  const client = getSupabase();
  const { data, error } = await client
    .from("bookings")
    .insert({ ...bookingData, user_id: userId, trip_id: tripId })
    .select("booking_id")
    .single();

  if (error) {
    log.error("Failed to save booking", error, { userId, tripId });
    throw error;
  }

  return data.booking_id;
}

export async function getBooking(
  bookingId: string,
  userId: string,
): Promise<Record<string, unknown> | null> {
  const client = getSupabase();
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("user_id", userId)
    .single();

  if (error) {
    log.error("Failed to get booking", error, { bookingId });
    return null;
  }

  return data;
}

export async function listBookings(
  tripId: string,
  userId: string,
): Promise<Record<string, unknown>[]> {
  const client = getSupabase();
  const { data, error } = await client
    .from("bookings")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to list bookings", error, { tripId });
    return [];
  }

  return data || [];
}

export async function updateBookingStatus(
  bookingId: string,
  status: string,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("bookings")
    .update({ status })
    .eq("booking_id", bookingId);

  if (error) {
    log.error("Failed to update booking status", error, { bookingId });
    throw error;
  }
}

// ── Expenses ──────────────────────────────────────────────

export async function addExpense(
  tripId: string,
  userId: string,
  expenseData: Omit<
    Expense,
    "expense_id" | "trip_id" | "user_id" | "created_at"
  >,
): Promise<string> {
  const client = getSupabase();
  const { data, error } = await client
    .from("expenses")
    .insert({ ...expenseData, trip_id: tripId, user_id: userId })
    .select("expense_id")
    .single();

  if (error) {
    log.error("Failed to add expense", error, { tripId });
    throw error;
  }

  return data.expense_id;
}

export async function getExpenses(
  tripId: string,
  userId: string,
): Promise<Expense[]> {
  const client = getSupabase();
  const { data, error } = await client
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to get expenses", error, { tripId });
    return [];
  }

  return (data || []) as Expense[];
}

export async function markSettled(expenseId: string): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("expenses")
    .update({ settled: true })
    .eq("expense_id", expenseId);

  if (error) {
    log.error("Failed to mark expense settled", error, { expenseId });
    throw error;
  }
}

export async function calculateBalances(tripId: string): Promise<Balance[]> {
  const client = getSupabase();
  const { data: expenses, error } = await client
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .eq("settled", false);

  if (error) {
    log.error("Failed to calculate balances", error, { tripId });
    return [];
  }

  // Calculate net balances per user
  const balanceMap = new Map<string, number>();

  for (const expense of expenses || []) {
    const paidBy = expense.paid_by;
    const splits: ExpenseSplit[] = expense.splits || [];

    // Person who paid gets credited
    const currentPaidBalance = balanceMap.get(paidBy) || 0;
    balanceMap.set(paidBy, currentPaidBalance + expense.amount);

    // Each person in the split gets debited
    for (const split of splits) {
      const currentOwedBalance = balanceMap.get(split.user_id) || 0;
      balanceMap.set(split.user_id, currentOwedBalance - split.amount);
    }
  }

  return Array.from(balanceMap.entries()).map(([userId, net]) => ({
    user_id: userId,
    name: "", // Will be populated by calling code
    net_balance: Math.round(net * 100) / 100,
    currency: "USD",
  }));
}

// ── Journal Entries ───────────────────────────────────────

export async function saveJournalEntry(
  userId: string,
  entryData: Omit<
    JournalEntry,
    "entry_id" | "user_id" | "created_at" | "updated_at"
  >,
): Promise<string> {
  const client = getSupabase();
  const { data, error } = await client
    .from("journal_entries")
    .insert({ ...entryData, user_id: userId })
    .select("entry_id")
    .single();

  if (error) {
    log.error("Failed to save journal entry", error, { userId });
    throw error;
  }

  return data.entry_id;
}

export async function getJournalEntries(
  userId: string,
  filters?: { trip_id?: string; visibility?: string },
): Promise<JournalEntry[]> {
  const client = getSupabase();
  let query = client.from("journal_entries").select("*").eq("user_id", userId);

  if (filters?.trip_id) {
    query = query.eq("trip_id", filters.trip_id);
  }
  if (filters?.visibility) {
    query = query.eq("visibility", filters.visibility);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    log.error("Failed to get journal entries", error, { userId });
    return [];
  }

  return (data || []) as JournalEntry[];
}

export async function updateJournalEntry(
  entryId: string,
  userId: string,
  updates: Partial<JournalEntry>,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("journal_entries")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("entry_id", entryId)
    .eq("user_id", userId);

  if (error) {
    log.error("Failed to update journal entry", error, { entryId });
    throw error;
  }
}

export async function deleteJournalEntry(
  entryId: string,
  userId: string,
): Promise<void> {
  const client = getSupabase();
  const { error } = await client
    .from("journal_entries")
    .delete()
    .eq("entry_id", entryId)
    .eq("user_id", userId);

  if (error) {
    log.error("Failed to delete journal entry", error, { entryId });
    throw error;
  }
}
