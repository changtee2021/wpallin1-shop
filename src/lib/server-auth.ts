import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

import { SUPABASE_SCHEMA } from "@/lib/erp-config";
import type { Database } from "@/integrations/supabase/types";

function getBearerToken(): string | null {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.replace("Bearer ", "") || null;
}

export const optionalSupabaseAuth = createMiddleware({
  type: "function",
}).server(async ({ next }) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Missing Supabase environment variables");
  }

  const token = getBearerToken();
  if (!token) {
    return next({ context: { supabase: null, userId: null as string | null } });
  }

  const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
      db: { schema: SUPABASE_SCHEMA },
    },
  );

  const { data, error } = await supabase.auth.getClaims(token);
  if (error || !data?.claims?.sub) {
    return next({ context: { supabase: null, userId: null as string | null } });
  }

  return next({
    context: { supabase, userId: data.claims.sub as string },
  });
});

export async function requireAdmin(userId: string) {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  if (!roles.some((r) => r === "admin" || r === "super_admin")) {
    throw new Error("Forbidden: admin role required");
  }
}

export async function requireStaff(userId: string) {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r) => r.role);
  if (
    !roles.some(
      (r) => r === "admin" || r === "super_admin" || r === "sales_staff",
    )
  ) {
    throw new Error("Forbidden: staff role required");
  }
}
