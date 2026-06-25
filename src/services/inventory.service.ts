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

type OrderInventoryRow = {
  id: string;
  metadata: Record<string, unknown> | null;
};

type OrderInventoryItemRow = {
  product_id: string | null;
  qty: number;
};

type ProductStockRow = {
  id: string;
  stock_qty: number;
};

export async function decrementStockForPaidOrder(
  supabase: SupabaseClient,
  orderId: string,
): Promise<void> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, metadata")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) throw new Error(orderErr.message);
  if (!order) throw new Error("ไม่พบออเดอร์");

  const typedOrder = order as OrderInventoryRow;
  const metadata = typedOrder.metadata ?? {};
  if (metadata.stock_decremented_at) return;

  const { data: items, error: itemsErr } = await supabase
    .from("order_items")
    .select("product_id, qty")
    .eq("order_id", orderId)
    .not("product_id", "is", null);

  if (itemsErr) throw new Error(itemsErr.message);

  const qtyByProduct = new Map<string, number>();
  for (const item of (items ?? []) as OrderInventoryItemRow[]) {
    if (!item.product_id) continue;
    qtyByProduct.set(
      item.product_id,
      (qtyByProduct.get(item.product_id) ?? 0) + Number(item.qty),
    );
  }

  if (qtyByProduct.size === 0) {
    await markOrderStockDecremented(supabase, orderId, metadata);
    return;
  }

  const productIds = [...qtyByProduct.keys()];
  const { data: products, error: productsErr } = await supabase
    .from("products")
    .select("id, stock_qty")
    .in("id", productIds);

  if (productsErr) throw new Error(productsErr.message);

  await Promise.all(
    ((products ?? []) as ProductStockRow[]).map((product) => {
      const decrement = qtyByProduct.get(product.id) ?? 0;
      const nextQty = Math.max(0, Number(product.stock_qty) - decrement);
      return updateProductStock(supabase, product.id, nextQty);
    }),
  );

  await markOrderStockDecremented(supabase, orderId, metadata);
}

async function markOrderStockDecremented(
  supabase: SupabaseClient,
  orderId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({
      metadata: {
        ...metadata,
        stock_decremented_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);
}
