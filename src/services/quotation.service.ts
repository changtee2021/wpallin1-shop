import type { SupabaseClient } from "@supabase/supabase-js";

import { calcOrderTotals } from "@/domain/pricing";
import { resolveProductUnitPrice } from "@/services/tier.service";
import { notifyStaff, notifyUserEvent } from "@/services/notification.service";
import type {
  QuotationDto,
  QuotationItemDto,
  QuotationStatus,
} from "@/types/api/quotations";

async function appendQuotationHistory(
  supabase: SupabaseClient,
  quotationId: string,
  fromStatus: QuotationStatus | null,
  toStatus: QuotationStatus,
  note?: string,
) {
  await supabase.from("quotation_status_history").insert({
    quotation_id: quotationId,
    from_status: fromStatus,
    to_status: toStatus,
    note: note ?? null,
  });
}

function mapQuotation(row: Record<string, unknown>): QuotationDto {
  return {
    id: row.id as string,
    quotationNumber: row.quotation_number as string,
    userId: row.user_id as string,
    status: row.status as QuotationStatus,
    customerName: (row.customer_name as string | null) ?? null,
    customerEmail: (row.customer_email as string | null) ?? null,
    customerPhone: (row.customer_phone as string | null) ?? null,
    validUntil: (row.valid_until as string | null) ?? null,
    subtotal: Number(row.subtotal),
    discount: Number(row.discount),
    grandTotal: Number(row.grand_total),
    note: (row.note as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function requestQuoteFromCart(
  supabase: SupabaseClient,
  userId: string,
  cartId: string,
  note?: string,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", userId)
    .maybeSingle();

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      "product_id, product_name, qty, unit_price, line_total, configuration_id",
    )
    .eq("cart_id", cartId);

  if (!cartItems?.length) throw new Error("ตะกร้าว่าง");

  const quoteItems: Array<{
    product_id: string | null;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
  }> = [];

  for (const item of cartItems) {
    let unitPrice = Number(item.unit_price);
    if (item.product_id && !item.configuration_id) {
      unitPrice = await resolveProductUnitPrice(
        supabase,
        userId,
        item.product_id,
      );
    }
    const qty = Number(item.qty);
    const lineTotal = Math.round(qty * unitPrice * 100) / 100;
    quoteItems.push({
      product_id: item.product_id,
      product_name: item.product_name,
      qty,
      unit_price: unitPrice,
      line_total: lineTotal,
    });
  }

  const subtotal = quoteItems.reduce((s, i) => s + i.line_total, 0);
  const totals = calcOrderTotals(subtotal, 0, 0);

  const { data: quote, error } = await supabase
    .from("quotations")
    .insert({
      user_id: userId,
      status: "draft",
      customer_name: profile?.full_name ?? null,
      customer_email: profile?.email ?? null,
      customer_phone: profile?.phone ?? null,
      subtotal: totals.subtotal,
      discount: totals.discount,
      grand_total: totals.grandTotal,
      note: note?.trim() || null,
      metadata: { source: "cart_request" },
    })
    .select("id, quotation_number")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("quotation_items")
    .insert(quoteItems.map((i) => ({ ...i, quotation_id: quote.id })));

  await appendQuotationHistory(
    supabase,
    quote.id,
    null,
    "draft",
    "Customer request",
  );

  await notifyStaff(supabase, "quote_request", {
    quotationId: quote.id,
    quotationNumber: quote.quotation_number,
    customerEmail: profile?.email,
  });

  return quote.id;
}

export async function listUserQuotations(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotationDto[]> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapQuotation);
}

export async function listAdminQuotations(
  supabase: SupabaseClient,
  status?: string,
): Promise<QuotationDto[]> {
  let q = supabase
    .from("quotations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapQuotation);
}

export async function getQuotationDetail(
  supabase: SupabaseClient,
  quotationId: string,
): Promise<QuotationDto | null> {
  const { data, error } = await supabase
    .from("quotations")
    .select("*")
    .eq("id", quotationId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const { data: items } = await supabase
    .from("quotation_items")
    .select("id, product_id, product_name, qty, unit_price, line_total")
    .eq("quotation_id", quotationId);

  const dto = mapQuotation(data);
  dto.items = (items ?? []).map(
    (i): QuotationItemDto => ({
      id: i.id,
      productId: i.product_id,
      productName: i.product_name,
      qty: Number(i.qty),
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    }),
  );
  return dto;
}

export async function updateQuotationStatus(
  supabase: SupabaseClient,
  quotationId: string,
  toStatus: QuotationStatus,
  note?: string,
): Promise<void> {
  const { data: current } = await supabase
    .from("quotations")
    .select("status, user_id, quotation_number")
    .eq("id", quotationId)
    .maybeSingle();

  if (!current) throw new Error("ไม่พบใบเสนอราคา");

  await supabase
    .from("quotations")
    .update({ status: toStatus, updated_at: new Date().toISOString() })
    .eq("id", quotationId);

  await appendQuotationHistory(
    supabase,
    quotationId,
    current.status as QuotationStatus,
    toStatus,
    note,
  );

  if (toStatus === "sent") {
    await notifyUserEvent(supabase, current.user_id, "quotation_sent", {
      quotationId,
      quotationNumber: current.quotation_number,
    });
  }
}

export async function respondToQuotation(
  supabase: SupabaseClient,
  userId: string,
  quotationId: string,
  accept: boolean,
): Promise<void> {
  const { data: quote } = await supabase
    .from("quotations")
    .select("user_id, status, quotation_number")
    .eq("id", quotationId)
    .maybeSingle();

  if (!quote || quote.user_id !== userId) throw new Error("ไม่พบใบเสนอราคา");
  if (quote.status !== "sent") throw new Error("ใบเสนอนี้ไม่สามารถตอบได้");

  const status = accept ? "accepted" : "rejected";
  await updateQuotationStatus(supabase, quotationId, status);

  await notifyStaff(
    supabase,
    accept ? "quotation_accepted" : "quotation_rejected",
    {
      quotationId,
      quotationNumber: quote.quotation_number,
    },
  );
}

export async function convertQuotationToOrder(
  supabase: SupabaseClient,
  quotationId: string,
  staffUserId?: string,
): Promise<{ orderId: string; orderNumber: string }> {
  const quote = await getQuotationDetail(supabase, quotationId);
  if (!quote?.items?.length) throw new Error("ใบเสนอราคาไม่มีรายการ");
  if (!["accepted", "sent", "draft"].includes(quote.status)) {
    throw new Error("ไม่สามารถแปลงใบเสนอนี้ได้");
  }

  const { placeOrderOnBehalf } = await import("@/services/checkout.service");

  const result = await placeOrderOnBehalf(supabase, {
    staffUserId,
    customerUserId: quote.userId,
    items: quote.items.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      qty: i.qty,
      unitPrice: i.unitPrice,
    })),
    recipientName: quote.customerName ?? "ลูกค้า",
    phone: quote.customerPhone ?? "-",
    line1: "จากใบเสนอราคา",
    paymentMethod: "bank_transfer",
    internalNote: `จากใบเสนอ ${quote.quotationNumber}`,
    quotationId,
    discount: quote.discount,
  });

  await supabase
    .from("quotations")
    .update({
      status: "converted",
      converted_order_id: result.orderId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", quotationId);

  await appendQuotationHistory(
    supabase,
    quotationId,
    quote.status,
    "converted",
  );

  return { orderId: result.orderId, orderNumber: result.orderNumber };
}
