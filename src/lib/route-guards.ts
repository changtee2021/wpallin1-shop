import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_ROLES, DEALER_ROLES, hasAnyRole } from "@/types/api/profile";
import { listUserRoles } from "@/services/profile.service";

export async function requireAuth() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw redirect({ to: "/login" });
  }
  return data.user;
}

async function loadRolesSafe(userId: string): Promise<string[]> {
  try {
    return await listUserRoles(supabase, userId);
  } catch {
    return ["retail_customer"];
  }
}

export async function requireDealer() {
  const user = await requireAuth();
  const roles = await loadRolesSafe(user.id);
  if (!hasAnyRole(roles, DEALER_ROLES)) {
    throw redirect({ to: "/account" });
  }
  return { user, roles };
}

export async function requireAdmin() {
  const user = await requireAuth();
  const roles = await loadRolesSafe(user.id);
  if (!hasAnyRole(roles, ADMIN_ROLES)) {
    throw redirect({ to: "/account" });
  }
  return { user, roles };
}
