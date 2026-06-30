import { fetchAccountProfile } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AccountProfileDto } from "@/types/api/profile";
import type { Session } from "@supabase/supabase-js";

let cachedToken: string | null = null;
let cachedProfile: AccountProfileDto | null = null;
let inflight: Promise<AccountProfileDto> | null = null;

export function clearAccountProfileCache() {
  cachedToken = null;
  cachedProfile = null;
  inflight = null;
}

export function getCachedAccountProfile(
  session: Session | null,
): AccountProfileDto | null {
  const token = session?.access_token ?? "";
  if (!token || cachedToken !== token || !cachedProfile) return null;
  return cachedProfile;
}

export function fetchAccountProfileCached(
  session: Session | null,
): Promise<AccountProfileDto> {
  const token = session?.access_token ?? "";
  if (!token) {
    return Promise.reject(new Error("Not authenticated"));
  }

  if (cachedToken === token && cachedProfile) {
    return Promise.resolve(cachedProfile);
  }

  if (inflight) return inflight;

  const opts = authServerFnOptions(session);
  inflight = fetchAccountProfile(opts)
    .then((profile) => {
      cachedToken = token;
      cachedProfile = profile;
      inflight = null;
      return profile;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });

  return inflight;
}
