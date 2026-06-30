import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrderDetailDto, OrderSummaryDto } from "@/types/api/orders";

export async function listUserOrders(
  supabase: SupabaseClient,
  userId: string,
): Promise<OrderSummaryDto[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, order_number, status, payment_status, grand_total, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as OrderSummaryDto["status"],
    paymentStatus: row.payment_status as OrderSummaryDto["paymentStatus"],
    grandTotal: Number(row.grand_total),
    createdAt: row.created_at,
  }));
}

export async function getOrderDetail(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
): Promise<OrderDetailDto | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_id, product_name, sku, qty, unit_price, line_total")
    .eq("order_id", orderId);

  const { data: payment } = await supabase
    .from("payments")
    .select("id")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: history } = await supabase
    .from("order_status_history")
    .select("id, status, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const { data: prodJob } = await supabase
    .from("production_jobs")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  let productionSteps: OrderDetailDto["productionSteps"] = [];
  if (prodJob) {
    const { data: steps } = await supabase
      .from("production_steps")
      .select("id, step_name, status, sort_order")
      .eq("production_job_id", prodJob.id)
      .order("sort_order", { ascending: true });
    productionSteps = (steps ?? []).map((s) => ({
      id: s.id,
      stepName: s.step_name,
      status: s.status,
      sortOrder: s.sort_order,
    }));
  }

  const { data: bankSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment.bank_accounts")
    .maybeSingle();

  const bankAccounts = Array.isArray(bankSetting?.value)
    ? (bankSetting.value as OrderDetailDto["bankAccounts"])
    : [];

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as OrderDetailDto["status"],
    paymentStatus: order.payment_status as OrderDetailDto["paymentStatus"],
    grandTotal: Number(order.grand_total),
    createdAt: order.created_at,
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shipping_fee),
    discount: Number(order.discount),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    shippingAddress: order.shipping_address as Record<string, unknown> | null,
    items: (items ?? []).map((i) => ({
      id: i.id,
      productId: (i.product_id as string | null) ?? null,
      productName: i.product_name,
      sku: i.sku,
      qty: Number(i.qty),
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    })),
    bankAccounts,
    paymentId: payment?.id ?? null,
    statusHistory: (history ?? []).map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      createdAt: h.created_at,
    })),
    productionSteps,
  };
}
