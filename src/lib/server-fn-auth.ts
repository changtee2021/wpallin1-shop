import { useMemo } from "react";
import type { Session } from "@supabase/supabase-js";

export function authServerFnOptions(session: Session | null) {
  if (!session?.access_token) return {};
  return {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  } as const;
}

export function useAuthServerFnOptions(session: Session | null) {
  return useMemo(() => authServerFnOptions(session), [session?.access_token]);
}
