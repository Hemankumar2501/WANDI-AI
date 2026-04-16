// ═══════════════════════════════════════════════════════════
// Tool: search_destination_info
// Searches for points of interest at a destination.
// Falls back to GPT-generated POI data when Amadeus is unavailable.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient } from "@/lib/utils/ai";
import type { POI } from "@/lib/types";

const log = createLogger("Tool:SearchDestination");



// ── Schema ────────────────────────────────────────────────
export const searchDestinationInfoSchema = z.object({
  destination: z.string().describe("City or region name to search"),
  categories: z
    .array(z.string())
    .optional()
    .describe('Filter by categories like "restaurant", "museum", "park"'),
});

export type SearchDestinationInput = z.infer<
  typeof searchDestinationInfoSchema
>;

/**
 * Check if Amadeus credentials are configured.
 */
function hasAmadeusCredentials(): boolean {
  return !!(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

/**
 * Generate realistic POI data using GPT-4o-mini when Amadeus is unavailable.
 */
async function generateSmartPOIs(
  input: SearchDestinationInput,
): Promise<POI[]> {
  const client = getAiClient();
  const categoryFilter = input.categories?.length
    ? ` Focus on these categories: ${input.categories.join(", ")}.`
    : "";

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a travel POI data provider. Generate 10 real, well-known points of interest for the given destination. Use real names, real coordinates, and accurate categories.

Respond with JSON:
{
  "pois": [
    {
      "name": "Real Place Name",
      "category": "museum|restaurant|park|temple|market|beach|landmark|nightlife",
      "latitude": 35.6762,
      "longitude": 139.6503,
      "rating": 4.5,
      "description": "Brief description of the place"
    }
  ],
  "best_time": "Best season/months to visit"
}`,
      },
      {
        role: "user",
        content: `Generate 10 real POIs in ${input.destination}.${categoryFilter}`,
      },
    ],
  });

  try {
    const content = response.choices[0]?.message?.content;
    if (!content) return [];
    const parsed = JSON.parse(content);
    return (parsed.pois || []) as POI[];
  } catch {
    log.warn("Failed to parse GPT POI data");
    return [];
  }
}

// ── Implementation ────────────────────────────────────────
export async function searchDestinationInfo(
  input: SearchDestinationInput,
): Promise<{
  pois: POI[];
  description: string;
  best_time: string;
  simulated?: boolean;
}> {
  // ── Fallback: use GPT when no Amadeus credentials ──────
  if (!hasAmadeusCredentials()) {
    log.info("Amadeus not configured, using AI-generated POI data", {
      destination: input.destination,
    });

    const pois = await generateSmartPOIs(input);
    const filteredPois = input.categories
      ? pois.filter((p) =>
          input.categories!.some((c) =>
            p.category.toLowerCase().includes(c.toLowerCase()),
          ),
        )
      : pois;

    return {
      pois: filteredPois,
      description: `Found ${filteredPois.length} points of interest in ${input.destination}`,
      best_time: "Year-round (check seasonal guides for optimal timing)",
      simulated: true,
    };
  }

  // ── Real Amadeus API ───────────────────────────────────
  try {
    log.info("Searching destination info", { destination: input.destination });

    const clientId = process.env.AMADEUS_CLIENT_ID || "";
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET || "";

    // Get access token
    const tokenRes = await fetch(
      "https://api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
      },
    );
    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // Geocode destination
    const geoRes = await fetch(
      `https://api.amadeus.com/v1/reference-data/locations?keyword=${encodeURIComponent(input.destination)}&subType=CITY`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const geoData = await geoRes.json();
    const location = geoData.data?.[0]?.geoCode;

    if (!location) {
      return {
        pois: [],
        description: `Could not find location: ${input.destination}`,
        best_time: "Unknown",
      };
    }

    // Search POIs
    const poiRes = await fetch(
      `https://api.amadeus.com/v1/reference-data/locations/pois?latitude=${location.latitude}&longitude=${location.longitude}&radius=10`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const poiData = await poiRes.json();

    const pois: POI[] = (poiData.data || [])
      .slice(0, 20)
      .map((poi: Record<string, unknown>) => ({
        name: poi.name || "",
        category: (poi.category as string) || "general",
        latitude: (poi.geoCode as Record<string, number>)?.latitude || 0,
        longitude: (poi.geoCode as Record<string, number>)?.longitude || 0,
        rating: (poi.rank as number) || 0,
        description: (poi.tags as string[])?.join(", ") || "",
      }));

    // Filter by categories if provided
    const filteredPois = input.categories
      ? pois.filter((p) =>
          input.categories!.some((c) =>
            p.category.toLowerCase().includes(c.toLowerCase()),
          ),
        )
      : pois;

    return {
      pois: filteredPois,
      description: `Found ${filteredPois.length} points of interest in ${input.destination}`,
      best_time: "Year-round (check seasonal guides for optimal timing)",
    };
  } catch (error) {
    log.error("Failed to search destination", error);
    throw error;
  }
}

// ── Tool Export ───────────────────────────────────────────
export const searchDestinationInfoTool = {
  name: "search_destination_info",
  description: "Search for points of interest and destination information",
  schema: searchDestinationInfoSchema,
  func: searchDestinationInfo,
};
