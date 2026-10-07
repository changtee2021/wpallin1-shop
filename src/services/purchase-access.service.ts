import type { SupabaseClient } from "@supabase/supabase-js";

import { DEALER_ONLY_PURCHASE } from "@/lib/features";

export const DEALER_ONLY_MESSAGE =
  "สั่งซื้อได้เฉพาะตัวแทนจำหน่าย — เปิดบัญชีตัวแทนกับทีมขายทาง LINE ก่อนสั่งซื้อ";

const BYPASS_ROLES = new Set(["admin", "super_admin"]);

/**
 * In dealer-only mode a cart line or order may only be created for an approved
 * dealer (role `dealer` + profile `approved`) or an admin testing the shop.
 * Uses whichever client the caller holds; cart server fns pass the service role.
 */
export async function assertCanPurchase(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<void> {
  if (!DEALER_ONLY_PURCHASE) return;
  if (!userId) throw new Error(DEALER_ONLY_MESSAGE);

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase
      .from("profiles")
      .select("account_status, must_change_password")
      .eq("id", userId)
      .maybeSingle(),
  ]);

  const roleSet = new Set((roles ?? []).map((row) => row.role as string));
  if ([...roleSet].some((role) => BYPASS_ROLES.has(role))) return;
  if (!roleSet.has("dealer") || profile?.account_status !== "approved") {
    throw new Error(DEALER_ONLY_MESSAGE);
  }
  if (profile?.must_change_password) {
    throw new Error("กรุณาตั้งรหัสผ่านใหม่ก่อนเริ่มสั่งซื้อ");
  }
}
