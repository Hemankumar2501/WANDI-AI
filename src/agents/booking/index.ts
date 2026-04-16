// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Booking Agent
// Two-phase booking: Search → Confirm+Pay → Book → Notify.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, AgentResult } from "@/lib/types";
import { amadeusFlightSearch } from "@/tools/booking/flight-search";
import { amadeusHotelSearch } from "@/tools/booking/hotel-search";
import { loadPrompt } from "@/prompts/registry";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("BookingAgent");

export class BookingAgent {
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      log.info("Processing booking request", { type: task.type });

      const entities = (task.payload.entities as Record<string, unknown>) || {};
      const message = (task.payload.message as string) || "";

      switch (task.type) {
        case "search_flights":
          return this.searchFlights(task, entities);
        case "search_hotels":
          return this.searchHotels(task, entities);
        case "book_flight":
        case "book_hotel":
          return {
            task_id: task.task_id,
            agent_type: "booking",
            status: "needs_clarification",
            data: {
              response:
                "Please confirm the booking details and I'll proceed with payment.",
            },
            confidence: 0.8,
            latency_ms: Date.now() - startTime,
          };
        case "cancel_booking":
          return {
            task_id: task.task_id,
            agent_type: "booking",
            status: "needs_clarification",
            data: {
              response:
                "Which booking would you like to cancel? Please share the booking reference.",
            },
            confidence: 0.7,
            latency_ms: Date.now() - startTime,
          };
        default:
          return {
            task_id: task.task_id,
            agent_type: "booking",
            status: "error",
            data: {},
            confidence: 0,
            error: {
              code: "UNSUPPORTED_BOOKING_TYPE",
              message: `Unsupported: ${task.type}`,
              retryable: false,
              user_message:
                "I can help with flights and hotels. What would you like to search for?",
            },
          };
      }
    } catch (error) {
      log.error("Booking agent failed", error);
      return {
        task_id: task.task_id,
        agent_type: "booking",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "BOOKING_FAILED",
          message: String(error),
          retryable: true,
          user_message:
            "Booking service is temporarily unavailable. Please try again.",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  private async searchFlights(
    task: AgentTask,
    entities: Record<string, unknown>,
  ): Promise<AgentResult> {
    const result = await amadeusFlightSearch({
      origin: (entities.origin as string) || "LHR",
      destination: (entities.destination as string) || "",
      date:
        ((entities.dates as string[]) || [])[0] ||
        new Date().toISOString().split("T")[0],
      adults: (entities.party_size as number) || 1,
    });

    const response =
      result.flights.length > 0
        ? `Found ${result.count} flights. Here are the top 3:\n\n` +
          result.flights
            .map(
              (f, i) =>
                `**Option ${i + 1}**: ${f.airline} — $${f.price} ${f.currency}\n` +
                `  📍 ${f.segments[0]?.departure_airport} → ${f.segments[f.segments.length - 1]?.arrival_airport}\n` +
                `  ⏱ Duration: ${f.duration} | Stops: ${f.stops}\n`,
            )
            .join("\n")
        : "No flights found for those dates. Try different dates or airports?";

    return {
      task_id: task.task_id,
      agent_type: "booking",
      status: "success",
      data: { response, flights: result.flights },
      confidence: 0.9,
      ui_hints:
        result.flights.length > 0
          ? [
              {
                action: "show_booking_card",
                payload: { type: "flight", options: result.flights },
              },
            ]
          : [],
      latency_ms: 0,
    };
  }

  private async searchHotels(
    task: AgentTask,
    entities: Record<string, unknown>,
  ): Promise<AgentResult> {
    const dates = (entities.dates as string[]) || [];
    const result = await amadeusHotelSearch({
      cityCode:
        (entities.destination as string)?.substring(0, 3).toUpperCase() ||
        "PAR",
      checkIn: dates[0] || new Date().toISOString().split("T")[0],
      checkOut:
        dates[1] ||
        new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      adults: (entities.party_size as number) || 1,
      roomQuantity: 1,
    });

    const response =
      result.hotels.length > 0
        ? `Found ${result.count} hotels. Here are the top options:\n\n` +
          result.hotels
            .map(
              (h, i) =>
                `**Option ${i + 1}**: ${h.hotel_name} ⭐${h.rating}\n` +
                `  💰 $${h.price_per_night}/night (Total: $${h.total_price})\n` +
                `  📋 ${h.cancellation_policy}\n`,
            )
            .join("\n")
        : "No hotels found. Try different dates or location?";

    return {
      task_id: task.task_id,
      agent_type: "booking",
      status: "success",
      data: { response, hotels: result.hotels },
      confidence: 0.85,
      ui_hints:
        result.hotels.length > 0
          ? [
              {
                action: "show_booking_card",
                payload: { type: "hotel", options: result.hotels },
              },
            ]
          : [],
    };
  }
}
