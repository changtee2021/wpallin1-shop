import type { SupabaseClient } from "@supabase/supabase-js";

import { calcLineTotal } from "@/domain/pricing";
import { getCart, recalcCartTotals } from "@/services/cart.service";
import { resolveProductUnitPrice } from "@/services/pricing-resolver";
import type { CartDto } from "@/types/api/cart";
import type {
  CreateOrderLinkInput,
  OrderLinkDto,
  OrderLinkItemDto,
  OrderLinkStatus,
} from "@/types/api/order-links";

type CartContext = {
  userId?: string | null;
  sessionId?: string | null;
};

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

function mapItems(rows: Record<string, unknown>[]): OrderLinkItemDto[] {
  return rows.map((row) => {
    const qty = Number(row.qty);
    const unitPrice = Number(row.unit_price);
    return {
      id: row.id as string,
      productId: (row.product_id as string | null) ?? null,
      sku: row.sku as string,
      productName: row.product_name as string,
      qty,
      unitPrice,
      lineTotal: calcLineTotal(qty, unitPrice),
    };
  });
}

function mapOrderLink(
  link: Record<string, unknown>,
  items: OrderLinkItemDto[],
): OrderLinkDto {
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return {
    id: link.id as string,
    token: link.token as string,
    status: link.status as OrderLinkStatus,
    customerNote: (link.customer_note as string | null) ?? null,
    expiresAt: link.expires_at as string,
    subtotal,
    itemCount: items.reduce((n, i) => n + i.qty, 0),
    items,
    createdAt: link.created_at as string,
  };
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

export async function createOrderLink(
  supabase: SupabaseClient,
  userId: string,
  input: CreateOrderLinkInput,
): Promise<{ token: string; url: string }> {
  if (!input.items.length) throw new Error("ไม่มีรายการสินค้า");
  if (input.items.length > 100) throw new Error("รายการมากเกินไป");

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const { data: products, error: productErr } = await supabase
    .from("products")
    .select("id, name, sku, is_active")
    .in("id", productIds);
  if (productErr) throw new Error(productErr.message);
  const byId = new Map((products ?? []).map((row) => [row.id, row]));

  const pricedItems = [];
  for (const item of input.items) {
    const product = byId.get(item.productId);
    if (!product?.is_active || !product.sku || !product.name) {
      throw new Error("สินค้าไม่พร้อมขาย");
    }
    const unitPrice = await resolveProductUnitPrice(
      supabase,
      userId,
      item.productId,
      item.qty,
    );
    pricedItems.push({
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      qty: item.qty,
      unitPrice,
    });
  }

  const token = randomToken();
  const days = input.expiresInDays ?? 7;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);

  const { data: link, error: linkErr } = await supabase
    .from("order_links")
    .insert({
      token,
      created_by: userId,
      customer_note: input.customerNote?.trim() || null,
      expires_at: expiresAt.toISOString(),
      status: "pending",
    })
    .select("id, token")
    .single();

  if (linkErr) throw new Error(linkErr.message);

  const { error: itemsErr } = await supabase.from("order_link_items").insert(
    pricedItems.map((item, index) => ({
      order_link_id: link.id,
      product_id: item.productId,
      sku: item.sku,
      product_name: item.productName,
      qty: item.qty,
      unit_price: item.unitPrice,
      sort_order: index,
    })),
  );

  if (itemsErr) throw new Error(itemsErr.message);

  return { token: link.token, url: `/o/${link.token}` };
}

export async function getOrderLinkByToken(
  supabase: SupabaseClient,
  token: string,
  markOpened = true,
): Promise<OrderLinkDto | null> {
  const { data: link, error } = await supabase
    .from("order_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!link) return null;

  if (isExpired(link.expires_at as string) && link.status !== "ordered") {
    if (link.status !== "expired") {
      await supabase
        .from("order_links")
        .update({ status: "expired" })
        .eq("id", link.id);
      link.status = "expired";
    }
  }

  const { data: itemRows, error: itemsErr } = await supabase
    .from("order_link_items")
    .select("*")
    .eq("order_link_id", link.id)
    .order("sort_order", { ascending: true });

  if (itemsErr) throw new Error(itemsErr.message);

  if (
    markOpened &&
    link.status === "pending" &&
    !isExpired(link.expires_at as string)
  ) {
    await supabase
      .from("order_links")
      .update({ status: "opened", opened_at: new Date().toISOString() })
      .eq("id", link.id);
    link.status = "opened";
  }

  return mapOrderLink(link, mapItems(itemRows ?? []));
}

async function resolveCartId(
  supabase: SupabaseClient,
  ctx: CartContext,
): Promise<string> {
  if (ctx.userId) {
    const { data } = await supabase
      .from("carts")
      .select("id")
      .eq("user_id", ctx.userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) return data.id;
    const { data: created, error } = await supabase
      .from("carts")
      .insert({ user_id: ctx.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return created.id;
  }

  if (!ctx.sessionId) throw new Error("Missing cart session");

  const { data } = await supabase
    .from("carts")
    .select("id")
    .eq("session_id", ctx.sessionId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data) return data.id;

  const { data: created, error } = await supabase
    .from("carts")
    .insert({ session_id: ctx.sessionId })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return created.id;
}

export async function acceptOrderLinkToCart(
  supabase: SupabaseClient,
  token: string,
  ctx: CartContext,
): Promise<CartDto> {
  const link = await getOrderLinkByToken(supabase, token, false);
  if (!link) throw new Error("ไม่พบลิงก์สั่ง");
  if (link.status === "expired" || isExpired(link.expiresAt)) {
    throw new Error("ลิงก์หมดอายุแล้ว");
  }
  if (link.status === "ordered") {
    throw new Error("ลิงก์นี้สั่งไปแล้ว");
  }
  if (link.status === "cancelled") {
    throw new Error("ลิงก์ถูกยกเลิกแล้ว");
  }

  const cartId = await resolveCartId(supabase, ctx);

  for (const item of link.items) {
    if (!item.productId) continue;
    const unitPrice = await resolveProductUnitPrice(
      supabase,
      ctx.userId,
      item.productId,
      item.qty,
    );
    const lineTotal = calcLineTotal(item.qty, unitPrice);
    const { data: existing } = await supabase
      .from("cart_items")
      .select("id, qty")
      .eq("cart_id", cartId)
      .eq("product_id", item.productId)
      .maybeSingle();

    if (existing) {
      const newQty = Number(existing.qty) + item.qty;
      const newLineTotal = calcLineTotal(newQty, unitPrice);
      const { error: updateErr } = await supabase
        .from("cart_items")
        .update({
          qty: newQty,
          unit_price: unitPrice,
          line_total: newLineTotal,
        })
        .eq("id", existing.id);
      if (updateErr) throw new Error(updateErr.message);
    } else {
      const { error: insertErr } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        product_id: item.productId,
        product_name: item.productName,
        sku: item.sku,
        qty: item.qty,
        unit_price: unitPrice,
        line_total: lineTotal,
        config_snapshot: { source: "order_link", token },
      });
      if (insertErr) throw new Error(insertErr.message);
    }
  }

  await recalcCartTotals(supabase, cartId);

  const { error: linkErr } = await supabase
    .from("order_links")
    .update({
      status: "ordered",
      ordered_at: new Date().toISOString(),
    })
    .eq("token", token);
  if (linkErr) throw new Error(linkErr.message);

  return getCart(supabase, ctx);
}
