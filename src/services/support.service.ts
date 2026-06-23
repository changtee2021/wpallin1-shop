import type { SupabaseClient } from "@supabase/supabase-js";

export type SupportTicketDto = {
  id: string;
  userId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  preview?: string;
};

export type SupportTicketDetailDto = SupportTicketDto & {
  notes: Array<{
    id: string;
    note: string;
    authorId: string | null;
    isInternal: boolean;
    createdAt: string;
  }>;
};

export type GuestFeedbackDto = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  category: string | null;
  errorCode: string | null;
  sourceUrl: string | null;
  createdAt: string;
};

function mapTicket(row: Record<string, unknown>): SupportTicketDto {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    subject: String(row.subject),
    status: String(row.status),
    priority: String(row.priority),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listAdminSupportTickets(
  supabase: SupabaseClient,
  filter?: { status?: string },
): Promise<SupportTicketDto[]> {
  let query = supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, priority, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter?.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const tickets = (data ?? []).map(mapTicket);
  if (tickets.length === 0) return tickets;

  const ids = tickets.map((t) => t.id);
  const { data: notes, error: notesError } = await supabase
    .from("admin_notes")
    .select("entity_id, note, created_at")
    .eq("entity_type", "support_ticket")
    .in("entity_id", ids)
    .order("created_at", { ascending: true });

  if (notesError) throw new Error(notesError.message);

  const previewByTicket = new Map<string, string>();
  for (const note of notes ?? []) {
    previewByTicket.set(String(note.entity_id), String(note.note));
  }

  return tickets.map((ticket) => ({
    ...ticket,
    preview: previewByTicket.get(ticket.id)?.slice(0, 160),
  }));
}

export async function getAdminSupportTicket(
  supabase: SupabaseClient,
  ticketId: string,
): Promise<SupportTicketDetailDto> {
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .select("id, user_id, subject, status, priority, created_at, updated_at")
    .eq("id", ticketId)
    .single();

  if (error) throw new Error(error.message);

  const { data: notes, error: notesError } = await supabase
    .from("admin_notes")
    .select("id, note, author_id, is_internal, created_at")
    .eq("entity_type", "support_ticket")
    .eq("entity_id", ticketId)
    .order("created_at", { ascending: true });

  if (notesError) throw new Error(notesError.message);

  return {
    ...mapTicket(ticket),
    notes: (notes ?? []).map((note) => ({
      id: String(note.id),
      note: String(note.note),
      authorId: note.author_id ? String(note.author_id) : null,
      isInternal: Boolean(note.is_internal),
      createdAt: String(note.created_at),
    })),
  };
}

export async function updateSupportTicketStatus(
  supabase: SupabaseClient,
  input: {
    ticketId: string;
    status: "open" | "in_progress" | "resolved" | "closed";
    adminUserId: string;
    note?: string;
  },
): Promise<void> {
  const { error } = await supabase
    .from("support_tickets")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.ticketId);

  if (error) throw new Error(error.message);

  if (input.note?.trim()) {
    const { error: noteError } = await supabase.from("admin_notes").insert({
      entity_type: "support_ticket",
      entity_id: input.ticketId,
      author_id: input.adminUserId,
      note: input.note.trim(),
      is_internal: true,
    });
    if (noteError) throw new Error(noteError.message);
  }
}

export async function listGuestFeedback(
  supabase: SupabaseClient,
): Promise<GuestFeedbackDto[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, changes, created_at")
    .eq("action", "guest_feedback")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const changes = (row.changes ?? {}) as Record<string, unknown>;
    return {
      id: String(row.id),
      name: String(changes.name ?? ""),
      email: String(changes.email ?? ""),
      phone: changes.phone ? String(changes.phone) : null,
      subject: String(changes.subject ?? ""),
      message: String(changes.message ?? ""),
      category: changes.category ? String(changes.category) : null,
      errorCode: changes.errorCode ? String(changes.errorCode) : null,
      sourceUrl: changes.sourceUrl ? String(changes.sourceUrl) : null,
      createdAt: String(row.created_at),
    };
  });
}
