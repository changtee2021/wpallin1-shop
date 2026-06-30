import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

const AUTH_CHECK_TIMEOUT_MS = 3_000;

let cachedUser: User | null | undefined;

/** Synced from AuthProvider — instant reads for route guards / login redirect. */
export function setCachedSessionUser(user: User | null) {
  cachedUser = user;
}

function readUserFromLocalStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (!url) return null;
    const host = new URL(url).hostname.split(".")[0];
    const key = `sb-${host}-auth-token`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      user?: User | null;
      currentSession?: { user?: User | null };
    };
    return parsed.user ?? parsed.currentSession?.user ?? null;
  } catch {
    return null;
  }
}

async function getSessionWithTimeout() {
  return Promise.race([
    supabase.auth.getSession(),
    new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), AUTH_CHECK_TIMEOUT_MS);
    }),
  ]);
}

/**
 * Fast auth read for route guards — uses in-memory cache, then local session.
 * Never blocks navigation for more than a few seconds.
 */
export async function getSessionUser(): Promise<User | null> {
  if (cachedUser !== undefined) return cachedUser;

  const result = await getSessionWithTimeout();
  if (!result) {
    const fallback = readUserFromLocalStorage();
    cachedUser = fallback;
    if (!fallback) {
      console.warn("[auth] getSession timed out — no cached user");
    }
    return fallback;
  }

  const { data, error } = result;
  if (error) {
    console.warn("[auth] getSession:", error.message);
    const fallback = readUserFromLocalStorage();
    cachedUser = fallback;
    return fallback;
  }

  const user = data.session?.user ?? null;
  cachedUser = user;
  return user;
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
