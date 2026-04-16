// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Intent Router
// Maps IntentType → AgentType for orchestrator routing.
// ═══════════════════════════════════════════════════════════

import type { IntentType, AgentType } from "@/lib/types";

/**
 * Route an intent to the appropriate agent type.
 */
export function routeToAgent(intent: IntentType): AgentType {
  const routeMap: Record<IntentType, AgentType> = {
    // Trip Planning — includes destination info, packing lists,
    // weather, visa checks (all trip-context queries)
    plan_trip: "trip-planner",
    modify_itinerary: "trip-planner",
    add_activity: "trip-planner",

    // Booking
    search_flights: "booking",
    search_hotels: "booking",
    book_flight: "booking",
    book_hotel: "booking",
    cancel_booking: "booking",

    // Import
    import_booking: "import",
    parse_pdf: "import",

    // Expenses
    add_expense: "expense",
    split_expense: "expense",
    settle_up: "expense",
    summarise_expenses: "expense",
    convert_currency: "expense",

    // Journal
    suggest_caption: "journal",
    enrich_entry: "journal",
    create_album: "journal",

    // Group
    create_poll: "group",
    check_availability: "group",
    send_group_update: "group",

    // Nudge
    nudge_setup: "nudge",
    send_reminder: "nudge",

    // Direct handling by orchestrator
    general_travel_q: "orchestrator",
    ambiguous: "orchestrator",
  };

  return routeMap[intent] || "orchestrator";
}
