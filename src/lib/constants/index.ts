// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Constants
// Central configuration values for the agent system.
// ═══════════════════════════════════════════════════════════

// ── Rate Limits ───────────────────────────────────────────
export const RATE_LIMITS = {
  /** Maximum requests per user per hour */
  MAX_REQUESTS_PER_HOUR: 50,
  /** Maximum AI spend per user per day in USD */
  MAX_DAILY_COST_USD: 100.0,
  /** Maximum booking attempts per user per hour */
  MAX_BOOKING_ATTEMPTS_PER_HOUR: 5,
  /** Sliding window size in milliseconds (1 hour) */
  REQUEST_WINDOW_MS: 3600000,
} as const;

// ── Session Configuration ─────────────────────────────────
export const SESSION_CONFIG = {
  /** Session TTL in seconds (24 hours) */
  TTL_SECONDS: 86400,
  /** Maximum conversation messages before summarisation */
  MAX_CONVERSATION_LENGTH: 50,
  /** Redis key prefix for sessions */
  KEY_PREFIX: "session:",
} as const;

// ── Model Configuration (100% Free via Gemini) ───────────────
export const MODEL_CONFIG = {
  /** Default model for complex tasks */
  DEFAULT_MODEL: "gemini-2.0-flash",
  /** Model for classification and simple tasks */
  FAST_MODEL: "gemini-2.0-flash",
  /** Model for embeddings */
  EMBEDDING_MODEL: "text-embedding-004",
  /** Embedding dimensions */
  EMBEDDING_DIMENSIONS: 768,
  /** Maximum retries on parse errors */
  MAX_PARSE_RETRIES: 2,
  /** Default temperature for generation */
  DEFAULT_TEMPERATURE: 0.7,
  /** Temperature for classification (more deterministic) */
  CLASSIFICATION_TEMPERATURE: 0.1,
} as const;

// ── Pinecone Configuration ────────────────────────────────
export const PINECONE_CONFIG = {
  /** Default top-K for memory retrieval */
  DEFAULT_TOP_K: 5,
  /** Minimum similarity score to include a result */
  MIN_SCORE_THRESHOLD: 0.7,
  /** Index name */
  INDEX_NAME: "wanderwiseai-memory",
} as const;

// ── Cache TTLs ────────────────────────────────────────────
export const CACHE_TTL = {
  /** Flight search results cache (5 minutes) */
  FLIGHT_SEARCH_SECONDS: 300,
  /** Hotel search results cache (5 minutes) */
  HOTEL_SEARCH_SECONDS: 300,
  /** Currency exchange rate cache (1 hour) */
  FX_RATE_SECONDS: 3600,
  /** Weather forecast cache (30 minutes) */
  WEATHER_SECONDS: 1800,
} as const;

// ── Agent Configuration ───────────────────────────────────
export const AGENT_CONFIG = {
  /** Default latency budget in ms */
  DEFAULT_LATENCY_BUDGET_MS: 10000,
  /** Maximum parallel tool calls */
  MAX_PARALLEL_TOOLS: 5,
  /** Minimum confidence to auto-execute */
  MIN_AUTO_CONFIDENCE: 0.85,
  /** Confidence threshold for import auto-save */
  IMPORT_AUTO_SAVE_THRESHOLD: 0.8,
} as const;

// ── Notification Types ────────────────────────────────────
export const NUDGE_TYPES = [
  "checkin_reminder",
  "flight_delay_alert",
  "weather_warning",
  "packing_suggestion",
  "trip_countdown",
  "expense_unsettled",
] as const;

// ── Expense Categories ────────────────────────────────────
export const EXPENSE_CATEGORIES = [
  "accommodation",
  "transport",
  "food",
  "activities",
  "shopping",
  "health",
  "communication",
  "other",
] as const;

// ── Prompt Versions ───────────────────────────────────────
export const PROMPT_VERSION = "v1" as const;
