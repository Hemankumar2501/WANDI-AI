// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Trip Planner Output Schemas
// Structured schemas for AI-generated travel data.
// Inspired by travel-planner-ai's batch schema pattern,
// adapted for WanderWise's Gemini-powered architecture.
// ═══════════════════════════════════════════════════════════

// ── Batch 1: Destination Overview ─────────────────────────
// Quick facts about the place — generated first so users see
// content immediately while the full itinerary loads.

export interface DestinationOverview {
  about_the_place: string;
  best_time_to_visit: string;
}

export const destinationOverviewSchema = {
  type: "object",
  properties: {
    about_the_place: {
      type: "string",
      description: "About the place in at least 50 words",
    },
    best_time_to_visit: {
      type: "string",
      description: "Best time to visit the destination",
    },
  },
  required: ["about_the_place", "best_time_to_visit"],
};

// ── Batch 2: Recommendations ──────────────────────────────
// Activities, cuisine, and packing list — can be generated
// in parallel with the itinerary.

export interface TripRecommendations {
  adventures_activities_to_do: string[];
  local_cuisine_recommendations: string[];
  packing_checklist: string[];
}

export const tripRecommendationsSchema = {
  type: "object",
  properties: {
    adventures_activities_to_do: {
      type: "array",
      description:
        "Top adventure activities, at least 5, like trekking, water sports — specify the place also",
      items: { type: "string" },
    },
    local_cuisine_recommendations: {
      type: "array",
      description: "Local cuisine recommendations",
      items: { type: "string" },
    },
    packing_checklist: {
      type: "array",
      description: "Packing checklist for the trip",
      items: { type: "string" },
    },
  },
  required: [
    "adventures_activities_to_do",
    "local_cuisine_recommendations",
    "packing_checklist",
  ],
};

// ── Batch 3: Itinerary & Map Points ───────────────────────
// The full day-by-day plan with geo-coordinates for map.

export interface PlaceCoordinates {
  lat: number;
  lng: number;
}

export interface TopPlace {
  name: string;
  coordinates: PlaceCoordinates;
}

export interface ItineraryActivity {
  name: string;
  category: "food" | "transport" | "experience" | "accommodation" | "shopping";
  start_time: string;
  end_time: string;
  location: string;
  notes: string;
  estimated_cost_usd: number;
}

export interface ItineraryDay {
  day_number: number;
  date: string;
  theme: string;
  activities: ItineraryActivity[];
}

export interface ItineraryWithPlaces {
  days: ItineraryDay[];
  top_places_to_visit: TopPlace[];
  tips: string[];
  estimated_total_cost_usd: number;
}

export const itineraryWithPlacesSchema = {
  type: "object",
  properties: {
    days: {
      type: "array",
      description: "Day-by-day itinerary",
      items: {
        type: "object",
        properties: {
          day_number: { type: "number" },
          date: { type: "string", description: "YYYY-MM-DD" },
          theme: { type: "string", description: "Day theme" },
          activities: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                category: {
                  type: "string",
                  enum: [
                    "food",
                    "transport",
                    "experience",
                    "accommodation",
                    "shopping",
                  ],
                },
                start_time: { type: "string", description: "HH:MM" },
                end_time: { type: "string", description: "HH:MM" },
                location: { type: "string" },
                notes: { type: "string" },
                estimated_cost_usd: { type: "number" },
              },
              required: [
                "name",
                "category",
                "start_time",
                "end_time",
                "location",
                "notes",
                "estimated_cost_usd",
              ],
            },
          },
        },
        required: ["day_number", "date", "theme", "activities"],
      },
    },
    top_places_to_visit: {
      type: "array",
      description: "Top places to visit with lat/lng coordinates, at least 5",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the place" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number", description: "Latitude" },
              lng: { type: "number", description: "Longitude" },
            },
            required: ["lat", "lng"],
          },
        },
        required: ["name", "coordinates"],
      },
    },
    tips: {
      type: "array",
      description: "Travel tips",
      items: { type: "string" },
    },
    estimated_total_cost_usd: {
      type: "number",
      description: "Estimated total trip cost in USD",
    },
  },
  required: [
    "days",
    "top_places_to_visit",
    "tips",
    "estimated_total_cost_usd",
  ],
};

// ── Combined Full Plan ────────────────────────────────────
// Merge of all three batches — this is the complete shape
// the single-call trip-planner returns.

export interface FullTripPlan
  extends DestinationOverview,
    TripRecommendations,
    ItineraryWithPlaces {
  destination: string;
  start_date: string;
  end_date: string;
}

// ── Generation Input ──────────────────────────────────────
// User-controlled parameters that influence the AI prompt,
// mirroring travel-planner-ai's OpenAIInputType.

export interface TripGenerationInput {
  destination: string;
  number_of_days: number;
  activity_preferences?: string[];
  from_date?: string;
  to_date?: string;
  companion?: string;
  budget_level?: "budget" | "mid-range" | "luxury";
  travel_style?: string;
}

// ── Content Generation State ──────────────────────────────
// Track which batches have completed — mirrors
// travel-planner-ai's contentGenerationState pattern.

export interface ContentGenerationState {
  overview: boolean;
  recommendations: boolean;
  itinerary: boolean;
  places: boolean;
}

export function createEmptyGenerationState(): ContentGenerationState {
  return {
    overview: false,
    recommendations: false,
    itinerary: false,
    places: false,
  };
}
