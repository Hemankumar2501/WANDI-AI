// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Trip Planner Agent
// Generates personalised itineraries using Gemini JSON mode.
// Supports both single-call and batched generation modes.
// Architecture inspired by travel-planner-ai.
// ═══════════════════════════════════════════════════════════

import type { AgentTask, AgentResult, ConflictWarning, Activity } from "@/lib/types";
import { loadPromptWithVariables } from "@/prompts/registry";
import { selectModel } from "@/lib/utils/model-selector";
import { createLogger } from "@/lib/utils/logger";
import { parseJsonResponse, withRetry } from "@/lib/utils/ai";
import {
  createTrip,
  createItineraryDays,
  addActivity,
} from "@/memory/episodic/supabase-client";
import {
  generateFullTripPlan,
} from "@/services/batched-trip-generator";
import type {
  FullTripPlan,
  TripGenerationInput,
  ItineraryDay,
} from "@/lib/schemas/trip-planner";

/** Map AI-generated categories to the DB Activity category type. */
function mapCategory(aiCategory: string): Activity["category"] {
  const mapping: Record<string, Activity["category"]> = {
    food: "restaurant",
    restaurant: "restaurant",
    accommodation: "hotel",
    hotel: "hotel",
    shopping: "experience",
    transport: "transport",
    experience: "experience",
    flight: "flight",
    note: "note",
  };
  return mapping[aiCategory] || "experience";
}

const log = createLogger("TripPlannerAgent");

export class TripPlannerAgent {
  /**
   * Main execution entry point.
   * Detects whether the user provided structured trip params
   * (destination, dates, preferences) and routes to the
   * optimal generation strategy.
   */
  async execute(task: AgentTask): Promise<AgentResult> {
    const startTime = Date.now();

    try {
      log.info("Generating itinerary", { taskId: task.task_id });

      const userMessage = (task.payload.message as string) || "";
      const entities =
        (task.payload.entities as Record<string, unknown>) || {};

      // If we have structured entities from the intent classifier,
      // use the faster batched generation path (3 parallel API calls).
      const destination =
        (entities.destination as string) || this.extractDestination(userMessage);
      const hasStructuredInput = !!destination;

      let itinerary: FullTripPlan;

      if (hasStructuredInput) {
        // ── Batched Path (3 parallel calls) ──────────────
        itinerary = await this.executeBatched(
          destination,
          userMessage,
          entities,
        );
      } else {
        // ── Single-call Path (original) ──────────────────
        itinerary = await this.executeSingleCall(task, userMessage, entities);
      }

      // Validate dates to prevent infinity loops or crashes
      const startDateStr =
        itinerary.start_date || (entities.start_date as string) || "";
      const endDateStr =
        itinerary.end_date || (entities.end_date as string) || "";
      const validStart = new Date(startDateStr).getTime();
      const validEnd = new Date(endDateStr).getTime();
      const hasValidDates =
        !isNaN(validStart) && !isNaN(validEnd) && validStart <= validEnd;

      // ── Save to Supabase ────────────────────────────────
      let tripId: string | undefined;
      try {
        tripId = await createTrip(task.user_id, {
          destination: itinerary.destination || "",
          start_date: itinerary.start_date || "",
          end_date: itinerary.end_date || "",
          status: "planning",
          budget_usd: itinerary.estimated_total_cost_usd || 0,
          travelers: (entities.party_size as number) || 1,
        });

        if (itinerary.days && hasValidDates) {
          const dayIds = await createItineraryDays(
            tripId,
            startDateStr,
            endDateStr,
          );

          for (
            let i = 0;
            i < itinerary.days.length && i < dayIds.length;
            i++
          ) {
            const day = itinerary.days[i];
            for (let j = 0; j < (day.activities || []).length; j++) {
              const activity = day.activities[j];
              await addActivity(dayIds[i], {
                name: activity.name,
                category: mapCategory(activity.category || "experience"),
                start_time: activity.start_time || "",
                end_time: activity.end_time || "",
                location: activity.location || "",
                notes: activity.notes || "",
                estimated_cost_usd: activity.estimated_cost_usd || 0,
                order: j,
              });
            }
          }
        }
      } catch (dbError) {
        log.warn("Failed to save trip to DB, returning itinerary anyway", {
          error: dbError,
        });
      }

      // ── Detect Conflicts ────────────────────────────────
      const conflicts = this.detectConflicts(
        (itinerary.days || []) as ItineraryDay[],
      );

      // ── Format Response ─────────────────────────────────
      const responseText = this.formatItineraryResponse(itinerary, conflicts);

      return {
        task_id: task.task_id,
        agent_type: "trip-planner",
        status: "success",
        data: {
          response: responseText,
          itinerary,
          trip_id: tripId,
        },
        confidence: 0.9,
        ui_hints: [
          {
            action: "show_trip_card",
            payload: {
              trip_id: tripId,
              destination: itinerary.destination,
              plan: itinerary,
            },
          },
        ],
        latency_ms: Date.now() - startTime,
      };
    } catch (error) {
      log.error("Trip planning failed", error);
      return {
        task_id: task.task_id,
        agent_type: "trip-planner",
        status: "error",
        data: {},
        confidence: 0,
        error: {
          code: "TRIP_PLANNING_FAILED",
          message: String(error),
          retryable: true,
          user_message:
            "I had trouble creating your itinerary. Could you try again with more details?",
        },
        latency_ms: Date.now() - startTime,
      };
    }
  }

  // ── Batched Generation (3 parallel calls) ──────────────

  private async executeBatched(
    destination: string,
    userMessage: string,
    entities: Record<string, unknown>,
  ): Promise<FullTripPlan> {
    log.info("Using batched generation path", { destination });

    const dates = entities.dates as string[] | undefined;
    const input: TripGenerationInput = {
      destination,
      number_of_days: this.extractDayCount(userMessage, dates),
      activity_preferences: (entities.interests as string[]) || undefined,
      from_date: dates?.[0],
      to_date: dates?.[1] || dates?.[0],
      companion: this.extractCompanion(userMessage),
      budget_level: this.extractBudgetLevel(
        (entities.budget as string) || userMessage,
      ),
    };

    return generateFullTripPlan(input);
  }

  // ── Single-Call Generation (original path) ─────────────

  private async executeSingleCall(
    task: AgentTask,
    userMessage: string,
    entities: Record<string, unknown>,
  ): Promise<FullTripPlan> {
    log.info("Using single-call generation path");

    const model = selectModel(task);
    const systemPrompt = await loadPromptWithVariables("trip-planner", {});

    const response = await withRetry(
      (client, providerModel) =>
        client.chat.completions.create({
          model: providerModel || model,
          temperature: 0.7,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      3,
    );

    return parseJsonResponse<FullTripPlan>(
      (response as any).choices[0]?.message?.content,
    );
  }

  // ── Entity Extraction Helpers ──────────────────────────

  private extractDestination(message: string): string {
    // Simple heuristic: look for "to <Place>" or "in <Place>"
    const toMatch = message.match(
      /(?:to|in|visit|explore)\s+([A-Z][a-zA-Z\s,]+?)(?:\s+for|\s+from|\s+with|\.|,|$)/,
    );
    return toMatch ? toMatch[1].trim() : "";
  }

  private extractDayCount(message: string, dates?: string[]): number {
    // Try to extract from message
    const dayMatch = message.match(/(\d+)\s*(?:day|night|d)/i);
    if (dayMatch) return parseInt(dayMatch[1], 10);

    // Try to compute from dates
    if (dates && dates.length >= 2) {
      const start = new Date(dates[0]).getTime();
      const end = new Date(dates[1]).getTime();
      if (!isNaN(start) && !isNaN(end)) {
        return Math.max(1, Math.ceil((end - start) / 86400000) + 1);
      }
    }

    return 5; // Default
  }

  private extractCompanion(message: string): string | undefined {
    const lower = message.toLowerCase();
    if (lower.includes("solo")) return "solo";
    if (lower.includes("couple") || lower.includes("partner"))
      return "partner";
    if (lower.includes("family") || lower.includes("kids"))
      return "family with kids";
    if (lower.includes("friends") || lower.includes("group"))
      return "friends group";
    return undefined;
  }

  private extractBudgetLevel(
    text: string,
  ): "budget" | "mid-range" | "luxury" | undefined {
    const lower = text.toLowerCase();
    if (lower.includes("budget") || lower.includes("cheap")) return "budget";
    if (lower.includes("luxury") || lower.includes("premium"))
      return "luxury";
    if (lower.includes("mid") || lower.includes("moderate"))
      return "mid-range";
    return undefined;
  }

  // ── Conflict Detection ─────────────────────────────────

  detectConflicts(
    days: ItineraryDay[],
  ): ConflictWarning[] {
    const warnings: ConflictWarning[] = [];

    for (const day of days) {
      const activities = day.activities || [];
      for (let i = 0; i < activities.length - 1; i++) {
        const current = activities[i];
        const next = activities[i + 1];

        if (
          current.end_time &&
          next.start_time &&
          current.end_time > next.start_time
        ) {
          warnings.push({
            type: "time_overlap",
            activities: [current.name, next.name],
            message: `"${current.name}" ends at ${current.end_time} but "${next.name}" starts at ${next.start_time}`,
            suggestion:
              "Consider adjusting the schedule or removing one activity.",
          });
        }
      }
    }

    return warnings;
  }

  // ── Response Formatting ────────────────────────────────

  private formatItineraryResponse(
    itinerary: FullTripPlan,
    conflicts: ConflictWarning[],
  ): string {
    let response = `Alright traveler, step right this way! 🗺️✨ Look at this amazing ${itinerary.days?.length || "?"}-day adventure I've put together just for you in **${itinerary.destination}**!\n\n`;

    // ── Destination Overview (Batch 1) ────────────────
    if (itinerary.about_the_place) {
      response += `🌍 **About ${itinerary.destination}**\n${itinerary.about_the_place}\n\n`;
    }

    if (itinerary.best_time_to_visit) {
      response += `☀️ **Best Time to Visit:** ${itinerary.best_time_to_visit}\n\n`;
    }

    // ── Top Places with Coordinates (Batch 3) ─────────
    if (
      itinerary.top_places_to_visit &&
      itinerary.top_places_to_visit.length > 0
    ) {
      response += `🏛️ **Top Places to Visit**\n`;
      for (const place of itinerary.top_places_to_visit) {
        response += `- **${place.name}**\n`;
      }
      response += `\n`;
    }

    // ── Recommendations (Batch 2) ─────────────────────
    if (
      itinerary.adventures_activities_to_do &&
      itinerary.adventures_activities_to_do.length > 0
    ) {
      response += `🏄 **Top Adventures & Activities**\n`;
      for (const activity of itinerary.adventures_activities_to_do) {
        response += `- ${activity}\n`;
      }
      response += `\n`;
    }

    if (
      itinerary.local_cuisine_recommendations &&
      itinerary.local_cuisine_recommendations.length > 0
    ) {
      response += `🍲 **Local Cuisine Recommendations**\n`;
      for (const cuisine of itinerary.local_cuisine_recommendations) {
        response += `- ${cuisine}\n`;
      }
      response += `\n`;
    }

    if (
      itinerary.packing_checklist &&
      itinerary.packing_checklist.length > 0
    ) {
      response += `🎒 **Packing Checklist**\n`;
      for (const item of itinerary.packing_checklist) {
        response += `- ${item}\n`;
      }
      response += `\n`;
    }

    // ── Day-by-Day Itinerary (Batch 3) ────────────────
    response += `📅 **Your Itinerary**\n\n`;

    for (const day of itinerary.days || []) {
      response += `### Day ${day.day_number}: ${day.theme || ""} (${day.date})\n`;
      for (const activity of day.activities || []) {
        response += `- **${activity.start_time}–${activity.end_time}**: ${activity.name} 📍 ${activity.location}\n`;
        if (activity.notes) response += `  _${activity.notes}_\n`;
      }
      response += "\n";
    }

    // ── Tips ───────────────────────────────────────────
    if (itinerary.tips && itinerary.tips.length > 0) {
      response += `### 💡 Your Guide's Top Tips\n`;
      for (const tip of itinerary.tips) response += `- ${tip}\n`;
    }

    response += `\n**Estimated total cost to enjoy all this: $${itinerary.estimated_total_cost_usd}**`;

    // ── Conflict Warnings ─────────────────────────────
    if (conflicts.length > 0) {
      response += `\n\n⚠️ **Hold on a second, a quick heads-up on the schedule!**\n`;
      for (const c of conflicts) response += `- ${c.message}\n`;
    }

    return response;
  }
}
