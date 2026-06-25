import type { SupabaseClient } from "@supabase/supabase-js";

import { calcOrderTotals } from "@/domain/pricing";
import { resolveProductUnitPrice } from "@/services/tier.service";
import { notifyStaff, notifyUserEvent } from "@/services/notification.service";
import type {
  QuotationBuyerInput,
  QuotationDto,
  QuotationItemDto,
  QuotationMetadata,
  QuotationStatus,
} from "@/types/api/quotations";

const DEFAULT_PAYMENT_TERMS =
  "ชำระมัดจำ 50% เมื่อยืนยันใบเสนอราคา ส่วนที่เหลือก่อนจัดส่ง";
const DEFAULT_DELIVERY_TERMS =
  "จัดส่งภายใน 7–14 วันทำการหลังยืนยันและชำระมัดจำ (ขึ้นกับประเภทสินค้า)";

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

function parseMetadata(raw: unknown): QuotationMetadata {
  if (!raw || typeof raw !== "object") return {};
  return raw as QuotationMetadata;
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
    taxAmount: Number(row.tax_amount ?? 0),
    grandTotal: Number(row.grand_total),
    note: (row.note as string | null) ?? null,
    createdAt: row.created_at as string,
    metadata: parseMetadata(row.metadata),
  };
}

function formatAddress(meta: QuotationMetadata): string {
  const addr = meta.address;
  if (!addr?.line1) return "";
  return [addr.line1, addr.district, addr.province, addr.postalCode]
    .filter(Boolean)
    .join(" ");
}

function buildBuyerMetadata(buyer: QuotationBuyerInput): QuotationMetadata {
  return {
    source: "cart_request",
    customerType: buyer.customerType,
    taxId: buyer.taxId?.trim() || null,
    companyName: buyer.companyName?.trim() || null,
    companyBranch: buyer.companyBranch?.trim() || null,
    address: {
      line1: buyer.line1.trim(),
      district: buyer.district?.trim() || null,
      province: buyer.province?.trim() || null,
      postalCode: buyer.postalCode?.trim() || null,
    },
    paymentTerms: DEFAULT_PAYMENT_TERMS,
    deliveryTerms: DEFAULT_DELIVERY_TERMS,
  };
}

export async function requestQuoteFromCart(
  supabase: SupabaseClient,
  userId: string,
  cartId: string,
  buyer: QuotationBuyerInput,
  itemIds?: string[],
): Promise<string> {
  const { data: cartRow } = await supabase
    .from("carts")
    .select("subtotal, discount")
    .eq("id", cartId)
    .maybeSingle();

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      "id, product_id, product_name, qty, unit_price, line_total, configuration_id, config_snapshot",
    )
    .eq("cart_id", cartId);

  const selectedIds = itemIds?.length ? new Set(itemIds) : null;
  const quoteCartItems = (cartItems ?? []).filter((item) =>
    selectedIds ? selectedIds.has(item.id) : true,
  );

  if (!quoteCartItems.length) throw new Error("ไม่มีรายการที่เลือก");

  const quoteItems: Array<{
    product_id: string | null;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
    config_snapshot: Record<string, unknown>;
  }> = [];

  let selectedSubtotal = 0;
  for (const item of quoteCartItems) {
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
    selectedSubtotal += lineTotal;
    quoteItems.push({
      product_id: item.product_id,
      product_name: item.product_name,
      qty,
      unit_price: unitPrice,
      line_total: lineTotal,
      config_snapshot: (item.config_snapshot ?? {}) as Record<string, unknown>,
    });
  }

  const cartSubtotal = Number(cartRow?.subtotal ?? selectedSubtotal);
  const cartDiscount = Number(cartRow?.discount ?? 0);
  const proportionalDiscount =
    cartSubtotal > 0
      ? Math.round((selectedSubtotal / cartSubtotal) * cartDiscount * 100) / 100
      : 0;

  const totals = calcOrderTotals(selectedSubtotal, 0, proportionalDiscount);

  const metadata = buildBuyerMetadata(buyer);

  const { data: quote, error } = await supabase
    .from("quotations")
    .insert({
      user_id: userId,
      status: "draft",
      customer_name: buyer.customerName.trim(),
      customer_email: buyer.customerEmail?.trim() || null,
      customer_phone: buyer.customerPhone.trim(),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax_amount: totals.taxAmount ?? 0,
      grand_total: totals.grandTotal,
      note: buyer.note?.trim() || null,
      metadata,
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
    customerEmail: buyer.customerEmail,
    customerName: buyer.customerName,
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

function mapQuotationItem(row: Record<string, unknown>): QuotationItemDto {
  const snapshot = (row.config_snapshot ?? {}) as {
    optionLabels?: Record<string, string>;
    groupLabels?: Record<string, string>;
  };
  const optionSummary =
    snapshot.optionLabels && Object.keys(snapshot.optionLabels).length
      ? Object.entries(snapshot.optionLabels)
          .map(([groupKey, label]) => {
            const groupLabel = snapshot.groupLabels?.[groupKey] ?? groupKey;
            return `${groupLabel}: ${label}`;
          })
          .join(" · ")
      : null;

  return {
    id: row.id as string,
    productId: row.product_id as string | null,
    productName: row.product_name as string,
    qty: Number(row.qty),
    unitPrice: Number(row.unit_price),
    lineTotal: Number(row.line_total),
    optionSummary,
  };
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
    .select(
      "id, product_id, product_name, qty, unit_price, line_total, config_snapshot",
    )
    .eq("quotation_id", quotationId);

  const dto = mapQuotation(data);
  dto.items = (items ?? []).map(mapQuotationItem);
  return dto;
}

export async function getQuotationByPublicToken(
  supabase: SupabaseClient,
  token: string,
): Promise<QuotationDto | null> {
  const { data, error } = await supabase
    .from("quotations")
    .select("id")
    .filter("metadata->>publicToken", "eq", token)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return getQuotationDetail(supabase, data.id as string);
}

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function updateQuotationStatus(
  supabase: SupabaseClient,
  quotationId: string,
  toStatus: QuotationStatus,
  note?: string,
): Promise<{ publicToken?: string }> {
  const { data: current } = await supabase
    .from("quotations")
    .select("status, user_id, quotation_number, metadata, valid_until")
    .eq("id", quotationId)
    .maybeSingle();

  if (!current) throw new Error("ไม่พบใบเสนอราคา");

  const metadata = parseMetadata(current.metadata);
  let publicToken = metadata.publicToken;

  const updates: Record<string, unknown> = {
    status: toStatus,
    updated_at: new Date().toISOString(),
  };

  if (toStatus === "sent") {
    if (!publicToken) {
      publicToken = randomToken();
      metadata.publicToken = publicToken;
    }
    updates.metadata = metadata;
    if (!current.valid_until) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);
      updates.valid_until = validUntil.toISOString().slice(0, 10);
    }
  }

  await supabase.from("quotations").update(updates).eq("id", quotationId);

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
      publicToken,
    });
  }

  return { publicToken: publicToken ?? undefined };
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

export async function respondToQuotationByToken(
  supabase: SupabaseClient,
  token: string,
  accept: boolean,
): Promise<void> {
  const quote = await getQuotationByPublicToken(supabase, token);
  if (!quote) throw new Error("ไม่พบใบเสนอราคา");
  await respondToQuotation(supabase, quote.userId, quote.id, accept);
}

export async function convertQuotationToOrder(
  supabase: SupabaseClient,
  quotationId: string,
  staffUserId?: string,
): Promise<{ orderId: string; orderNumber: string }> {
  const quote = await getQuotationDetail(supabase, quotationId);
  if (!quote?.items?.length) throw new Error("ใบเสนอราคาไม่มีรายการ");
  if (quote.status !== "accepted") {
    throw new Error("แปลงเป็นออเดอร์ได้เมื่อลูกค้ายอมรับใบเสนอแล้วเท่านั้น");
  }

  const meta = quote.metadata ?? {};
  const addressLine = formatAddress(meta) || "จากใบเสนอราคา";

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
    line1: addressLine,
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

export async function updateQuotationTerms(
  supabase: SupabaseClient,
  quotationId: string,
  input: {
    paymentTerms?: string;
    deliveryTerms?: string;
    customerNote?: string;
    validUntil?: string;
  },
): Promise<void> {
  const { data: current } = await supabase
    .from("quotations")
    .select("metadata")
    .eq("id", quotationId)
    .maybeSingle();
  if (!current) throw new Error("ไม่พบใบเสนอราคา");

  const metadata = parseMetadata(current.metadata);
  if (input.paymentTerms !== undefined) {
    metadata.paymentTerms = input.paymentTerms.trim() || null;
  }
  if (input.deliveryTerms !== undefined) {
    metadata.deliveryTerms = input.deliveryTerms.trim() || null;
  }
  if (input.customerNote !== undefined) {
    metadata.customerNote = input.customerNote.trim() || null;
  }

  const updates: Record<string, unknown> = {
    metadata,
    updated_at: new Date().toISOString(),
  };
  if (input.validUntil) updates.valid_until = input.validUntil;

  await supabase.from("quotations").update(updates).eq("id", quotationId);
}
