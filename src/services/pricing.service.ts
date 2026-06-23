import type { SupabaseClient } from "@supabase/supabase-js";

import { isDealerUser } from "@/services/tier.service";

type ProductPriceInput = {
  id: string;
  retailPrice: number;
  dealerPrice?: number;
};

/** Bulk member/dealer prices for storefront cards (avoids N+1 per product). */
export async function resolveMemberPricesForProducts(
  supabase: SupabaseClient,
  userId: string,
  products: ProductPriceInput[],
): Promise<Record<string, number>> {
  if (!products.length) return {};

  const [{ data: profile }, dealer] = await Promise.all([
    supabase
      .from("profiles")
      .select("member_tier")
      .eq("id", userId)
      .maybeSingle(),
    isDealerUser(supabase, userId),
  ]);

  const tier = profile?.member_tier ?? "retail";
  const productIds = products.map((p) => p.id);
  const result: Record<string, number> = {};

  let tierPrices = new Map<string, number>();
  if (dealer || tier !== "retail") {
    const { data: rows } = await supabase
      .from("product_tier_prices")
      .select("product_id, price")
      .in("product_id", productIds)
      .eq("tier", tier);

    tierPrices = new Map(
      (rows ?? []).map((r) => [r.product_id, Number(r.price)]),
    );
  }

  let discountPct = 0;
  if (tier !== "retail" || dealer) {
    const { data: tierRow } = await supabase
      .from("member_tiers")
      .select("discount_pct")
      .eq("tier", tier)
      .eq("is_active", true)
      .maybeSingle();
    discountPct = Number(tierRow?.discount_pct ?? 0);
  }

  for (const product of products) {
    const tierPrice = tierPrices.get(product.id);
    if (tierPrice != null) {
      result[product.id] = tierPrice;
      continue;
    }

    if (dealer && (product.dealerPrice ?? 0) > 0) {
      result[product.id] = product.dealerPrice!;
      continue;
    }

    if (discountPct > 0) {
      result[product.id] =
        Math.round(product.retailPrice * (1 - discountPct / 100) * 100) / 100;
      continue;
    }

    result[product.id] = product.retailPrice;
  }

  return result;
}
