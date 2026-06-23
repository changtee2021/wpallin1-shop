import type { SupabaseClient } from "@supabase/supabase-js";

export type LowStockProductDto = {
  id: string;
  name: string;
  sku: string | null;
  stockQty: number;
  minOrderQty: number;
};

export async function listLowStockProducts(
  supabase: SupabaseClient,
  threshold = 5,
): Promise<LowStockProductDto[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, stock_qty, min_order_qty")
    .eq("is_active", true)
    .lte("stock_qty", threshold)
    .order("stock_qty", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: String(row.id),
    name: String(row.name),
    sku: row.sku ? String(row.sku) : null,
    stockQty: Number(row.stock_qty),
    minOrderQty: Number(row.min_order_qty),
  }));
}

export async function updateProductStock(
  supabase: SupabaseClient,
  productId: string,
  stockQty: number,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({ stock_qty: stockQty, updated_at: new Date().toISOString() })
    .eq("id", productId);
  if (error) throw new Error(error.message);
}
