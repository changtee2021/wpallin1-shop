import type { SupabaseClient } from "@supabase/supabase-js";

import { validateCartQty } from "@/domain/cart";
import { calcCartSubtotal, calcLineTotal } from "@/domain/pricing";
import { getProductById } from "@/services/catalog.service";
import {
  getProductPricingRow,
  resolveProductUnitPrice,
} from "@/services/pricing-resolver";
import type { CartDto, CartItemDto } from "@/types/api/cart";

type CartContext = {
  userId?: string | null;
  sessionId?: string | null;
};

async function resolveCart(supabase: SupabaseClient, ctx: CartContext) {
  if (ctx.userId) {
    const { data } = await supabase
      .from("carts")
      .select("id, subtotal, discount")
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (data) return data;
    const { data: created, error } = await supabase
      .from("carts")
      .insert({ user_id: ctx.userId })
      .select("id, subtotal, discount")
      .single();
    if (error) throw new Error(error.message);
    return created;
  }

  if (!ctx.sessionId) throw new Error("Missing cart session");

  const { data } = await supabase
    .from("carts")
    .select("id, subtotal, discount")
    .eq("session_id", ctx.sessionId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ session_id: ctx.sessionId })
    .select("id, subtotal, discount")
    .single();
  if (error) throw new Error(error.message);
  return created;
}

async function mapCartItems(
  supabase: SupabaseClient,
  cartId: string,
): Promise<CartItemDto[]> {
  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, product_name, sku, qty, unit_price, line_total")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  const items: CartItemDto[] = [];
  for (const row of data ?? []) {
    let imageUrl: string | null = null;
    let slug: string | null = null;
    if (row.product_id) {
      const product = await getProductById(supabase, row.product_id);
      imageUrl = product?.imageUrl ?? null;
      slug = product?.slug ?? null;
    }
    items.push({
      id: row.id,
      productId: row.product_id,
      productName: row.product_name,
      sku: row.sku,
      qty: Number(row.qty),
      unitPrice: Number(row.unit_price),
      lineTotal: Number(row.line_total),
      imageUrl,
      slug,
    });
  }
  return items;
}

export async function resolveCartForContext(
  supabase: SupabaseClient,
  ctx: CartContext,
) {
  return resolveCart(supabase, ctx);
}

export async function recalcCartTotals(
  supabase: SupabaseClient,
  cartId: string,
) {
  const items = await mapCartItems(supabase, cartId);
  const subtotal = calcCartSubtotal(
    items.map((i) => ({ qty: i.qty, unitPrice: i.unitPrice })),
  );
  await supabase
    .from("carts")
    .update({ subtotal, updated_at: new Date().toISOString() })
    .eq("id", cartId);
  return subtotal;
}

async function recalcCartTotalsInternal(
  supabase: SupabaseClient,
  cartId: string,
) {
  return recalcCartTotals(supabase, cartId);
}

async function refreshCartTierPrices(
  supabase: SupabaseClient,
  cartId: string,
  userId: string,
) {
  const { data: rows } = await supabase
    .from("cart_items")
    .select("id, product_id, configuration_id, qty")
    .eq("cart_id", cartId);

  for (const row of rows ?? []) {
    if (!row.product_id || row.configuration_id) continue;
    const unitPrice = await resolveProductUnitPrice(
      supabase,
      userId,
      row.product_id,
      Number(row.qty),
    );
    const lineTotal = calcLineTotal(Number(row.qty), unitPrice);
    await supabase
      .from("cart_items")
      .update({ unit_price: unitPrice, line_total: lineTotal })
      .eq("id", row.id);
  }
}

export async function getCart(
  supabase: SupabaseClient,
  ctx: CartContext,
): Promise<CartDto> {
  const cart = await resolveCart(supabase, ctx);
  if (ctx.userId) {
    await refreshCartTierPrices(supabase, cart.id, ctx.userId);
  }
  const items = await mapCartItems(supabase, cart.id);
  const subtotal = calcCartSubtotal(
    items.map((i) => ({ qty: i.qty, unitPrice: i.unitPrice })),
  );
  return {
    id: cart.id,
    items,
    subtotal,
    discount: Number(cart.discount),
    itemCount: items.reduce((n, i) => n + i.qty, 0),
  };
}

export async function addToCart(
  supabase: SupabaseClient,
  ctx: CartContext,
  productId: string,
  qty = 1,
): Promise<CartDto> {
  const product = await getProductById(supabase, productId);
  if (!product) throw new Error("ไม่พบสินค้า");

  const pricing = await getProductPricingRow(supabase, productId);
  const orderStep = pricing?.orderStep ?? 1;
  const err = validateCartQty(qty, product.moq, product.stock, orderStep);
  if (err) throw new Error(err);

  const cart = await resolveCart(supabase, ctx);
  const unitPrice = await resolveProductUnitPrice(
    supabase,
    ctx.userId,
    productId,
    qty,
  );

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("cart_id", cart.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    const newQty = Number(existing.qty) + qty;
    const qtyErr = validateCartQty(
      newQty,
      product.moq,
      product.stock,
      orderStep,
    );
    if (qtyErr) throw new Error(qtyErr);
    const lineTotal = calcLineTotal(newQty, unitPrice);
    const { error } = await supabase
      .from("cart_items")
      .update({ qty: newQty, unit_price: unitPrice, line_total: lineTotal })
      .eq("id", existing.id);
    if (error) throw new Error(error.message);
  } else {
    const lineTotal = calcLineTotal(qty, unitPrice);
    const { error } = await supabase.from("cart_items").insert({
      cart_id: cart.id,
      product_id: productId,
      product_name: product.name,
      sku: product.sku,
      qty,
      unit_price: unitPrice,
      line_total: lineTotal,
    });
    if (error) throw new Error(error.message);
  }

  await recalcCartTotalsInternal(supabase, cart.id);
  return getCart(supabase, ctx);
}

export async function updateCartItemQty(
  supabase: SupabaseClient,
  ctx: CartContext,
  itemId: string,
  qty: number,
): Promise<CartDto> {
  const cart = await resolveCart(supabase, ctx);
  const { data: item, error: itemErr } = await supabase
    .from("cart_items")
    .select("id, product_id, unit_price")
    .eq("id", itemId)
    .eq("cart_id", cart.id)
    .maybeSingle();
  if (itemErr) throw new Error(itemErr.message);
  if (!item) throw new Error("ไม่พบรายการในตะกร้า");

  if (qty <= 0) {
    await supabase.from("cart_items").delete().eq("id", itemId);
    await recalcCartTotalsInternal(supabase, cart.id);
    return getCart(supabase, ctx);
  }

  if (item.product_id) {
    const product = await getProductById(supabase, item.product_id);
    const pricing = await getProductPricingRow(supabase, item.product_id);
    if (product) {
      const err = validateCartQty(
        qty,
        product.moq,
        product.stock,
        pricing?.orderStep ?? 1,
      );
      if (err) throw new Error(err);
    }
  }

  const unitPrice = Number(item.unit_price);
  const lineTotal = calcLineTotal(qty, unitPrice);
  const { error } = await supabase
    .from("cart_items")
    .update({ qty, line_total: lineTotal })
    .eq("id", itemId);
  if (error) throw new Error(error.message);

  await recalcCartTotalsInternal(supabase, cart.id);
  return getCart(supabase, ctx);
}

export async function removeCartItem(
  supabase: SupabaseClient,
  ctx: CartContext,
  itemId: string,
): Promise<CartDto> {
  const cart = await resolveCart(supabase, ctx);
  await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("cart_id", cart.id);
  await recalcCartTotalsInternal(supabase, cart.id);
  return getCart(supabase, ctx);
}

export async function clearCart(supabase: SupabaseClient, cartId: string) {
  await supabase.from("cart_items").delete().eq("cart_id", cartId);
  await supabase
    .from("carts")
    .update({ subtotal: 0, discount: 0 })
    .eq("id", cartId);
}

export async function mergeGuestCartToUser(
  supabase: SupabaseClient,
  sessionId: string,
  userId: string,
) {
  const { data: guestCart } = await supabase
    .from("carts")
    .select("id")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (!guestCart) return;

  const userCart = await resolveCart(supabase, { userId });
  const { data: guestItems } = await supabase
    .from("cart_items")
    .select("*")
    .eq("cart_id", guestCart.id);

  for (const item of guestItems ?? []) {
    await addToCart(supabase, { userId }, item.product_id!, Number(item.qty));
  }

  await supabase.from("carts").delete().eq("id", guestCart.id);
}
