import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChatAiAccess } from "@/lib/chat-ai-eligibility";
import type {
  ChatAttachment,
  ChatMessageKind,
  ChatProductCardPayload,
  ChatQuotationPayload,
} from "@/lib/chat.types";
import type { ProductPublicDto } from "@/types/api/products";

export type ChatConversationStatus = "bot" | "waiting" | "assigned" | "closed";
export type ChatConversationMode = "basic" | "premium" | "human";
export type ChatSenderType = "visitor" | "staff" | "bot" | "system";

/** @deprecated Use ChatProductCardPayload from chat.types */
export type ChatProductCard = ChatProductCardPayload;

export type ChatMessageDto = {
  id: string;
  conversationId: string;
  senderType: ChatSenderType;
  senderId: string | null;
  body: string;
  metadata: {
    kind?: ChatMessageKind;
    attachments?: ChatAttachment[];
    productCards?: ChatProductCardPayload[];
    quotation?: ChatQuotationPayload;
    [key: string]: unknown;
  };
  readAt: string | null;
  createdAt: string;
};

export type ChatConversationDto = {
  id: string;
  status: ChatConversationStatus;
  mode: ChatConversationMode;
  userId: string | null;
  guestSessionId: string | null;
  guestName: string | null;
  guestPhone: string | null;
  assignedTo: string | null;
  subject: string | null;
  context: Record<string, unknown>;
  linkedTicketId: string | null;
  aiMessageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChatSessionDto = {
  conversation: ChatConversationDto;
  messages: ChatMessageDto[];
  aiAccess: ChatAiAccess;
};

function mapConversation(row: Record<string, unknown>): ChatConversationDto {
  return {
    id: String(row.id),
    status: row.status as ChatConversationStatus,
    mode: row.mode as ChatConversationMode,
    userId: row.user_id ? String(row.user_id) : null,
    guestSessionId: row.guest_session_id ? String(row.guest_session_id) : null,
    guestName: row.guest_name ? String(row.guest_name) : null,
    guestPhone: row.guest_phone ? String(row.guest_phone) : null,
    assignedTo: row.assigned_to ? String(row.assigned_to) : null,
    subject: row.subject ? String(row.subject) : null,
    context: (row.context as Record<string, unknown>) ?? {},
    linkedTicketId: row.linked_ticket_id ? String(row.linked_ticket_id) : null,
    aiMessageCount: Number(row.ai_message_count ?? 0),
    lastMessageAt: row.last_message_at ? String(row.last_message_at) : null,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function mapMessage(row: Record<string, unknown>): ChatMessageDto {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    senderType: row.sender_type as ChatSenderType,
    senderId: row.sender_id ? String(row.sender_id) : null,
    body: String(row.body),
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    readAt: row.read_at ? String(row.read_at) : null,
    createdAt: String(row.created_at),
  };
}

export function mapProductToChatCard(
  product: ProductPublicDto,
): ChatProductCardPayload {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    imageUrl: product.imageUrl,
    price: product.retailPrice,
    compareAtPrice: product.compareAtPrice ?? null,
    productType: product.productType,
  };
}

export function buildMessageBodyFromMetadata(input: {
  body?: string;
  metadata?: Record<string, unknown>;
}): string {
  const trimmed = input.body?.trim();
  if (trimmed) return trimmed;

  const kind = input.metadata?.kind as ChatMessageKind | undefined;
  const attachments = input.metadata?.attachments as
    | ChatAttachment[]
    | undefined;
  if (
    kind === "image" ||
    attachments?.some((a) => a.mime.startsWith("image/"))
  ) {
    return "[รูปภาพ]";
  }
  if (kind === "file" || attachments?.length) {
    return "[ไฟล์แนบ]";
  }
  if (input.metadata?.productCards) {
    return "[สินค้าแนะนำ]";
  }
  if (input.metadata?.quotation) {
    return "[ใบเสนอราคา]";
  }
  return " ";
}

export async function getConversationById(
  supabase: SupabaseClient,
  conversationId: string,
): Promise<ChatConversationDto | null> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", conversationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapConversation(data) : null;
}

export async function findOpenConversation(
  supabase: SupabaseClient,
  input: { userId?: string | null; guestSessionId?: string | null },
): Promise<ChatConversationDto | null> {
  let query = supabase
    .from("chat_conversations")
    .select("*")
    .neq("status", "closed")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (input.userId) {
    query = query.eq("user_id", input.userId);
  } else if (input.guestSessionId) {
    query = query.eq("guest_session_id", input.guestSessionId);
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapConversation(data) : null;
}

export async function createConversation(
  supabase: SupabaseClient,
  input: {
    userId?: string | null;
    guestSessionId?: string | null;
    mode: ChatConversationMode;
    context?: Record<string, unknown>;
  },
): Promise<ChatConversationDto> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .insert({
      user_id: input.userId ?? null,
      guest_session_id: input.guestSessionId ?? null,
      mode: input.mode,
      status: "bot",
      context: input.context ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapConversation(data);
}

export async function listConversationMessages(
  supabase: SupabaseClient,
  conversationId: string,
  limit = 100,
): Promise<ChatMessageDto[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapMessage);
}

export async function insertChatMessage(
  supabase: SupabaseClient,
  input: {
    conversationId: string;
    senderType: ChatSenderType;
    senderId?: string | null;
    body?: string;
    metadata?: Record<string, unknown>;
  },
): Promise<ChatMessageDto> {
  const now = new Date().toISOString();
  const body = buildMessageBodyFromMetadata({
    body: input.body,
    metadata: input.metadata,
  });
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      conversation_id: input.conversationId,
      sender_type: input.senderType,
      sender_id: input.senderId ?? null,
      body,
      metadata: input.metadata ?? {},
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  const updates: Record<string, unknown> = {
    last_message_at: now,
    updated_at: now,
  };
  if (input.senderType === "bot") {
    const conv = await getConversationById(supabase, input.conversationId);
    updates.ai_message_count = (conv?.aiMessageCount ?? 0) + 1;
  }

  await supabase
    .from("chat_conversations")
    .update(updates)
    .eq("id", input.conversationId);

  return mapMessage(data);
}

export async function updateConversation(
  supabase: SupabaseClient,
  conversationId: string,
  patch: Partial<{
    status: ChatConversationStatus;
    mode: ChatConversationMode;
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    assignedTo: string | null;
    linkedTicketId: string;
    subject: string;
  }>,
): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status) row.status = patch.status;
  if (patch.mode) row.mode = patch.mode;
  if (patch.guestName) row.guest_name = patch.guestName;
  if (patch.guestPhone) row.guest_phone = patch.guestPhone;
  if (patch.guestEmail) row.guest_email = patch.guestEmail;
  if (patch.assignedTo !== undefined) row.assigned_to = patch.assignedTo;
  if (patch.linkedTicketId) row.linked_ticket_id = patch.linkedTicketId;
  if (patch.subject) row.subject = patch.subject;
  if (patch.status === "closed") row.closed_at = new Date().toISOString();

  const { error } = await supabase
    .from("chat_conversations")
    .update(row)
    .eq("id", conversationId);

  if (error) throw new Error(error.message);
}

export async function listAdminChatConversations(
  supabase: SupabaseClient,
  filter: { status?: ChatConversationStatus | "all"; assignedTo?: string },
): Promise<ChatConversationDto[]> {
  let query = supabase
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (filter.status && filter.status !== "all") {
    query = query.eq("status", filter.status);
  }
  if (filter.assignedTo) {
    query = query.eq("assigned_to", filter.assignedTo);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapConversation);
}

export function buildTranscript(messages: ChatMessageDto[]): string {
  return messages
    .map((m) => {
      const who =
        m.senderType === "visitor"
          ? "ลูกค้า"
          : m.senderType === "staff"
            ? "เจ้าหน้าที่"
            : m.senderType === "bot"
              ? "บอท"
              : "ระบบ";
      return `[${who}] ${m.body}`;
    })
    .join("\n");
}

export async function assertConversationAccess(
  supabase: SupabaseClient,
  conversation: ChatConversationDto,
  input: { userId?: string | null; guestSessionId?: string | null },
): Promise<void> {
  if (input.userId && conversation.userId === input.userId) return;
  if (
    input.guestSessionId &&
    conversation.guestSessionId === input.guestSessionId
  )
    return;
  throw new Error("Forbidden: conversation access denied");
}
