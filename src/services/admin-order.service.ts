import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminOrderDetailDto,
  AdminOrderSummaryDto,
  OrderStatus,
} from "@/types/api/orders";
import { decrementStockForPaidOrder } from "@/services/inventory.service";

const SLIP_BUCKET = "wpall-retail-payment-slips";

export async function listAdminOrders(
  supabase: SupabaseClient,
  filter?: { status?: string; limit?: number },
): Promise<AdminOrderSummaryDto[]> {
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, status, payment_status, grand_total, customer_name, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(filter?.limit ?? 50);

  if (filter?.status) {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    status: row.status as AdminOrderSummaryDto["status"],
    paymentStatus: row.payment_status as AdminOrderSummaryDto["paymentStatus"],
    grandTotal: Number(row.grand_total),
    customerName: row.customer_name,
    createdAt: row.created_at,
  }));
}

export async function getSignedSlipUrl(
  supabase: SupabaseClient,
  storagePath: string,
): Promise<string | null> {
  const path = storagePath.startsWith("storage://")
    ? storagePath.replace("storage://", "")
    : storagePath;
  const { data, error } = await supabase.storage
    .from(SLIP_BUCKET)
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function getAdminOrderDetail(
  supabase: SupabaseClient,
  orderId: string,
): Promise<AdminOrderDetailDto | null> {
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("id, product_name, sku, qty, unit_price, line_total")
    .eq("order_id", orderId);

  const { data: payments } = await supabase
    .from("payments")
    .select("id, method, status, amount, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false });

  const payment = payments?.[0] ?? null;

  let slips: AdminOrderDetailDto["slips"] = [];
  if (payment) {
    const { data: slipRows } = await supabase
      .from("payment_slips")
      .select("id, file_url, uploaded_at, verified")
      .eq("payment_id", payment.id)
      .order("uploaded_at", { ascending: false });

    slips = await Promise.all(
      (slipRows ?? []).map(async (s) => ({
        id: s.id,
        uploadedAt: s.uploaded_at,
        verified: s.verified,
        signedUrl: await getSignedSlipUrl(supabase, s.file_url),
      })),
    );
  }

  const { data: history } = await supabase
    .from("order_status_history")
    .select("id, status, note, created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .maybeSingle();

  const metadata = (order.metadata as Record<string, unknown> | null) ?? null;
  const placedByUserId =
    typeof metadata?.placed_by_user_id === "string"
      ? metadata.placed_by_user_id
      : null;

  let placedByName: string | null = null;
  if (placedByUserId) {
    const { data: staffProfile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", placedByUserId)
      .maybeSingle();
    placedByName =
      staffProfile?.full_name ?? staffProfile?.email ?? placedByUserId;
  }

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status as AdminOrderDetailDto["status"],
    paymentStatus: order.payment_status as AdminOrderDetailDto["paymentStatus"],
    grandTotal: Number(order.grand_total),
    subtotal: Number(order.subtotal),
    shippingFee: Number(order.shipping_fee),
    discount: Number(order.discount),
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: profile?.email ?? null,
    userId: order.user_id,
    createdAt: order.created_at,
    shippingAddress: order.shipping_address as Record<string, unknown> | null,
    items: (items ?? []).map((i) => ({
      id: i.id,
      productName: i.product_name,
      sku: i.sku,
      qty: Number(i.qty),
      unitPrice: Number(i.unit_price),
      lineTotal: Number(i.line_total),
    })),
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amount: Number(payment.amount),
        }
      : null,
    slips,
    statusHistory: (history ?? []).map((h) => ({
      id: h.id,
      status: h.status,
      note: h.note,
      createdAt: h.created_at,
    })),
    metadata,
    placedByUserId,
    placedByName,
  };
}

async function appendStatusHistory(
  supabase: SupabaseClient,
  orderId: string,
  status: string,
  note?: string,
) {
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status,
    note: note ?? null,
  });
}

export async function createProductionJob(
  supabase: SupabaseClient,
  orderId: string,
) {
  const { data: existing } = await supabase
    .from("production_jobs")
    .select("id")
    .eq("order_id", orderId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: job, error } = await supabase
    .from("production_jobs")
    .insert({
      order_id: orderId,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const steps = [
    "waiting_fabric",
    "cutting",
    "sewing",
    "assembling",
    "quality_check",
    "packing",
  ];
  await supabase.from("production_steps").insert(
    steps.map((step, i) => ({
      production_job_id: job.id,
      step_code: step,
      step_name: step.replace(/_/g, " "),
      status: i === 0 ? "pending" : "pending",
      sort_order: i + 1,
    })),
  );

  return job.id;
}

export async function verifyPaymentSlip(
  supabase: SupabaseClient,
  adminUserId: string,
  orderId: string,
  paymentId: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("user_id, grand_total, order_number")
    .eq("id", orderId)
    .maybeSingle();

  const now = new Date().toISOString();

  await supabase
    .from("payment_slips")
    .update({ verified: true })
    .eq("payment_id", paymentId);

  await supabase
    .from("payments")
    .update({
      status: "paid",
      verified_by: adminUserId,
      verified_at: now,
      paid_at: now,
    })
    .eq("id", paymentId);

  await supabase
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", orderId);

  await appendStatusHistory(
    supabase,
    orderId,
    "paid",
    "Admin verified payment slip",
  );

  await decrementStockForPaidOrder(supabase, orderId);
  await createProductionJob(supabase, orderId);

  if (order?.user_id) {
    const { recordPaidOrderStats } = await import("@/services/tier.service");
    await recordPaidOrderStats(
      supabase,
      order.user_id,
      Number(order.grand_total),
    );
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, order.user_id, "order_paid", {
      orderId,
      orderNumber: order.order_number,
    });
  }
}

export async function rejectPaymentSlip(
  supabase: SupabaseClient,
  orderId: string,
  paymentId: string,
  note?: string,
): Promise<void> {
  await supabase
    .from("payments")
    .update({ status: "failed" })
    .eq("id", paymentId);

  await supabase
    .from("orders")
    .update({ status: "pending_payment", payment_status: "unpaid" })
    .eq("id", orderId);

  await appendStatusHistory(
    supabase,
    orderId,
    "pending_payment",
    note ?? "Payment slip rejected",
  );

  const { data: order } = await supabase
    .from("orders")
    .select("user_id, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (order?.user_id) {
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, order.user_id, "slip_rejected", {
      orderId,
      orderNumber: order.order_number,
    });
  }
}

export async function updateOrderStatus(
  supabase: SupabaseClient,
  orderId: string,
  status: OrderStatus,
  note?: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("user_id, order_number")
    .eq("id", orderId)
    .single();

  await supabase.from("orders").update({ status }).eq("id", orderId);
  await appendStatusHistory(supabase, orderId, status, note);

  if (order?.user_id) {
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, order.user_id, "order_status", {
      orderId,
      orderNumber: order.order_number,
      status,
    });
  }
}
