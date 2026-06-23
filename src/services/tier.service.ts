import type { SupabaseClient } from "@supabase/supabase-js";

import { calcCartSubtotal } from "@/domain/pricing";
import { resolveProductUnitPrice as resolveFromPricing } from "@/services/pricing-resolver";

export type MemberTierDto = {
  id: string;
  tier: string;
  displayName: string;
  minLifetimeSpend: number;
  discountPct: number;
  sortOrder: number;
  isActive: boolean;
};

export type TierProgressDto = {
  currentTier: string;
  currentTierName: string;
  discountPct: number;
  totalSpent: number;
  nextTier: string | null;
  nextTierName: string | null;
  nextTierMinSpend: number | null;
  amountToNext: number | null;
};

export type AdminMemberDto = {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  memberTier: string;
  accountStatus: string;
  totalSpent: number;
  orderCount: number;
  walletBalance: number;
  roles: string[];
};

export async function listMemberTiers(
  supabase: SupabaseClient,
): Promise<MemberTierDto[]> {
  const { data, error } = await supabase
    .from("member_tiers")
    .select(
      "id, tier, display_name, min_lifetime_spend, discount_pct, sort_order, is_active",
    )
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    tier: row.tier,
    displayName: row.display_name,
    minLifetimeSpend: Number(row.min_lifetime_spend),
    discountPct: Number(row.discount_pct),
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function updateMemberTier(
  supabase: SupabaseClient,
  tier: string,
  input: {
    displayName: string;
    minLifetimeSpend: number;
    discountPct: number;
    sortOrder?: number;
    isActive?: boolean;
  },
): Promise<void> {
  const { error } = await supabase
    .from("member_tiers")
    .update({
      display_name: input.displayName.trim(),
      min_lifetime_spend: input.minLifetimeSpend,
      discount_pct: input.discountPct,
      sort_order: input.sortOrder,
      is_active: input.isActive ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq("tier", tier);

  if (error) throw new Error(error.message);
}

export async function getTierProgress(
  supabase: SupabaseClient,
  userId: string,
): Promise<TierProgressDto> {
  const [{ data: profile }, tiers] = await Promise.all([
    supabase
      .from("profiles")
      .select("member_tier, total_spent")
      .eq("id", userId)
      .maybeSingle(),
    listMemberTiers(supabase),
  ]);

  const totalSpent = Number(profile?.total_spent ?? 0);
  const currentTier = profile?.member_tier ?? "retail";
  const activeTiers = tiers.filter((t) => t.isActive);
  const current = activeTiers.find((t) => t.tier === currentTier);
  const next = activeTiers
    .filter((t) => t.minLifetimeSpend > totalSpent)
    .sort((a, b) => a.minLifetimeSpend - b.minLifetimeSpend)[0];

  return {
    currentTier,
    currentTierName: current?.displayName ?? currentTier,
    discountPct: current?.discountPct ?? 0,
    totalSpent,
    nextTier: next?.tier ?? null,
    nextTierName: next?.displayName ?? null,
    nextTierMinSpend: next?.minLifetimeSpend ?? null,
    amountToNext: next ? Math.max(0, next.minLifetimeSpend - totalSpent) : null,
  };
}

export async function recalculateMemberTier(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data, error } = await supabase.rpc("recalculate_member_tier", {
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
  return (data as string) ?? "retail";
}

export async function recordPaidOrderStats(
  supabase: SupabaseClient,
  userId: string,
  grandTotal: number,
): Promise<void> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_spent, order_count")
    .eq("id", userId)
    .maybeSingle();

  const newSpent = Number(profile?.total_spent ?? 0) + grandTotal;
  const newCount = Number(profile?.order_count ?? 0) + 1;

  await supabase
    .from("profiles")
    .update({
      total_spent: newSpent,
      order_count: newCount,
      last_order_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  await recalculateMemberTier(supabase, userId);
}

export async function isDealerUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "dealer")
    .maybeSingle();
  return !!data;
}

export async function resolveProductUnitPrice(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  productId: string,
  qty = 1,
): Promise<number> {
  return resolveFromPricing(supabase, userId, productId, qty);
}

export async function syncTierProductPrices(
  supabase: SupabaseClient,
  tier: string,
): Promise<number> {
  const { data: tierRow } = await supabase
    .from("member_tiers")
    .select("discount_pct")
    .eq("tier", tier)
    .maybeSingle();

  if (!tierRow) throw new Error("ไม่พบระดับสมาชิก");

  const discount = Number(tierRow.discount_pct) / 100;
  const { data: products, error } = await supabase
    .from("products")
    .select("id, dealer_price, retail_price")
    .eq("is_active", true);

  if (error) throw new Error(error.message);

  let count = 0;
  for (const p of products ?? []) {
    const base =
      Number(p.dealer_price) > 0
        ? Number(p.dealer_price)
        : Number(p.retail_price);
    const price = Math.round(base * (1 - discount) * 100) / 100;
    const { error: upsertErr } = await supabase
      .from("product_tier_prices")
      .upsert(
        {
          product_id: p.id,
          tier,
          price,
          min_qty: 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id,tier,min_qty" },
      );
    if (!upsertErr) count += 1;
  }
  return count;
}

export async function listAdminMembers(
  supabase: SupabaseClient,
  limit = 100,
): Promise<AdminMemberDto[]> {
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, member_tier, account_status, total_spent, order_count",
    )
    .order("total_spent", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  const userIds = (profiles ?? []).map((p) => p.id);
  if (!userIds.length) return [];

  const [{ data: roles }, { data: wallets }] = await Promise.all([
    supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
    supabase
      .from("wallet_accounts")
      .select("user_id, available_balance")
      .in("user_id", userIds),
  ]);

  const rolesMap = new Map<string, string[]>();
  for (const r of roles ?? []) {
    const list = rolesMap.get(r.user_id) ?? [];
    list.push(r.role as string);
    rolesMap.set(r.user_id, list);
  }

  const walletMap = new Map(
    (wallets ?? []).map((w) => [w.user_id, Number(w.available_balance)]),
  );

  return (profiles ?? []).map((p) => ({
    userId: p.id,
    email: p.email,
    fullName: p.full_name,
    phone: p.phone,
    memberTier: p.member_tier,
    accountStatus: p.account_status,
    totalSpent: Number(p.total_spent),
    orderCount: p.order_count,
    walletBalance: walletMap.get(p.id) ?? 0,
    roles: rolesMap.get(p.id) ?? [],
  }));
}

export async function adminSetMemberTier(
  supabase: SupabaseClient,
  userId: string,
  tier: string,
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ member_tier: tier, updated_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function calcTierCartDiscount(
  supabase: SupabaseClient,
  userId: string,
  cartId: string,
): Promise<number> {
  const { data: items } = await supabase
    .from("cart_items")
    .select("qty, unit_price")
    .eq("cart_id", cartId);

  const subtotal = calcCartSubtotal(
    (items ?? []).map((i) => ({
      qty: Number(i.qty),
      unitPrice: Number(i.unit_price),
    })),
  );

  const progress = await getTierProgress(supabase, userId);
  if (progress.discountPct <= 0) return 0;

  return Math.round(subtotal * (progress.discountPct / 100) * 100) / 100;
}
