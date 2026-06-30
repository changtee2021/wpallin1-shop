import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

const AUTH_CHECK_TIMEOUT_MS = 4_000;

/**
 * Fast auth read for route guards — uses local session first.
 * Avoids `getUser()` network round-trips that can hang the login page.
 */
export async function getSessionUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn("[auth] getSession:", error.message);
    return null;
  }
  return data.session?.user ?? null;
}

/**
 * Validates JWT with Supabase when needed; times out instead of hanging forever.
 */
export async function getVerifiedUser(): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return null;

  try {
    const result = await Promise.race([
      supabase.auth.getUser(),
      new Promise<null>((resolve) => {
        setTimeout(() => resolve(null), AUTH_CHECK_TIMEOUT_MS);
      }),
    ]);
    if (!result) {
      console.warn("[auth] getUser timed out — using session user");
      return sessionUser;
    }
    const { data, error } = result;
    if (error) {
      console.warn("[auth] getUser:", error.message);
      return sessionUser;
    }
    return data.user ?? sessionUser;
  } catch (err) {
    console.warn("[auth] getUser failed:", err);
    return sessionUser;
  }
}
