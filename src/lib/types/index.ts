// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Complete Type System
// All TypeScript interfaces for the AI Agent framework
// ═══════════════════════════════════════════════════════════

// ── Intent Types ──────────────────────────────────────────
export type IntentType =
  | "plan_trip"
  | "modify_itinerary"
  | "add_activity"
  | "search_flights"
  | "search_hotels"
  | "book_flight"
  | "book_hotel"
  | "cancel_booking"
  | "import_booking"
  | "parse_pdf"
  | "add_expense"
  | "split_expense"
  | "settle_up"
  | "summarise_expenses"
  | "convert_currency"
  | "suggest_caption"
  | "enrich_entry"
  | "create_album"
  | "create_poll"
  | "check_availability"
  | "send_group_update"
  | "nudge_setup"
  | "send_reminder"
  | "general_travel_q"
  | "ambiguous";

// ── Agent Types ───────────────────────────────────────────
export type AgentType =
  | "orchestrator"
  | "trip-planner"
  | "booking"
  | "import"
  | "expense"
  | "journal"
  | "group"
  | "nudge";

// ── Core Message ──────────────────────────────────────────
export interface Message {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  tool_call_id?: string;
  tool_calls?: ToolCall[];
  timestamp: string;
}

// ── Agent Session ─────────────────────────────────────────
export interface AgentSession {
  session_id: string;
  user_id: string;
  active_trip_id: string | null;
  conversation: Message[];
  intent_stack: IntentType[];
  pending_action: PendingAction | null;
  user_context: UserContext;
  tool_results: ToolResult[];
  created_at: string;
  updated_at: string;
}

// ── Agent Task ────────────────────────────────────────────
export interface AgentTask {
  task_id: string;
  type: IntentType;
  payload: Record<string, unknown>;
  context: AgentSession;
  user_id: string;
  session_id: string;
  complexity: "low" | "medium" | "high";
  requiresVision: boolean;
  latencyBudgetMs: number;
}

// ── Agent Result ──────────────────────────────────────────
export interface AgentResult {
  task_id: string;
  agent_type: AgentType;
  status: "success" | "error" | "needs_clarification";
  data: Record<string, unknown>;
  confidence: number;
  error?: AgentError;
  ui_hints?: UIHint[];
  tokens_used?: number;
  latency_ms?: number;
}

// ── Tool Call & Result ────────────────────────────────────
export interface ToolCall {
  tool_name: string;
  arguments: Record<string, unknown>;
  agent_id: string;
  task_id: string;
}

export interface ToolResult {
  tool_name: string;
  result: unknown;
  error?: string;
  latency_ms: number;
  cached: boolean;
}

// ── UI Hints ──────────────────────────────────────────────
export interface UIHint {
  action:
    | "show_trip_card"
    | "show_booking_card"
    | "show_poll"
    | "show_expense_summary"
    | "open_payment_sheet"
    | "refresh_itinerary"
    | "show_confirmation";
  payload: Record<string, unknown>;
}

// ── Pending Action ────────────────────────────────────────
export interface PendingAction {
  type:
    | "confirm_booking"
    | "approve_expense"
    | "vote_poll"
    | "review_itinerary"
    | "confirm_settlement";
  data: Record<string, unknown>;
  expires_at: string;
}

// ── User Context ──────────────────────────────────────────
export interface UserContext {
  user_id: string;
  name: string;
  travel_style: "solo" | "couple" | "family" | "group" | "business";
  home_city: string;
  home_airport: string;
  currency: string;
  preferences: string[];
  past_destinations: string[];
  writing_style_sample: string;
}

// ── Agent Error ───────────────────────────────────────────
export interface AgentError {
  code: string;
  message: string;
  retryable: boolean;
  user_message: string;
  recovery_action?: string;
}

// ── Intent Classification ─────────────────────────────────
export interface IntentClassification {
  intent: IntentType;
  confidence: number;
  entities: IntentEntities;
  needs_clarification: boolean;
  clarification_question: string | null;
}

export interface IntentEntities {
  destination: string | null;
  dates: string[] | null;
  party_size: number | null;
  budget: string | null;
  interests: string[] | null;
  trip_id: string | null;
}

// ── Memory Record ─────────────────────────────────────────
export interface MemoryRecord {
  id: string;
  user_id: string;
  content: string;
  type: "preference" | "constraint" | "trip_summary" | "writing_style";
  trip_id?: string;
  timestamp: string;
}

// ── Memory Consolidation ──────────────────────────────────
export interface ConsolidatedMemory {
  preferences: string[];
  constraints: string[];
  writing_style_description: string;
  key_decisions: string[];
  destinations_mentioned: string[];
  budget_indicators: "budget" | "mid-range" | "luxury" | "unknown";
}

// ── Stream Chunks ─────────────────────────────────────────
export type StreamChunk =
  | { type: "text"; content: string }
  | { type: "thinking"; label: string }
  | { type: "tool_start"; tool: string; label: string }
  | { type: "tool_done"; tool: string }
  | { type: "ui_hint"; action: string; payload: Record<string, unknown> }
  | { type: "error"; code: string; message: string }
  | { type: "done" };

// ── Attachment ────────────────────────────────────────────
export interface Attachment {
  type: "image" | "pdf" | "email";
  url: string;
  mime_type: string;
  filename?: string;
}

// ── Transport Mode ────────────────────────────────────────
export type TransportMode = "driving" | "walking" | "cycling" | "transit";

// ── Expense Category ──────────────────────────────────────
export type ExpenseCategory =
  | "accommodation"
  | "transport"
  | "food"
  | "activities"
  | "shopping"
  | "health"
  | "communication"
  | "other";

// ── Booking Types ─────────────────────────────────────────
export interface FlightOffer {
  offer_id: string;
  airline: string;
  airline_code: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  cabin_class: string;
  segments: FlightSegment[];
}

export interface FlightSegment {
  departure_airport: string;
  arrival_airport: string;
  departure_time: string;
  arrival_time: string;
  carrier: string;
  flight_number: string;
  duration: string;
}

export interface HotelOffer {
  offer_id: string;
  hotel_name: string;
  hotel_id: string;
  rating: number;
  address: string;
  price_per_night: number;
  total_price: number;
  currency: string;
  room_type: string;
  cancellation_policy: string;
  check_in: string;
  check_out: string;
}

export interface Traveler {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  email: string;
  phone: string;
  passport_number?: string;
}

export interface Guest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export type FlightStatus =
  | "on_time"
  | "delayed"
  | "cancelled"
  | "diverted"
  | "landed"
  | "unknown";

// ── Partial Booking (Import) ──────────────────────────────
export interface PartialBooking {
  type: "flight" | "hotel" | "experience" | "car";
  provider: string;
  reference: string;
  traveler_name: string;
  from: string;
  to: string;
  start_datetime: string;
  end_datetime: string;
  amount: number;
  currency: string;
  status: "confirmed" | "pending";
  confidence: Record<string, number>;
  needs_review: boolean;
}

// ── Trip & Itinerary ──────────────────────────────────────
export interface Trip {
  trip_id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: "planning" | "booked" | "in_progress" | "completed" | "cancelled";
  budget_usd: number;
  travelers: number;
  created_at: string;
  updated_at: string;
}

export interface ItineraryDay {
  day_id: string;
  trip_id: string;
  day_number: number;
  date: string;
  theme: string;
  activities: Activity[];
}

export interface Activity {
  activity_id: string;
  day_id: string;
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
}

// ── Expense ───────────────────────────────────────────────
export interface Expense {
  expense_id: string;
  trip_id: string;
  user_id: string;
  title: string;
  amount: number;
  currency: string;
  usd_equivalent: number;
  category: ExpenseCategory;
  paid_by: string;
  split_type: "equal" | "custom" | "item";
  splits: ExpenseSplit[];
  settled: boolean;
  created_at: string;
}

export interface ExpenseSplit {
  user_id: string;
  amount: number;
  settled: boolean;
}

export interface Balance {
  user_id: string;
  name: string;
  net_balance: number;
  currency: string;
}

// ── Journal ───────────────────────────────────────────────
export interface JournalEntry {
  entry_id: string;
  user_id: string;
  trip_id: string;
  title: string;
  content: string;
  photos: string[];
  location: string;
  mood: string;
  visibility: "public" | "private" | "friends";
  created_at: string;
  updated_at: string;
}

// ── Group & Polls ─────────────────────────────────────────
export interface Poll {
  poll_id: string;
  trip_id: string;
  question: string;
  options: string[];
  created_by: string;
  deadline: string;
  status: "active" | "closed";
  created_at: string;
}

export interface VoteCount {
  option: string;
  count: number;
  voters: string[];
}

// ── Notifications ─────────────────────────────────────────
export interface Notification {
  notification_id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  action_url?: string;
  read: boolean;
  created_at: string;
}

// ── Rate Limit ────────────────────────────────────────────
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

export interface CostLimitResult {
  allowed: boolean;
  spent: number;
  limit: number;
}

// ── Weather ───────────────────────────────────────────────
export interface WeatherDay {
  date: string;
  temp_high: number;
  temp_low: number;
  condition: string;
  icon: string;
  precipitation_chance: number;
}

// ── Opening Hours ─────────────────────────────────────────
export interface OpeningHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// ── POI (Point of Interest) ───────────────────────────────
export interface POI {
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  rating: number;
  description: string;
}

// ── Experience ────────────────────────────────────────────
export interface Experience {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  rating: number;
  duration: string;
  category: string;
  bookable: boolean;
}

// ── Cost Summary ──────────────────────────────────────────
export interface CostSummary {
  user_id: string;
  date: string;
  total_cost: number;
  breakdown: {
    model: string;
    tokens: number;
    cost: number;
  }[];
}

// ── Health Check ──────────────────────────────────────────
export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  services: Record<string, "ok" | "error">;
  timestamp: string;
}

// ── Conflict Warning ──────────────────────────────────────
export interface ConflictWarning {
  type: "time_overlap" | "travel_time_impossible" | "closed_venue";
  activities: string[];
  message: string;
  suggestion: string;
}
