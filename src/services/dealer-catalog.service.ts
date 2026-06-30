import type { SupabaseClient } from "@supabase/supabase-js";

export type DealerProductDto = {
  id: string;
  slug: string;
  name: string;
  sku: string | null;
  retailPrice: number;
  dealerPrice: number;
  tierPrice: number | null;
  moq: number;
  stock: number;
  imageUrl: string | null;
};

export async function listDealerProducts(
  supabase: SupabaseClient,
  userId: string,
): Promise<DealerProductDto[]> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("member_tier")
    .eq("id", userId)
    .maybeSingle();

  const tier = profile?.member_tier ?? "silver_dealer";

  const { data: products, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, sku, retail_price, dealer_price, min_order_qty, stock_qty, image_url",
    )
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(error.message);

  const { data: tierPrices } = await supabase
    .from("product_tier_prices")
    .select("product_id, price")
    .eq("tier", tier);

  const tierMap = new Map(
    (tierPrices ?? []).map((t) => [t.product_id, Number(t.price)]),
  );

  return (products ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    retailPrice: Number(p.retail_price),
    dealerPrice: Number(p.dealer_price),
    tierPrice: tierMap.get(p.id) ?? Number(p.dealer_price),
    moq: p.min_order_qty,
    stock: Number(p.stock_qty),
    imageUrl: p.image_url,
  }));
}

export async function getDealerDashboard(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("member_tier, order_count, total_spent")
    .eq("id", userId)
    .maybeSingle();

  const { count } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: recentOrder } = await supabase
    .from("orders")
    .select("id, order_number, created_at, grand_total")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    tier: profile?.member_tier ?? "silver_dealer",
    orderCount: count ?? 0,
    totalSpent: Number(profile?.total_spent ?? 0),
    recentOrder: recentOrder
      ? {
          id: recentOrder.id,
          orderNumber: recentOrder.order_number,
          createdAt: recentOrder.created_at,
          grandTotal: Number(recentOrder.grand_total),
        }
      : null,
  };
}
