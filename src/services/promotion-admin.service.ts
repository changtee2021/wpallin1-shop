import type { SupabaseClient } from "@supabase/supabase-js";

export type CouponAdminDto = {
  id: string;
  code: string;
  description: string | null;
  discountType: "fixed" | "percent";
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

export type PromotionAdminDto = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
};

function mapCoupon(row: Record<string, unknown>): CouponAdminDto {
  return {
    id: String(row.id),
    code: String(row.code),
    description: row.description ? String(row.description) : null,
    discountType: String(row.discount_type) as "fixed" | "percent",
    discountValue: Number(row.discount_value),
    minOrderAmount: Number(row.min_order_amount),
    maxUses: row.max_uses != null ? Number(row.max_uses) : null,
    usedCount: Number(row.used_count),
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    isActive: Boolean(row.is_active),
  };
}

export async function listAdminCoupons(
  supabase: SupabaseClient,
): Promise<CouponAdminDto[]> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCoupon);
}

export async function saveAdminCoupon(
  supabase: SupabaseClient,
  input: {
    id?: string;
    code: string;
    description?: string;
    discountType: "fixed" | "percent";
    discountValue: number;
    minOrderAmount?: number;
    maxUses?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive?: boolean;
  },
): Promise<void> {
  const row = {
    code: input.code.trim().toUpperCase(),
    description: input.description?.trim() ?? null,
    discount_type: input.discountType,
    discount_value: input.discountValue,
    min_order_amount: input.minOrderAmount ?? 0,
    max_uses: input.maxUses ?? null,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("coupons")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("coupons").insert(row);
  if (error) throw new Error(error.message);
}

export async function listAdminPromotions(
  supabase: SupabaseClient,
): Promise<PromotionAdminDto[]> {
  const { data, error } = await supabase
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: row.description ? String(row.description) : null,
    bannerUrl: row.banner_url ? String(row.banner_url) : null,
    startsAt: row.starts_at ? String(row.starts_at) : null,
    endsAt: row.ends_at ? String(row.ends_at) : null,
    isActive: Boolean(row.is_active),
  }));
}

export async function saveAdminPromotion(
  supabase: SupabaseClient,
  input: {
    id?: string;
    slug: string;
    title: string;
    description?: string;
    bannerUrl?: string;
    startsAt?: string | null;
    endsAt?: string | null;
    isActive?: boolean;
  },
): Promise<void> {
  const row = {
    slug: input.slug.trim().toLowerCase(),
    title: input.title.trim(),
    description: input.description?.trim() ?? null,
    banner_url: input.bannerUrl?.trim() ?? null,
    starts_at: input.startsAt ?? null,
    ends_at: input.endsAt ?? null,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("promotions")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("promotions").insert(row);
  if (error) throw new Error(error.message);
}

export async function getPromptPayId(
  supabase: SupabaseClient,
): Promise<string | null> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment.promptpay_id")
    .maybeSingle();

  if (!data?.value) return null;
  const val = data.value;
  if (typeof val === "string" && val.trim()) return val.trim();
  return null;
}

export async function updatePromptPayId(
  supabase: SupabaseClient,
  promptPayId: string,
): Promise<void> {
  await supabase
    .from("settings")
    .update({ value: promptPayId.trim(), updated_at: new Date().toISOString() })
    .eq("key", "payment.promptpay_id");
}
