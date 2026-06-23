import { render } from "@react-email/render";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Resend } from "resend";

import { OrderPaidEmail } from "@/emails/order-paid";
import { OrderStatusEmail } from "@/emails/order-status";
import { QuotationSentEmail } from "@/emails/quotation-sent";
import { SlipRejectedEmail } from "@/emails/slip-rejected";
import { absoluteUrl } from "@/lib/public-url";
import type { NotificationEvent } from "@/services/notification.service";

const EMAIL_EVENTS = new Set<NotificationEvent>([
  "order_paid",
  "order_status",
  "slip_rejected",
  "quotation_sent",
]);

function integrationsEnabled(): boolean {
  return process.env.INTEGRATIONS_ENABLED !== "false";
}

function getEmailConfig(): { apiKey: string; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return null;
  return { apiKey, from };
}

async function lookupUserEmail(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[email] profile lookup failed", error.message);
    return null;
  }

  return data?.email ? String(data.email) : null;
}

function resolveHref(
  event: NotificationEvent,
  meta: Record<string, unknown>,
): string {
  const orderId = meta.orderId ? String(meta.orderId) : null;
  const quotationId = meta.quotationId ? String(meta.quotationId) : null;

  switch (event) {
    case "order_paid":
    case "order_status":
    case "slip_rejected":
      return orderId
        ? absoluteUrl(`/account/orders/${orderId}`)
        : absoluteUrl("/account/orders");
    case "quotation_sent":
      return quotationId
        ? absoluteUrl(`/account/quotations?id=${quotationId}`)
        : absoluteUrl("/account/quotations");
    default:
      return absoluteUrl("/account");
  }
}

function buildEmailContent(
  event: NotificationEvent,
  meta: Record<string, unknown>,
  subject: string,
  href: string,
): { subject: string; html: string } | null {
  const orderNumber = meta.orderNumber ? String(meta.orderNumber) : "—";
  const status = meta.status ? String(meta.status) : "อัปเดตแล้ว";
  const quotationNumber = meta.quotationNumber
    ? String(meta.quotationNumber)
    : "—";

  switch (event) {
    case "order_paid":
      return {
        subject,
        html: render(OrderPaidEmail({ orderNumber, href })),
      };
    case "order_status":
      return {
        subject,
        html: render(OrderStatusEmail({ orderNumber, status, href })),
      };
    case "slip_rejected":
      return {
        subject,
        html: render(SlipRejectedEmail({ orderNumber, href })),
      };
    case "quotation_sent":
      return {
        subject,
        html: render(QuotationSentEmail({ quotationNumber, href })),
      };
    default:
      return null;
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  if (!integrationsEnabled()) return;

  const config = getEmailConfig();
  if (!config) {
    console.warn("[email] RESEND_API_KEY or EMAIL_FROM not configured");
    return;
  }

  const resend = new Resend(config.apiKey);
  const { error } = await resend.emails.send({
    from: config.from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendNotificationEmail(
  supabase: SupabaseClient,
  userId: string,
  event: NotificationEvent,
  copy: { title: string; body: string; href?: string },
  meta: Record<string, unknown> = {},
): Promise<void> {
  if (!EMAIL_EVENTS.has(event)) return;

  const to = await lookupUserEmail(supabase, userId);
  if (!to) return;

  const href = copy.href ?? resolveHref(event, meta);
  const content = buildEmailContent(event, meta, copy.title, href);
  if (!content) return;

  await sendEmail(to, content.subject, content.html);
}
