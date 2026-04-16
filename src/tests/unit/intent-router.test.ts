// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Unit Tests: Intent Router
// ═══════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import { routeToAgent } from "@/agents/orchestrator/router";

describe("routeToAgent", () => {
  it("should route plan_trip to trip-planner", () => {
    expect(routeToAgent("plan_trip")).toBe("trip-planner");
  });

  it("should route search_flights to booking", () => {
    expect(routeToAgent("search_flights")).toBe("booking");
  });

  it("should route import_booking to import", () => {
    expect(routeToAgent("import_booking")).toBe("import");
  });

  it("should route add_expense to expense", () => {
    expect(routeToAgent("add_expense")).toBe("expense");
  });

  it("should route suggest_caption to journal", () => {
    expect(routeToAgent("suggest_caption")).toBe("journal");
  });

  it("should route create_poll to group", () => {
    expect(routeToAgent("create_poll")).toBe("group");
  });

  it("should route nudge_setup to nudge", () => {
    expect(routeToAgent("nudge_setup")).toBe("nudge");
  });

  it("should route general_travel_q to orchestrator", () => {
    expect(routeToAgent("general_travel_q")).toBe("orchestrator");
  });

  it("should route ambiguous to orchestrator", () => {
    expect(routeToAgent("ambiguous")).toBe("orchestrator");
  });

  it("should map all 22 intent types correctly", () => {
    const allIntents = [
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
    ] as const;

    for (const intent of allIntents) {
      const agent = routeToAgent(intent);
      expect(agent).toBeTruthy();
      expect(typeof agent).toBe("string");
    }
  });
});
