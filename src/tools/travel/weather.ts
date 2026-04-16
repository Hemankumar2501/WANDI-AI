// ═══════════════════════════════════════════════════════════
// Tool: get_weather_forecast
// Retrieves weather forecast for a destination and dates.
// Falls back to GPT-generated realistic weather data when
// OpenWeatherMap API key is not configured.
// ═══════════════════════════════════════════════════════════

import { z } from "zod";
import { createLogger } from "@/lib/utils/logger";
import { getAiClient, parseJsonResponse } from "@/lib/utils/ai";
import type { WeatherDay } from "@/lib/types";

const log = createLogger("Tool:Weather");



export const getWeatherForecastSchema = z.object({
  destination: z.string().describe("City name for weather forecast"),
  dates: z.array(z.string()).describe("Array of date strings (YYYY-MM-DD)"),
});

export type WeatherInput = z.infer<typeof getWeatherForecastSchema>;

/**
 * Generate realistic weather data using GPT-4o-mini.
 */
async function generateSmartWeather(
  input: WeatherInput,
): Promise<{ daily: WeatherDay[]; summary: string; warnings: string[] }> {
  const client = getAiClient();
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You simulate realistic weather data for any city and time of year. Use your knowledge of climate patterns, typical seasonal weather, and regional conditions.

Respond with JSON:
{
  "daily": [
    {
      "date": "YYYY-MM-DD",
      "temp_high": 28,
      "temp_low": 18,
      "condition": "Partly cloudy",
      "icon": "02d",
      "precipitation_chance": 20
    }
  ],
  "summary": "Brief weather summary for the trip",
  "warnings": ["Any weather warnings if applicable"]
}

Use Celsius temperatures. Include weather icons from OpenWeatherMap: 01d (clear), 02d (few clouds), 03d (scattered clouds), 04d (broken clouds), 09d (shower rain), 10d (rain), 11d (thunderstorm), 13d (snow), 50d (mist).`,
      },
      {
        role: "user",
        content: `Weather forecast for ${input.destination} on these dates: ${input.dates.join(", ")}`,
      },
    ],
  });

  try {
    const parsed = parseJsonResponse<any>(response.choices[0]?.message?.content);
    return {
      daily: parsed.daily || [],
      summary: parsed.summary || `Weather in ${input.destination}`,
      warnings: parsed.warnings || [],
    };
  } catch {
    log.warn("Failed to parse GPT weather data");
    return { daily: [], summary: "Weather data unavailable", warnings: [] };
  }
}

export async function getWeatherForecast(
  input: WeatherInput,
): Promise<{
  daily: WeatherDay[];
  summary: string;
  warnings: string[];
  simulated?: boolean;
}> {
  // ── Fallback: use GPT when no OpenWeatherMap key ───────
  if (!process.env.OPENWEATHER_API_KEY) {
    log.info("OpenWeatherMap not configured, using AI-generated weather data", {
      destination: input.destination,
    });
    const result = await generateSmartWeather(input);
    return { ...result, simulated: true };
  }

  // ── Real OpenWeatherMap API ────────────────────────────
  try {
    log.info("Fetching weather", { destination: input.destination });

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(input.destination)}&units=metric&appid=${apiKey}`,
    );
    const data = await res.json();

    const daily: WeatherDay[] = [];
    const warnings: string[] = [];
    const processedDates = new Set<string>();

    for (const item of data.list || []) {
      const date = item.dt_txt?.split(" ")[0];
      if (!date || processedDates.has(date)) continue;
      processedDates.add(date);

      daily.push({
        date,
        temp_high: Math.round(item.main?.temp_max || 0),
        temp_low: Math.round(item.main?.temp_min || 0),
        condition: item.weather?.[0]?.description || "Unknown",
        icon: item.weather?.[0]?.icon || "",
        precipitation_chance: Math.round((item.pop || 0) * 100),
      });

      if (item.pop > 0.7) {
        warnings.push(`High chance of rain on ${date}`);
      }
      if (item.main?.temp_max > 40) {
        warnings.push(`Extreme heat warning for ${date}`);
      }
    }

    const summary =
      daily.length > 0
        ? `Weather in ${input.destination}: ${daily[0].condition}, ${daily[0].temp_low}°-${daily[0].temp_high}°C`
        : `Weather data unavailable for ${input.destination}`;

    return { daily, summary, warnings };
  } catch (error) {
    log.error("Weather fetch failed", error);
    throw error;
  }
}

export const getWeatherForecastTool = {
  name: "get_weather_forecast",
  description: "Get weather forecast for a destination and date range",
  schema: getWeatherForecastSchema,
  func: getWeatherForecast,
};
