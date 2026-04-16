// ═══════════════════════════════════════════════════════════
// WanderWiseAI — Auth Middleware
// JWT validation via Supabase.
// ═══════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";
import { createLogger } from "@/lib/utils/logger";

const log = createLogger("Auth");

export interface AuthResult {
  userId: string;
  email: string;
}

/**
 * Get the Supabase URL and anon key for JWT validation.
 * We MUST use the same Supabase project that the frontend uses,
 * because the JWT was issued by that project.
 *
 * Priority: VITE_ vars (frontend project) → NEXT_PUBLIC_ vars (fallback)
 */
function getSupabaseCredentials(): { url: string; anonKey: string } {
  const url =
    process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  return { url, anonKey };
}

/**
 * Validate a JWT token from the Authorization header.
 * Returns user info on success, null on failure.
 */
export async function validateJWT(
  authHeader: string | null,
): Promise<AuthResult | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    log.warn("Missing or invalid Authorization header");
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { url, anonKey } = getSupabaseCredentials();

    if (!url || !anonKey) {
      log.error("Supabase credentials not configured for auth");
      return null;
    }

    const supabase = createClient(url, anonKey);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      log.warn("JWT validation failed", { error: error?.message });
      return null;
    }

    return {
      userId: user.id,
      email: user.email || "",
    };
  } catch (error) {
    log.error("JWT validation error", error);
    return null;
  }
}
