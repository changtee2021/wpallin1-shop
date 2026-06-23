import type { SupabaseClient } from "@supabase/supabase-js";

import type { ProductPublicDto } from "@/types/api/products";

export async function listWishlistProducts(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProductPublicDto[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select(
      "created_at, products:product_id(id, slug, name, description, sku, product_type, retail_price, compare_at_price, image_url, is_featured, is_active, stock_qty, min_order_qty, category_id, created_at)",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => {
      const p = row.products as Record<string, unknown> | null;
      if (!p) return null;
      return {
        id: String(p.id),
        slug: String(p.slug),
        name: String(p.name),
        description: p.description ? String(p.description) : null,
        categorySlug: null,
        categoryName: null,
        sku: p.sku ? String(p.sku) : String(p.slug),
        productType: String(p.product_type) as ProductPublicDto["productType"],
        retailPrice: Number(p.retail_price),
        compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
        imageUrl: p.image_url ? String(p.image_url) : null,
        isFeatured: Boolean(p.is_featured),
        isActive: Boolean(p.is_active),
        stock: Number(p.stock_qty),
        moq: Number(p.min_order_qty),
        leadTimeDays: null,
      } satisfies ProductPublicDto;
    })
    .filter(Boolean) as ProductPublicDto[];
}

export async function addWishlistItem(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase.from("wishlist_items").upsert({
    user_id: userId,
    product_id: productId,
  });
  if (error) throw new Error(error.message);
}

export async function removeWishlistItem(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<void> {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
}

export async function isProductWishlisted(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();
  return !!data;
}

export async function listWishlistedProductIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => String(row.product_id));
}
