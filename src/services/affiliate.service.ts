import type { SupabaseClient } from "@supabase/supabase-js";

export async function recordAffiliateConversion(
  supabase: SupabaseClient,
  affiliateCode: string,
  orderId: string,
  orderTotal: number,
): Promise<void> {
  const code = affiliateCode.trim().toUpperCase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("affiliate_code", code)
    .maybeSingle();

  if (!profile) return;

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  let accountId = account?.id;
  if (!accountId) {
    const { data: created } = await supabase
      .from("affiliate_accounts")
      .insert({
        user_id: profile.id,
        referral_code: code,
        status: "approved",
      })
      .select("id")
      .single();
    accountId = created?.id;
  }
  if (!accountId) return;

  await supabase.from("affiliate_conversions").insert({
    affiliate_account_id: accountId,
    order_id: orderId,
    event_type: "order",
    commission_amount: Math.round(orderTotal * 0.03 * 100) / 100,
    status: "pending",
  });
}
