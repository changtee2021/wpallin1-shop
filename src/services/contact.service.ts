import type { SupabaseClient } from "@supabase/supabase-js";

import type { FeedbackCategory } from "@/lib/error-feedback";

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

export async function submitFeedbackReport(
  supabase: SupabaseClient,
  input: {
    userId?: string | null;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    errorCode?: string;
    sourceUrl?: string;
    category?: FeedbackCategory;
  },
): Promise<{ ticketId?: string; referenceId: string }> {
  const contextLines = [
    input.category ? `Category: ${input.category}` : null,
    input.errorCode ? `Error code: ${input.errorCode}` : null,
    input.sourceUrl ? `URL: ${input.sourceUrl}` : null,
  ].filter(Boolean);

  const fullMessage = [...contextLines, "", input.message].join("\n");

  if (input.userId) {
    const ticketId = await submitContactTicket(supabase, {
      userId: input.userId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      subject: input.subject,
      message: fullMessage,
    });
    return { ticketId, referenceId: ticketId };
  }

  const { data, error } = await supabase
    .from("audit_logs")
    .insert({
      action: "guest_feedback",
      entity_type: "feedback",
      changes: {
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        subject: input.subject,
        message: fullMessage,
        errorCode: input.errorCode ?? null,
        sourceUrl: input.sourceUrl ?? null,
        category: input.category ?? "contact",
      },
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { referenceId: data.id };
}
