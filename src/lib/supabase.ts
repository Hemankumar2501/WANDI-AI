import { createClient } from "@supabase/supabase-js";

// ── Environment variable validation ──────────────────────────────────────────
// Fail loudly at startup if required env vars are missing — prevents silent
// operation with empty/placeholder credentials that could expose user data.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === "YOUR_SUPABASE_URL") {
  console.error(
    "[WanderWise] VITE_SUPABASE_URL is not set. " +
      "Copy .env.example to .env and fill in your Supabase credentials.",
  );
}

if (!supabaseAnonKey || supabaseAnonKey === "YOUR_SUPABASE_ANON_KEY") {
  console.error(
    "[WanderWise] VITE_SUPABASE_ANON_KEY is not set. " +
      "Copy .env.example to .env and fill in your Supabase credentials.",
  );
}

// ── Supabase client ───────────────────────────────────────────────────────────
export const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "dummy_key", {
  auth: {
    // Keep the session alive automatically
    autoRefreshToken: true,
    // Persist the session in localStorage (safe: only anon/JWT, no secret key)
    persistSession: true,
    // Handle OAuth redirects automatically
    detectSessionInUrl: true,
    // Use PKCE flow for OAuth (more secure than implicit flow)
    flowType: "pkce",
  },
  global: {
    headers: {
      // Identify client version for audit logs
      "x-client-info": "wanderwise-web/1.0",
    },
  },
  // Realtime disabled by default — only enable per-channel where needed
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// ── Database types ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  travel_style?: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  destination: string;
  start_date: string;
  end_date: string;
  status: "planning" | "upcoming" | "completed";
  image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  last_message: string;
  created_at: string;
  updated_at: string;
}
