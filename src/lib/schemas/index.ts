// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Zod Schemas
// Mirrors all TypeScript types for runtime validation
// ═══════════════════════════════════════════════════════════

import { z } from "zod";

// ── Intent Types ──────────────────────────────────────────
export const IntentTypeSchema = z.enum([
  "plan_trip",
  "modify_itinerary",
  "add_activity",
  "search_flights",
  "search_hotels",
  "book_flight",
  "book_hotel",
  "cancel_booking",
  "import_booking",
  "parse_pdf",
  "add_expense",
  "split_expense",
  "settle_up",
  "summarise_expenses",
  "convert_currency",
  "suggest_caption",
  "enrich_entry",
  "create_album",
  "create_poll",
  "check_availability",
  "send_group_update",
  "nudge_setup",
  "send_reminder",
  "general_travel_q",
  "ambiguous",
]);

// ── Agent Types ───────────────────────────────────────────
export const AgentTypeSchema = z.enum([
  "orchestrator",
  "trip-planner",
  "booking",
  "import",
  "expense",
  "journal",
  "group",
  "nudge",
]);

// ── Message ───────────────────────────────────────────────
export const ToolCallSchema = z.object({
  tool_name: z.string(),
  arguments: z.record(z.unknown()),
  agent_id: z.string(),
  task_id: z.string(),
});

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  tool_call_id: z.string().optional(),
  tool_calls: z.array(ToolCallSchema).optional(),
  timestamp: z.string(),
});

// ── Tool Result ───────────────────────────────────────────
export const ToolResultSchema = z.object({
  tool_name: z.string(),
  result: z.unknown(),
  error: z.string().optional(),
  latency_ms: z.number(),
  cached: z.boolean(),
});

// ── UI Hint ───────────────────────────────────────────────
export const UIHintSchema = z.object({
  action: z.enum([
    "show_trip_card",
    "show_booking_card",
    "show_poll",
    "show_expense_summary",
    "open_payment_sheet",
    "refresh_itinerary",
    "show_confirmation",
  ]),
  payload: z.record(z.unknown()),
});

// ── Pending Action ────────────────────────────────────────
export const PendingActionSchema = z.object({
  type: z.enum([
    "confirm_booking",
    "approve_expense",
    "vote_poll",
    "review_itinerary",
    "confirm_settlement",
  ]),
  data: z.record(z.unknown()),
  expires_at: z.string(),
});

// ── User Context ──────────────────────────────────────────
export const UserContextSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  travel_style: z.enum(["solo", "couple", "family", "group", "business"]),
  home_city: z.string(),
  home_airport: z.string(),
  currency: z.string(),
  preferences: z.array(z.string()),
  past_destinations: z.array(z.string()),
  writing_style_sample: z.string(),
});

// ── Agent Session ─────────────────────────────────────────
export const AgentSessionSchema = z.object({
  session_id: z.string().uuid(),
  user_id: z.string(),
  active_trip_id: z.string().nullable(),
  conversation: z.array(MessageSchema),
  intent_stack: z.array(IntentTypeSchema),
  pending_action: PendingActionSchema.nullable(),
  user_context: UserContextSchema,
  tool_results: z.array(ToolResultSchema),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Agent Task ────────────────────────────────────────────
export const AgentTaskSchema = z.object({
  task_id: z.string().uuid(),
  type: IntentTypeSchema,
  payload: z.record(z.unknown()),
  context: AgentSessionSchema,
  user_id: z.string(),
  session_id: z.string(),
  complexity: z.enum(["low", "medium", "high"]),
  requiresVision: z.boolean(),
  latencyBudgetMs: z.number().positive(),
});

// ── Agent Error ───────────────────────────────────────────
export const AgentErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  retryable: z.boolean(),
  user_message: z.string(),
  recovery_action: z.string().optional(),
});

// ── Agent Result ──────────────────────────────────────────
export const AgentResultSchema = z.object({
  task_id: z.string(),
  agent_type: AgentTypeSchema,
  status: z.enum(["success", "error", "needs_clarification"]),
  data: z.record(z.unknown()),
  confidence: z.number().min(0).max(1),
  error: AgentErrorSchema.optional(),
  ui_hints: z.array(UIHintSchema).optional(),
  tokens_used: z.number().optional(),
  latency_ms: z.number().optional(),
});

// ── Intent Classification ─────────────────────────────────
export const IntentEntitiesSchema = z.object({
  destination: z.string().nullable(),
  dates: z.array(z.string()).nullable(),
  party_size: z.number().nullable(),
  budget: z.string().nullable(),
  interests: z.array(z.string()).nullable(),
  trip_id: z.string().nullable(),
});

export const IntentClassificationSchema = z.object({
  intent: IntentTypeSchema,
  confidence: z.number().min(0).max(1),
  entities: IntentEntitiesSchema,
  needs_clarification: z.boolean(),
  clarification_question: z.string().nullable(),
});

// ── Memory Record ─────────────────────────────────────────
export const MemoryRecordSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  content: z.string(),
  type: z.enum(["preference", "constraint", "trip_summary", "writing_style"]),
  trip_id: z.string().optional(),
  timestamp: z.string(),
});

// ── Consolidated Memory ───────────────────────────────────
export const ConsolidatedMemorySchema = z.object({
  preferences: z.array(z.string()),
  constraints: z.array(z.string()),
  writing_style_description: z.string(),
  key_decisions: z.array(z.string()),
  destinations_mentioned: z.array(z.string()),
  budget_indicators: z.enum(["budget", "mid-range", "luxury", "unknown"]),
});

// ── Stream Chunk ──────────────────────────────────────────
export const StreamChunkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), content: z.string() }),
  z.object({ type: z.literal("thinking"), label: z.string() }),
  z.object({
    type: z.literal("tool_start"),
    tool: z.string(),
    label: z.string(),
  }),
  z.object({ type: z.literal("tool_done"), tool: z.string() }),
  z.object({
    type: z.literal("ui_hint"),
    action: z.string(),
    payload: z.record(z.unknown()),
  }),
  z.object({ type: z.literal("error"), code: z.string(), message: z.string() }),
  z.object({ type: z.literal("done") }),
]);

// ── Attachment ────────────────────────────────────────────
export const AttachmentSchema = z.object({
  type: z.enum(["image", "pdf", "email"]),
  url: z.string().url(),
  mime_type: z.string(),
  filename: z.string().optional(),
});

// ── Booking Schemas ───────────────────────────────────────
export const FlightSegmentSchema = z.object({
  departure_airport: z.string(),
  arrival_airport: z.string(),
  departure_time: z.string(),
  arrival_time: z.string(),
  carrier: z.string(),
  flight_number: z.string(),
  duration: z.string(),
});

export const FlightOfferSchema = z.object({
  offer_id: z.string(),
  airline: z.string(),
  airline_code: z.string(),
  departure: z.string(),
  arrival: z.string(),
  duration: z.string(),
  stops: z.number(),
  price: z.number(),
  currency: z.string(),
  cabin_class: z.string(),
  segments: z.array(FlightSegmentSchema),
});

export const HotelOfferSchema = z.object({
  offer_id: z.string(),
  hotel_name: z.string(),
  hotel_id: z.string(),
  rating: z.number(),
  address: z.string(),
  price_per_night: z.number(),
  total_price: z.number(),
  currency: z.string(),
  room_type: z.string(),
  cancellation_policy: z.string(),
  check_in: z.string(),
  check_out: z.string(),
});

export const TravelerSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  date_of_birth: z.string(),
  email: z.string().email(),
  phone: z.string(),
  passport_number: z.string().optional(),
});

export const GuestSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

// ── Partial Booking (Import) ──────────────────────────────
export const PartialBookingSchema = z.object({
  type: z.enum(["flight", "hotel", "experience", "car"]),
  provider: z.string(),
  reference: z.string(),
  traveler_name: z.string(),
  from: z.string(),
  to: z.string(),
  start_datetime: z.string(),
  end_datetime: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["confirmed", "pending"]),
  confidence: z.record(z.number()),
  needs_review: z.boolean(),
});

// ── Trip & Itinerary ──────────────────────────────────────
export const TripSchema = z.object({
  trip_id: z.string(),
  user_id: z.string(),
  destination: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum([
    "planning",
    "booked",
    "in_progress",
    "completed",
    "cancelled",
  ]),
  budget_usd: z.number(),
  travelers: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ActivitySchema = z.object({
  activity_id: z.string(),
  day_id: z.string(),
  name: z.string(),
  category: z.enum([
    "flight",
    "hotel",
    "experience",
    "restaurant",
    "transport",
    "note",
  ]),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string(),
  notes: z.string(),
  estimated_cost_usd: z.number(),
  order: z.number(),
});

export const ItineraryDaySchema = z.object({
  day_id: z.string(),
  trip_id: z.string(),
  day_number: z.number(),
  date: z.string(),
  theme: z.string(),
  activities: z.array(ActivitySchema),
});

// ── Expense ───────────────────────────────────────────────
export const ExpenseSplitSchema = z.object({
  user_id: z.string(),
  amount: z.number(),
  settled: z.boolean(),
});

export const ExpenseSchema = z.object({
  expense_id: z.string(),
  trip_id: z.string(),
  user_id: z.string(),
  title: z.string(),
  amount: z.number(),
  currency: z.string(),
  usd_equivalent: z.number(),
  category: z.enum([
    "accommodation",
    "transport",
    "food",
    "activities",
    "shopping",
    "health",
    "communication",
    "other",
  ]),
  paid_by: z.string(),
  split_type: z.enum(["equal", "custom", "item"]),
  splits: z.array(ExpenseSplitSchema),
  settled: z.boolean(),
  created_at: z.string(),
});

export const BalanceSchema = z.object({
  user_id: z.string(),
  name: z.string(),
  net_balance: z.number(),
  currency: z.string(),
});

// ── Journal ───────────────────────────────────────────────
export const JournalEntrySchema = z.object({
  entry_id: z.string(),
  user_id: z.string(),
  trip_id: z.string(),
  title: z.string(),
  content: z.string(),
  photos: z.array(z.string()),
  location: z.string(),
  mood: z.string(),
  visibility: z.enum(["public", "private", "friends"]),
  created_at: z.string(),
  updated_at: z.string(),
});

// ── Group & Polls ─────────────────────────────────────────
export const PollSchema = z.object({
  poll_id: z.string(),
  trip_id: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  created_by: z.string(),
  deadline: z.string(),
  status: z.enum(["active", "closed"]),
  created_at: z.string(),
});

export const VoteCountSchema = z.object({
  option: z.string(),
  count: z.number(),
  voters: z.array(z.string()),
});

// ── Rate Limit ────────────────────────────────────────────
export const RateLimitResultSchema = z.object({
  allowed: z.boolean(),
  remaining: z.number(),
  resetAt: z.string(),
});

export const CostLimitResultSchema = z.object({
  allowed: z.boolean(),
  spent: z.number(),
  limit: z.number(),
});

// ── Health ────────────────────────────────────────────────
export const HealthStatusSchema = z.object({
  status: z.enum(["healthy", "degraded", "unhealthy"]),
  services: z.record(z.enum(["ok", "error"])),
  timestamp: z.string(),
});
