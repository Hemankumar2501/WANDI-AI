// ═══════════════════════════════════════════════════════════
// WanderWiseAI — TripInsightsCard Component
// Renders the AI-generated destination insights (about the place,
// best time to visit, top places, activities, cuisine, packing).
// Designed for use in the chat widget and trip detail pages.
// ═══════════════════════════════════════════════════════════

import {
  Globe,
  Sun,
  MapPin,
  Compass,
  UtensilsCrossed,
  Backpack,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import type { FullTripPlan, TopPlace } from "@/lib/schemas/trip-planner";

interface TripInsightsCardProps {
  plan: Partial<FullTripPlan>;
  compact?: boolean;
}

function SectionHeader({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div
        className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase">
        {label}
      </h4>
    </div>
  );
}

export function TripInsightsCard({ plan, compact = false }: TripInsightsCardProps) {
  const [expanded, setExpanded] = useState(!compact);

  const hasOverview = plan.about_the_place || plan.best_time_to_visit;
  const hasPlaces =
    plan.top_places_to_visit && plan.top_places_to_visit.length > 0;
  const hasActivities =
    plan.adventures_activities_to_do &&
    plan.adventures_activities_to_do.length > 0;
  const hasCuisine =
    plan.local_cuisine_recommendations &&
    plan.local_cuisine_recommendations.length > 0;
  const hasPacking =
    plan.packing_checklist && plan.packing_checklist.length > 0;

  const hasAnyInsight =
    hasOverview || hasPlaces || hasActivities || hasCuisine || hasPacking;

  if (!hasAnyInsight) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Collapsible Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900 text-base">
              Destination Insights
            </h3>
            <p className="text-xs text-gray-500">
              AI-powered travel intelligence for{" "}
              <span className="font-semibold text-blue-600">
                {plan.destination || "your trip"}
              </span>
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-6">
          {/* About the Place */}
          {plan.about_the_place && (
            <div>
              <SectionHeader
                icon={Globe}
                label={`About ${plan.destination || "the Destination"}`}
                color="bg-emerald-500"
              />
              <p className="text-sm text-gray-600 leading-relaxed pl-9">
                {plan.about_the_place}
              </p>
            </div>
          )}

          {/* Best Time to Visit */}
          {plan.best_time_to_visit && (
            <div className="flex items-start gap-3 bg-amber-50 rounded-2xl p-4 border border-amber-100">
              <Sun className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Best Time to Visit
                </span>
                <p className="text-sm text-amber-800 mt-1 font-medium">
                  {plan.best_time_to_visit}
                </p>
              </div>
            </div>
          )}

          {/* Top Places */}
          {hasPlaces && (
            <div>
              <SectionHeader
                icon={MapPin}
                label="Top Places to Visit"
                color="bg-blue-500"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-9">
                {plan.top_places_to_visit!.map(
                  (place: TopPlace, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2.5 border border-blue-100 hover:bg-blue-100 transition-colors cursor-default"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-blue-900 truncate">
                        {place.name}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Adventure Activities */}
          {hasActivities && (
            <div>
              <SectionHeader
                icon={Compass}
                label="Adventures & Activities"
                color="bg-orange-500"
              />
              <ul className="space-y-1.5 pl-9">
                {plan.adventures_activities_to_do!.map(
                  (activity: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                      {activity}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {/* Local Cuisine */}
          {hasCuisine && (
            <div>
              <SectionHeader
                icon={UtensilsCrossed}
                label="Local Cuisine"
                color="bg-red-500"
              />
              <div className="flex flex-wrap gap-2 pl-9">
                {plan.local_cuisine_recommendations!.map(
                  (cuisine: string, idx: number) => (
                    <span
                      key={idx}
                      className="bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100"
                    >
                      🍜 {cuisine}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Packing Checklist */}
          {hasPacking && (
            <div>
              <SectionHeader
                icon={Backpack}
                label="Packing Checklist"
                color="bg-violet-500"
              />
              <div className="grid grid-cols-2 gap-2 pl-9">
                {plan.packing_checklist!.map(
                  (item: string, idx: number) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 text-sm text-gray-700 bg-violet-50 rounded-xl px-3 py-2 border border-violet-100 cursor-pointer hover:bg-violet-100 transition-colors"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                      />
                      <span>{item}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
