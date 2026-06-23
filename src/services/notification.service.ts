import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationDto = {
  id: string;
  title: string;
  body: string | null;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationEvent =
  | "order_paid"
  | "order_status"
  | "slip_rejected"
  | "wallet_topup_approved"
  | "wallet_topup_rejected"
  | "dealer_approved"
  | "dealer_rejected"
  | "tier_upgraded"
  | "quotation_sent"
  | "quotation_accepted"
  | "quotation_rejected"
  | "assisted_order_created"
  | "quote_request"
  | "topup_pending"
  | "dealer_app_pending";

const EVENT_COPY: Record<
  NotificationEvent,
  (meta: Record<string, unknown>) => {
    title: string;
    body: string;
    href?: string;
  }
> = {
  order_paid: (m) => ({
    title: "ชำระเงินสำเร็จ",
    body: `ออเดอร์ ${m.orderNumber ?? ""} ชำระเงินแล้ว`,
    href: m.orderId ? `/account/orders/${m.orderId}` : "/account/orders",
  }),
  order_status: (m) => ({
    title: "สถานะออเดอร์อัปเดต",
    body: `ออเดอร์ ${m.orderNumber ?? ""} — ${m.status ?? ""}`,
    href: m.orderId ? `/account/orders/${m.orderId}` : "/account/orders",
  }),
  slip_rejected: (m) => ({
    title: "สลิปไม่ผ่าน",
    body: `กรุณาอัปโหลดสลิปใหม่สำหรับออเดอร์ ${m.orderNumber ?? ""}`,
    href: m.orderId ? `/account/orders/${m.orderId}` : "/account/orders",
  }),
  wallet_topup_approved: () => ({
    title: "เติมเงินสำเร็จ",
    body: "ยอดเงินเข้ากระเป๋าแล้ว",
    href: "/account?tab=wallet",
  }),
  wallet_topup_rejected: () => ({
    title: "เติมเงินไม่ผ่าน",
    body: "กรุณาตรวจสอบสลิปและส่งใหม่",
    href: "/account?tab=wallet",
  }),
  dealer_approved: () => ({
    title: "อนุมัติตัวแทนแล้ว",
    body: "เข้าใช้งานพอร์ทัลตัวแทนได้",
    href: "/dealer",
  }),
  dealer_rejected: () => ({
    title: "ใบสมัครตัวแทนไม่ผ่าน",
    body: "ติดต่อฝ่ายขายสำหรับรายละเอียด",
  }),
  tier_upgraded: (m) => ({
    title: "เลื่อนระดับสมาชิก",
    body: `ยินดีด้วย! คุณเป็น ${m.tierName ?? m.tier ?? "สมาชิก"} แล้ว`,
    href: "/account",
  }),
  quotation_sent: (m) => ({
    title: "ใบเสนอราคาใหม่",
    body: `ใบเสนอ ${m.quotationNumber ?? ""} รอการตอบรับ`,
    href: m.quotationId
      ? `/account/quotations?id=${m.quotationId}`
      : "/account/quotations",
  }),
  quotation_accepted: (m) => ({
    title: "ลูกค้ายอมรับใบเสนอ",
    body: `ใบเสนอ ${m.quotationNumber ?? ""}`,
    href: m.quotationId
      ? `/admin/quotations/${m.quotationId}`
      : "/admin/quotations",
  }),
  quotation_rejected: (m) => ({
    title: "ลูกค้าปฏิเสธใบเสนอ",
    body: `ใบเสนอ ${m.quotationNumber ?? ""}`,
    href: m.quotationId
      ? `/admin/quotations/${m.quotationId}`
      : "/admin/quotations",
  }),
  assisted_order_created: (m) => ({
    title: "มีออเดอร์ใหม่",
    body: `ทีมขายสร้างออเดอร์ ${m.orderNumber ?? ""} ให้คุณ`,
    href: m.orderId ? `/account/orders/${m.orderId}` : "/account/orders",
  }),
  quote_request: (m) => ({
    title: "คำขอใบเสนอราคา",
    body: `ลูกค้า ${m.customerEmail ?? ""} ขอใบเสนอ`,
    href: m.quotationId
      ? `/admin/quotations/${m.quotationId}`
      : "/admin/quotations",
  }),
  topup_pending: () => ({
    title: "คำขอเติมเงิน",
    body: "มีคำขอเติมเงินรอตรวจ",
    href: "/admin/wallet",
  }),
  dealer_app_pending: () => ({
    title: "ใบสมัครตัวแทน",
    body: "มีใบสมัครรออนุมัติ",
    href: "/admin/dealers",
  }),
};

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  input: { title: string; body?: string; payload?: Record<string, unknown> },
): Promise<void> {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    title: input.title,
    body: input.body ?? null,
    channel: "in_app",
    payload: input.payload ?? {},
  });
  if (error) throw new Error(error.message);
}

export async function notifyUserEvent(
  supabase: SupabaseClient,
  userId: string,
  event: NotificationEvent,
  meta: Record<string, unknown> = {},
): Promise<void> {
  const copy = EVENT_COPY[event](meta);
  await createNotification(supabase, userId, {
    title: copy.title,
    body: copy.body,
    payload: { event, href: copy.href, ...meta },
  });

  try {
    const { sendNotificationEmail } = await import("@/services/email.service");
    await sendNotificationEmail(supabase, userId, event, copy, meta);
  } catch (err) {
    console.error("[email] notifyUserEvent failed", err);
  }
}

export async function notifyStaff(
  supabase: SupabaseClient,
  event: NotificationEvent,
  meta: Record<string, unknown> = {},
): Promise<void> {
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .in("role", ["super_admin", "admin", "sales_staff"]);

  const userIds = [...new Set((roles ?? []).map((r) => r.user_id))];
  await Promise.all(
    userIds.map((uid) => notifyUserEvent(supabase, uid, event, meta)),
  );
}

export async function listUserNotifications(
  supabase: SupabaseClient,
  userId: string,
  limit = 30,
): Promise<NotificationDto[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, payload, read_at, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    payload: (row.payload as Record<string, unknown>) ?? {},
    readAt: row.read_at,
    createdAt: row.created_at,
  }));
}

export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function markNotificationRead(
  supabase: SupabaseClient,
  userId: string,
  notificationId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
}

export async function markAllNotificationsRead(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw new Error(error.message);
}
