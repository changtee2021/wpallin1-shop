import type { SupabaseClient } from "@supabase/supabase-js";

export type ProductReviewDto = {
  id: string;
  userId: string;
  authorName: string | null;
  rating: number;
  title: string | null;
  body: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
};

export type ProductReviewSummary = {
  average: number;
  count: number;
};

export async function listProductReviews(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductReviewDto[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, user_id, rating, title, body, is_verified_purchase, created_at")
    .eq("product_id", productId)
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);

  const userIds = [...new Set((data ?? []).map((row) => String(row.user_id)))];
  const nameByUser = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      if (p.display_name) nameByUser.set(String(p.id), String(p.display_name));
    }
  }

  return (data ?? []).map((row) => ({
    id: String(row.id),
    userId: String(row.user_id),
    authorName: nameByUser.get(String(row.user_id)) ?? null,
    rating: Number(row.rating),
    title: row.title ? String(row.title) : null,
    body: String(row.body),
    isVerifiedPurchase: Boolean(row.is_verified_purchase),
    createdAt: String(row.created_at),
  }));
}

export async function getProductReviewSummary(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductReviewSummary> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("is_published", true);

  if (error) throw new Error(error.message);
  const rows = data ?? [];
  if (rows.length === 0) return { average: 0, count: 0 };

  const sum = rows.reduce((acc, row) => acc + Number(row.rating), 0);
  return { average: Math.round((sum / rows.length) * 10) / 10, count: rows.length };
}

export async function submitProductReview(
  supabase: SupabaseClient,
  userId: string,
  input: {
    productId: string;
    rating: number;
    title?: string;
    body: string;
  },
): Promise<void> {
  const { data: paidOrders } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("payment_status", "paid");

  let verified = false;
  const orderIds = (paidOrders ?? []).map((o) => o.id);
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("id")
      .eq("product_id", input.productId)
      .in("order_id", orderIds)
      .limit(1);
    verified = (items ?? []).length > 0;
  }

  const { error } = await supabase.from("product_reviews").upsert(
    {
      product_id: input.productId,
      user_id: userId,
      rating: input.rating,
      title: input.title?.trim() ?? null,
      body: input.body.trim(),
      is_verified_purchase: verified,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id,user_id" },
  );

  if (error) throw new Error(error.message);
}
