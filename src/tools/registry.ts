// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Tool Registry
// Central export file for all 30+ LangChain StructuredTools.
// ═══════════════════════════════════════════════════════════

// ── Travel Tools ──────────────────────────────────────────
export { searchDestinationInfoTool } from "@/tools/travel/search-destination";
export { getWeatherForecastTool } from "@/tools/travel/weather";
export { searchExperiencesTool } from "@/tools/travel/experiences";
export { getOpeningHoursTool } from "@/tools/travel/opening-hours";
export { calculateRouteTimeTool } from "@/tools/travel/route";

// ── Booking Tools ─────────────────────────────────────────
export { amadeusFlightSearchTool } from "@/tools/booking/flight-search";
export { amadeusHotelSearchTool } from "@/tools/booking/hotel-search";
export { amadeusFlightBookTool } from "@/tools/booking/flight-book";
export { amadeusHotelBookTool } from "@/tools/booking/hotel-book";
export { checkFlightStatusTool } from "@/tools/booking/flight-status";

// ── Payment Tools ─────────────────────────────────────────
export { stripeCreatePaymentIntentTool } from "@/tools/payments/create-intent";
export { stripeConfirmPaymentTool } from "@/tools/payments/confirm-payment";
export { stripeRefundTool } from "@/tools/payments/refund";

// ── Database Tools ────────────────────────────────────────
export { tripTools } from "@/tools/database/trips";
export { itineraryTools } from "@/tools/database/itinerary";
export { bookingDbTools } from "@/tools/database/bookings";
export { expenseDbTools } from "@/tools/database/expenses";
export { journalDbTools } from "@/tools/database/journal";

// ── AI Tools ──────────────────────────────────────────────
export { analysePhotoTool } from "@/tools/ai/analyse-photo";
export { extractEmailBookingTool } from "@/tools/ai/extract-booking";
export { extractPdfBookingTool } from "@/tools/ai/extract-pdf";

// ── Currency Tools ────────────────────────────────────────
export { fxConvertTool } from "@/tools/currency/convert";
export { categoriseExpenseTool } from "@/tools/currency/categorise-expense";

// ── Notification Tools ────────────────────────────────────
export { sendPushNotificationTool } from "@/tools/notifications/push";
export { sendEmailTool } from "@/tools/notifications/email";
export { createInAppNotificationTool } from "@/tools/notifications/in-app";

// ── Group Tools ───────────────────────────────────────────
export {
  createPollTool,
  tallyVotesTool,
  submitVoteTool,
} from "@/tools/group/poll";

// ── Tool Collection Helper ────────────────────────────────

/**
 * Get all tools for a specific agent type.
 */
export function getToolsForAgent(agentType: string) {
  const toolMap: Record<string, string[]> = {
    "trip-planner": [
      "search_destination_info",
      "get_weather_forecast",
      "search_experiences",
      "get_opening_hours",
      "calculate_route_time",
    ],
    booking: [
      "amadeus_flight_search",
      "amadeus_hotel_search",
      "amadeus_flight_book",
      "amadeus_hotel_book",
      "check_flight_status",
      "stripe_create_payment_intent",
      "stripe_confirm_payment",
    ],
    import: ["extract_email_booking", "extract_pdf_booking"],
    expense: ["categorise_expense", "fx_convert"],
    journal: ["analyse_photo"],
    group: ["create_poll", "tally_votes", "submit_vote"],
    nudge: [
      "check_flight_status",
      "get_weather_forecast",
      "send_push_notification",
      "send_email",
      "create_in_app_notification",
    ],
  };

  return toolMap[agentType] || [];
}
