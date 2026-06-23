import type { SupabaseClient } from "@supabase/supabase-js";

import { isDealerUser } from "@/services/tier.service";

export type ProductPricingRow = {
  id: string;
  retailPrice: number;
  dealerPrice: number;
  moq: number;
  orderStep: number;
  packSize: number;
};

export async function getProductPricingRow(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductPricingRow | null> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, retail_price, dealer_price, min_order_qty, order_step, pack_size",
    )
    .eq("id", productId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    id: data.id,
    retailPrice: Number(data.retail_price),
    dealerPrice: Number(data.dealer_price),
    moq: Number(data.min_order_qty ?? 1),
    orderStep: Number(data.order_step ?? 1),
    packSize: Number(data.pack_size ?? 1),
  };
}

/** contract -> tier+qty -> dealer -> retail */
export async function resolveUnitPrice(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  productId: string,
  qty = 1,
): Promise<number> {
  const product = await getProductPricingRow(supabase, productId);
  if (!product) throw new Error("ไม่พบสินค้า");
  if (!userId) return product.retailPrice;

  const [{ data: profile }, dealer] = await Promise.all([
    supabase
      .from("profiles")
      .select("member_tier, company_id")
      .eq("id", userId)
      .maybeSingle(),
    isDealerUser(supabase, userId),
  ]);

  const tier = profile?.member_tier ?? "retail";

  const { data: contractRows } = await supabase
    .from("customer_price_lists")
    .select("price, min_qty, user_id, company_id")
    .eq("product_id", productId)
    .eq("is_active", true)
    .lte("min_qty", qty)
    .order("min_qty", { ascending: false });

  const contract = (contractRows ?? []).find((row) => {
    if (row.user_id === userId) return true;
    if (profile?.company_id && row.company_id === profile.company_id) {
      return true;
    }
    return false;
  });

  if (contract) return Number(contract.price);

  if (dealer || tier !== "retail") {
    const { data: tierPrices } = await supabase
      .from("product_tier_prices")
      .select("price, min_qty")
      .eq("product_id", productId)
      .eq("tier", tier)
      .lte("min_qty", qty)
      .order("min_qty", { ascending: false })
      .limit(1);

    if (tierPrices?.[0]) return Number(tierPrices[0].price);
    if (dealer && product.dealerPrice > 0) return product.dealerPrice;
  }

  const { data: tierRow } = await supabase
    .from("member_tiers")
    .select("discount_pct")
    .eq("tier", tier)
    .eq("is_active", true)
    .maybeSingle();

  const discountPct = Number(tierRow?.discount_pct ?? 0);
  if (discountPct > 0) {
    return (
      Math.round(product.retailPrice * (1 - discountPct / 100) * 100) / 100
    );
  }

  return product.retailPrice;
}

export async function resolveProductUnitPrice(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  productId: string,
  qty = 1,
): Promise<number> {
  return resolveUnitPrice(supabase, userId, productId, qty);
}
