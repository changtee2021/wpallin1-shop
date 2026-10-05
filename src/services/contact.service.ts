import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedbackCategory } from "@/lib/error-feedback";
import { pushLineStaffMessage } from "@/services/line-push.service";
import { createWebQuoteRequest } from "@/services/quotation.service";

export async function submitContactTicket(
  supabase: SupabaseClient,
  input: {
    userId: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  },
): Promise<string> {
  const fullSubject = `[${input.name}] ${input.subject}`;
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: input.userId,
      subject: fullSubject.slice(0, 200),
      status: "open",
      priority: input.subject.includes("[500]") ? "high" : "normal",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("admin_notes").insert({
    entity_type: "support_ticket",
    entity_id: ticket.id,
    author_id: input.userId,
    note: `Email: ${input.email}\nPhone: ${input.phone ?? "-"}\n\n${input.message}`,
    is_internal: false,
  });

  return ticket.id;
}

type BusinessInquiryInput = {
  userId?: string | null;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  sourceUrl?: string;
  companyName?: string;
  lineId?: string;
  inquiryType?: string;
  productInterest?: string;
};

function formatLineAlert(
  input: BusinessInquiryInput,
  reference: string,
): string {
  return [
    `[WP ALL เว็บ] ${input.subject}`,
    `อ้างอิง: ${reference}`,
    `ชื่อ: ${input.name}`,
    input.companyName ? `บริษัท: ${input.companyName}` : null,
    input.phone ? `โทร: ${input.phone}` : null,
    input.lineId ? `LINE: ${input.lineId}` : null,
    input.email ? `อีเมล: ${input.email}` : null,
    input.productInterest ? `สินค้า: ${input.productInterest}` : null,
    "",
    input.message,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Business enquiries from the brand site. Quote requests become draft quotations so
 * sales can work them in /admin/quotations; every enquiry also alerts the sales LINE.
 */
async function routeBusinessInquiry(
  supabase: SupabaseClient,
  input: BusinessInquiryInput,
  fallbackReference: string,
): Promise<string> {
  let reference = fallbackReference;

  if (input.inquiryType === "quote") {
    try {
      const quote = await createWebQuoteRequest(supabase, {
        userId: input.userId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        companyName: input.companyName,
        lineId: input.lineId,
        productInterest: input.productInterest,
        message: input.message,
        sourceUrl: input.sourceUrl,
      });
      if (quote) reference = quote.quotationNumber;
    } catch (err) {
      console.error("[contact] web quote insert failed", err);
    }
  }

  await pushLineStaffMessage(formatLineAlert(input, reference));
  return reference;
}

export async function submitFeedbackReport(
  supabase: SupabaseClient,
  input: {
    userId?: string | null;
    name: string;
    email?: string;
    phone?: string;
    subject: string;
    message: string;
    errorCode?: string;
    sourceUrl?: string;
    category?: FeedbackCategory;
    companyName?: string;
    jobTitle?: string;
    lineId?: string;
    taxId?: string;
    inquiryType?: string;
    visitDate?: string;
    visitSession?: string;
    visitorCount?: number;
    visitSites?: string[];
    purpose?: string;
    productInterest?: string;
  },
): Promise<{ ticketId?: string; referenceId: string }> {
  const contextLines = [
    input.category ? `Category: ${input.category}` : null,
    input.errorCode ? `Error code: ${input.errorCode}` : null,
    input.sourceUrl ? `URL: ${input.sourceUrl}` : null,
  ].filter(Boolean);

  const fullMessage = [...contextLines, "", input.message].join("\n");
  const isBusinessInquiry =
    (input.category ?? "contact") === "contact" && Boolean(input.inquiryType);

  if (input.userId) {
    const ticketId = await submitContactTicket(supabase, {
      userId: input.userId,
      name: input.name,
      email: input.email ?? "-",
      phone: input.phone,
      subject: input.subject,
      message: fullMessage,
    });
    const referenceId = isBusinessInquiry
      ? await routeBusinessInquiry(supabase, input, ticketId)
      : ticketId;
    return { ticketId, referenceId };
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action: "guest_feedback",
      entity_type: "feedback",
      changes: {
        name: input.name,
        email: input.email ?? null,
        phone: input.phone ?? null,
        subject: input.subject,
        message: fullMessage,
        errorCode: input.errorCode ?? null,
        sourceUrl: input.sourceUrl ?? null,
        category: input.category ?? "contact",
        companyName: input.companyName ?? null,
        jobTitle: input.jobTitle ?? null,
        lineId: input.lineId ?? null,
        taxId: input.taxId ?? null,
        inquiryType: input.inquiryType ?? null,
        visitDate: input.visitDate ?? null,
        visitSession: input.visitSession ?? null,
        visitorCount: input.visitorCount ?? null,
        visitSites: input.visitSites ?? null,
        purpose: input.purpose ?? null,
        productInterest: input.productInterest ?? null,
      },
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  const referenceId = isBusinessInquiry
    ? await routeBusinessInquiry(supabase, input, data.id)
    : data.id;
  return { referenceId };
}
