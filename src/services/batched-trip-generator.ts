// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Batched Trip Generation Service
// Generates travel plans in 3 parallel batches for speed,
// inspired by travel-planner-ai's batch architecture.
// ═══════════════════════════════════════════════════════════

import { parseJsonResponse, withRetry } from "@/lib/utils/ai";
import { createLogger } from "@/lib/utils/logger";
import { MODEL_CONFIG } from "@/lib/constants";
import type {
  TripGenerationInput,
  DestinationOverview,
  TripRecommendations,
  ItineraryWithPlaces,
  FullTripPlan,
  ContentGenerationState,
} from "@/lib/schemas/trip-planner";
import {
  destinationOverviewSchema,
  tripRecommendationsSchema,
  itineraryWithPlacesSchema,
  createEmptyGenerationState,
} from "@/lib/schemas/trip-planner";

const log = createLogger("BatchedTripGenerator");

// ── Prompt Construction ──────────────────────────────────

/**
 * Build the core user prompt string from generation input.
 * Mirrors travel-planner-ai's getPrompt() function.
 */
function buildUserPrompt(input: TripGenerationInput): string {
  let prompt = `${input.number_of_days} days trip to ${input.destination}`;

  if (input.from_date && input.to_date) {
    prompt += `, from date ${input.from_date} to date ${input.to_date}`;
  }

  if (input.companion && input.companion.length > 0) {
    prompt += `, travelling with ${input.companion}`;
  }

  if (input.activity_preferences && input.activity_preferences.length > 0) {
    prompt += `, activity preferences: ${input.activity_preferences.join(", ")}`;
  }

  if (input.budget_level) {
    prompt += `, budget level: ${input.budget_level}`;
  }

  if (input.travel_style) {
    prompt += `, travel style: ${input.travel_style}`;
  }

  prompt +=
    ". Generate travel data according to the schema and in JSON format. " +
    "Do not return anything in your response outside of curly braces. " +
    "Dates, activity preferences, and travelling companion should influence " +
    "the generated plan significantly.";

  return prompt;
}

// ── Individual Batch Generators ──────────────────────────

/**
 * Batch 1: Generate destination overview (about place + best time to visit).
 * This is the fastest call and gives the user immediate content.
 */
export async function generateBatch1(
  input: TripGenerationInput,
): Promise<DestinationOverview> {
  const userPrompt = buildUserPrompt(input);

  const description = `Generate a description of information about ${input.destination}:
  - About the Place: A string containing information about the place, at least 50 words.
  - Best Time to Visit: A string specifying the best time to visit.
  Respond in JSON format only.`;

  log.info("Generating Batch 1: Destination Overview", {
    destination: input.destination,
  });

  const response = await withRetry(
    (client, model) =>
      client.chat.completions.create({
        model: model || MODEL_CONFIG.DEFAULT_MODEL,
        temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a helpful travel assistant. ${description}`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    3,
  );

  return parseJsonResponse<DestinationOverview>(
    (response as any).choices[0]?.message?.content,
  );
}

/**
 * Batch 2: Generate recommendations (activities, cuisine, packing list).
 */
export async function generateBatch2(
  input: TripGenerationInput,
): Promise<TripRecommendations> {
  const userPrompt = buildUserPrompt(input);

  const description = `Generate recommendations for a trip to ${input.destination}:
  - Top Adventure Activities: An array listing at least 5 top adventure activities to do, including their location.
  - Local Cuisine Recommendations: An array with local cuisine to try.
  - Packing Checklist: An array of items to pack for the trip.
  Respond in JSON format only.`;

  log.info("Generating Batch 2: Recommendations", {
    destination: input.destination,
  });

  const response = await withRetry(
    (client, model) =>
      client.chat.completions.create({
        model: model || MODEL_CONFIG.DEFAULT_MODEL,
        temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a helpful travel assistant. ${description}`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    3,
  );

  return parseJsonResponse<TripRecommendations>(
    (response as any).choices[0]?.message?.content,
  );
}

/**
 * Batch 3: Generate itinerary with top places and coordinates.
 */
export async function generateBatch3(
  input: TripGenerationInput,
): Promise<ItineraryWithPlaces> {
  const userPrompt = buildUserPrompt(input);

  const description = `Generate a detailed travel itinerary and top places to visit for ${input.destination}:
  - Itinerary: An array with ${input.number_of_days} days. Each day has a title/theme and morning, afternoon, evening activities with name, category, start_time, end_time, location, notes, and estimated_cost_usd.
  - Top Places to Visit: An array of at least 5 top places with name and coordinates (lat, lng).
  - Tips: Practical travel tips specific to the destination.
  - Estimated Total Cost: A realistic total trip cost in USD.
  Respond in JSON format only.`;

  log.info("Generating Batch 3: Itinerary & Places", {
    destination: input.destination,
  });

  const response = await withRetry(
    (client, model) =>
      client.chat.completions.create({
        model: model || MODEL_CONFIG.DEFAULT_MODEL,
        temperature: MODEL_CONFIG.DEFAULT_TEMPERATURE,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a helpful travel assistant. ${description}`,
          },
          { role: "user", content: userPrompt },
        ],
      }),
    3,
  );

  return parseJsonResponse<ItineraryWithPlaces>(
    (response as any).choices[0]?.message?.content,
  );
}

// ── Parallel Full Generation ─────────────────────────────

export interface BatchProgress {
  state: ContentGenerationState;
  overview?: DestinationOverview;
  recommendations?: TripRecommendations;
  itinerary?: ItineraryWithPlaces;
}

/**
 * Generate the complete trip plan in parallel batches.
 *
 * This mirrors travel-planner-ai's 3-batch architecture but:
 * - Uses Gemini instead of OpenAI
 * - Runs all 3 batches concurrently via Promise.allSettled
 * - Returns a unified FullTripPlan object
 * - Includes a progress callback for real-time UI updates
 *
 * @param input - Trip generation parameters
 * @param onProgress - Optional callback fired as each batch completes
 */
export async function generateFullTripPlan(
  input: TripGenerationInput,
  onProgress?: (progress: BatchProgress) => void,
): Promise<FullTripPlan> {
  const state = createEmptyGenerationState();
  const progress: BatchProgress = { state };

  log.info("Starting parallel trip generation", {
    destination: input.destination,
    days: input.number_of_days,
  });

  const startTime = Date.now();

  // Launch all 3 batches concurrently
  const [batch1Result, batch2Result, batch3Result] =
    await Promise.allSettled([
      generateBatch1(input),
      generateBatch2(input),
      generateBatch3(input),
    ]);

  // Process Batch 1
  if (batch1Result.status === "fulfilled") {
    progress.overview = batch1Result.value;
    state.overview = true;
    onProgress?.(progress);
    log.info("Batch 1 complete: Destination Overview");
  } else {
    log.error("Batch 1 failed", batch1Result.reason);
  }

  // Process Batch 2
  if (batch2Result.status === "fulfilled") {
    progress.recommendations = batch2Result.value;
    state.recommendations = true;
    onProgress?.(progress);
    log.info("Batch 2 complete: Recommendations");
  } else {
    log.error("Batch 2 failed", batch2Result.reason);
  }

  // Process Batch 3
  if (batch3Result.status === "fulfilled") {
    progress.itinerary = batch3Result.value;
    state.itinerary = true;
    state.places = true;
    onProgress?.(progress);
    log.info("Batch 3 complete: Itinerary & Places");
  } else {
    log.error("Batch 3 failed", batch3Result.reason);
  }

  const latency = Date.now() - startTime;
  log.info("All batches complete", { latencyMs: latency });

  // Merge all batches into a unified plan
  const plan: FullTripPlan = {
    destination: input.destination,
    start_date: input.from_date || "",
    end_date: input.to_date || "",

    // Batch 1
    about_the_place: progress.overview?.about_the_place || "",
    best_time_to_visit: progress.overview?.best_time_to_visit || "",

    // Batch 2
    adventures_activities_to_do:
      progress.recommendations?.adventures_activities_to_do || [],
    local_cuisine_recommendations:
      progress.recommendations?.local_cuisine_recommendations || [],
    packing_checklist: progress.recommendations?.packing_checklist || [],

    // Batch 3
    days: progress.itinerary?.days || [],
    top_places_to_visit: progress.itinerary?.top_places_to_visit || [],
    tips: progress.itinerary?.tips || [],
    estimated_total_cost_usd:
      progress.itinerary?.estimated_total_cost_usd || 0,
  };

  return plan;
}
