import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { optionalSupabaseAuth, requireStaff } from "@/lib/server-auth";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  resolveChatAiAccess,
  isWithinBusinessHours,
  getChatSettings,
} from "@/lib/chat-ai-eligibility";
import { enforceRateLimit } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { generateBotReply } from "@/services/chat-bot.service";
import {
  submitContactTicket,
  submitFeedbackReport,
} from "@/services/contact.service";
import {
  assertConversationAccess,
  buildTranscript,
  createConversation,
  findOpenConversation,
  getConversationById,
  insertChatMessage,
  listAdminChatConversations,
  listConversationMessages,
  mapProductToChatCard,
  updateConversation,
  type ChatSessionDto,
} from "@/services/chat.service";
import { listPublicProducts } from "@/services/catalog.service";
import {
  getQuotationDetail,
  listUserQuotations,
  updateQuotationStatus,
} from "@/services/quotation.service";
import { notifyStaff } from "@/services/notification.service";
import type { ChatProductCardPayload } from "@/lib/chat.types";

const attachmentSchema = z.object({
  url: z.string().url(),
  thumbUrl: z.string().url().nullable().optional(),
  mime: z.string(),
  fileName: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
});

const richMetadataSchema = z
  .object({
    kind: z.enum(["text", "image", "file", "product", "quotation"]).optional(),
    attachments: z.array(attachmentSchema).optional(),
    productCards: z
      .array(
        z.object({
          id: z.string().uuid(),
          name: z.string(),
          slug: z.string(),
          imageUrl: z.string().nullable(),
          price: z.number(),
          compareAtPrice: z.number().nullable().optional(),
          productType: z.enum(["standard", "custom"]).optional(),
        }),
      )
      .optional(),
    quotation: z
      .object({
        quotationId: z.string().uuid(),
        quotationNumber: z.string(),
        grandTotal: z.number(),
        validUntil: z.string().nullable(),
        status: z.string(),
        publicToken: z.string().nullable().optional(),
      })
      .optional(),
  })
  .passthrough();

const guestSessionSchema = z.string().uuid();
const contextSchema = z.record(z.string(), z.unknown()).optional();

const chatCtxSchema = z.object({
  guestSessionId: guestSessionSchema.optional(),
  conversationId: z.string().uuid().optional(),
  context: contextSchema,
  locale: z.enum(["th", "en"]).optional(),
});

async function loadOrCreateSession(
  supabase: Awaited<ReturnType<typeof getAdminClient>>,
  input: {
    userId: string | null;
    guestSessionId?: string;
    context?: Record<string, unknown>;
  },
): Promise<ChatSessionDto> {
  const aiAccess = await resolveChatAiAccess(supabase, input.userId);

  let conversation = await findOpenConversation(supabase, {
    userId: input.userId,
    guestSessionId: input.guestSessionId,
  });

  if (!conversation) {
    conversation = await createConversation(supabase, {
      userId: input.userId,
      guestSessionId: input.guestSessionId,
      mode: aiAccess.mode,
      context: input.context ?? {},
    });

    const greeting =
      aiAccess.mode === "premium"
        ? "สวัสดีค่ะ/ครับ ผมเป็นผู้ช่วย AI ของ WP ALL — ช่วยหาสินค้า ตอบคำถาม หรือส่งต่อเจ้าหน้าที่ได้เลย"
        : "สวัสดีค่ะ/ครับ ยินดีช่วยเหลือ — ถามเรื่องจัดส่ง ชำระเงิน สมัครตัวแทน หรือกด «คุยเจ้าหน้าที่» ได้เลย";

    await insertChatMessage(supabase, {
      conversationId: conversation.id,
      senderType: "bot",
      body: greeting,
      metadata: { kind: "greeting", mode: aiAccess.mode },
    });
  } else if (input.context && Object.keys(input.context).length) {
    await supabase
      .from("chat_conversations")
      .update({
        context: { ...conversation.context, ...input.context },
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversation.id);
    conversation = {
      ...conversation,
      context: { ...conversation.context, ...input.context },
    };
  }

  const messages = await listConversationMessages(supabase, conversation.id);
  return { conversation, messages, aiAccess };
}

export const fetchChatSession = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => chatCtxSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    if (!context.userId && !data.guestSessionId) {
      throw new Error("guestSessionId required for anonymous chat");
    }

    const supabase = await getAdminClient();
    return loadOrCreateSession(supabase, {
      userId: context.userId,
      guestSessionId: data.guestSessionId,
      context: data.context,
    });
  });

export const fetchChatAiAccess = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return resolveChatAiAccess(supabase, context.userId);
  });

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    chatCtxSchema
      .extend({
        body: z.string().max(2000).optional(),
        metadata: richMetadataSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!context.userId && !data.guestSessionId) {
      throw new Error("guestSessionId required");
    }

    const hasText = Boolean(data.body?.trim());
    const hasRich =
      Boolean(data.metadata?.attachments?.length) ||
      Boolean(data.metadata?.productCards?.length) ||
      Boolean(data.metadata?.quotation);
    if (!hasText && !hasRich) {
      throw new Error("Message cannot be empty");
    }

    const rateKey = context.userId ?? data.guestSessionId ?? "anon";
    await enforceRateLimit("chat-message", rateKey, {
      requests: 30,
      window: "1 m",
    });

    const supabase = await getAdminClient();
    const session = await loadOrCreateSession(supabase, {
      userId: context.userId,
      guestSessionId: data.guestSessionId,
      context: data.context,
    });

    const { conversation, aiAccess } = session;

    if (conversation.status === "closed") {
      throw new Error("Conversation is closed");
    }

    await assertConversationAccess(supabase, conversation, {
      userId: context.userId,
      guestSessionId: data.guestSessionId,
    });

    const metadata = {
      ...(data.metadata ?? {}),
      kind:
        data.metadata?.kind ??
        (data.metadata?.attachments?.length
          ? data.metadata.attachments[0]?.mime.startsWith("image/")
            ? "image"
            : "file"
          : "text"),
    };

    const visitorMsg = await insertChatMessage(supabase, {
      conversationId: conversation.id,
      senderType: "visitor",
      senderId: context.userId,
      body: data.body,
      metadata,
    });

    if (
      conversation.status === "assigned" ||
      conversation.status === "waiting"
    ) {
      const messages = await listConversationMessages(
        supabase,
        conversation.id,
      );
      return {
        conversation,
        messages,
        aiAccess,
        visitorMessage: visitorMsg,
      };
    }

    if (conversation.mode === "human") {
      const messages = await listConversationMessages(
        supabase,
        conversation.id,
      );
      return { conversation, messages, aiAccess, visitorMessage: visitorMsg };
    }

    if (metadata.kind === "image" || metadata.kind === "file") {
      await insertChatMessage(supabase, {
        conversationId: conversation.id,
        senderType: "bot",
        body: "ได้รับไฟล์แล้วค่ะ/ครับ — หากต้องการให้เจ้าหน้าที่ช่วยดูรายละเอียด กด «คุยเจ้าหน้าที่» ได้เลย",
        metadata: { kind: "text" },
      });
      const messages = await listConversationMessages(
        supabase,
        conversation.id,
      );
      return {
        conversation,
        messages,
        aiAccess,
        visitorMessage: visitorMsg,
        suggestHandoff: true,
      };
    }

    if (!hasText) {
      const messages = await listConversationMessages(
        supabase,
        conversation.id,
      );
      return { conversation, messages, aiAccess, visitorMessage: visitorMsg };
    }

    const history = await listConversationMessages(supabase, conversation.id);
    const botReply = await generateBotReply(supabase, {
      userMessage: data.body!,
      aiAccess,
      userId: context.userId,
      locale: data.locale,
      history,
      context: conversation.context,
    });

    await insertChatMessage(supabase, {
      conversationId: conversation.id,
      senderType: "bot",
      body: botReply.body,
      metadata: botReply.metadata,
    });

    const messages = await listConversationMessages(supabase, conversation.id);
    return {
      conversation,
      messages,
      aiAccess,
      visitorMessage: visitorMsg,
      suggestHandoff: botReply.suggestHandoff,
    };
  });

export const requestChatHandoff = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    chatCtxSchema
      .extend({
        conversationId: z.string().uuid(),
        guestName: z.string().min(1).optional(),
        guestPhone: z.string().min(1).optional(),
        guestEmail: z.string().email().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const conversation = await getConversationById(
      supabase,
      data.conversationId,
    );
    if (!conversation) throw new Error("Conversation not found");

    await assertConversationAccess(supabase, conversation, {
      userId: context.userId,
      guestSessionId: data.guestSessionId,
    });

    if (!context.userId && (!data.guestName || !data.guestPhone)) {
      throw new Error("กรุณาระบุชื่อและเบอร์โทร");
    }

    const messages = await listConversationMessages(supabase, conversation.id);
    const transcript = buildTranscript(messages);
    const subject = `[แชทเว็บ] ${data.guestName ?? "ลูกค้า"} — ขอคุยเจ้าหน้าที่`;

    let linkedTicketId: string | undefined;
    let referenceId: string;

    if (context.userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name, phone")
        .eq("id", context.userId)
        .maybeSingle();

      linkedTicketId = await submitContactTicket(supabase, {
        userId: context.userId,
        name: profile?.full_name ?? data.guestName ?? "ลูกค้า",
        email: profile?.email ?? data.guestEmail ?? "noreply@wpall.local",
        phone: profile?.phone ?? data.guestPhone,
        subject,
        message: transcript,
      });
      referenceId = linkedTicketId;
    } else {
      const result = await submitFeedbackReport(supabase, {
        userId: null,
        name: data.guestName!,
        email: data.guestEmail ?? "guest@wpall.local",
        phone: data.guestPhone,
        subject,
        message: transcript,
        category: "contact",
        sourceUrl:
          typeof conversation.context.page_url === "string"
            ? conversation.context.page_url
            : undefined,
      });
      referenceId = result.referenceId;
      linkedTicketId = result.ticketId;
    }

    await updateConversation(supabase, conversation.id, {
      status: "waiting",
      mode: "human",
      guestName: data.guestName,
      guestPhone: data.guestPhone,
      guestEmail: data.guestEmail,
      linkedTicketId,
      subject,
    });

    await insertChatMessage(supabase, {
      conversationId: conversation.id,
      senderType: "system",
      body: `ส่งคำขอคุยเจ้าหน้าที่แล้ว (อ้างอิง ${referenceId.slice(0, 8)}) — ทีมจะตอบกลับเร็ว ๆ นี้`,
      metadata: { referenceId, linkedTicketId },
    });

    const settings = await getChatSettings(supabase);
    if (isWithinBusinessHours(settings)) {
      await notifyStaff(supabase, "chat_handoff_pending", {
        conversationId: conversation.id,
        guestName: data.guestName ?? "ลูกค้า",
        href: `/admin/chat?conversation=${conversation.id}`,
      });
    }

    const updated = await getConversationById(supabase, conversation.id);
    const updatedMessages = await listConversationMessages(
      supabase,
      conversation.id,
    );

    return {
      conversation: updated!,
      messages: updatedMessages,
      referenceId,
    };
  });

export const fetchAdminChatConversations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z
          .enum(["all", "bot", "waiting", "assigned", "closed"])
          .optional(),
        mine: z.boolean().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    return listAdminChatConversations(supabase, {
      status: data.status,
      assignedTo: data.mine ? context.userId : undefined,
    });
  });

export const fetchAdminChatDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ conversationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    const conversation = await getConversationById(
      supabase,
      data.conversationId,
    );
    if (!conversation) throw new Error("Conversation not found");
    const messages = await listConversationMessages(
      supabase,
      data.conversationId,
    );
    return { conversation, messages };
  });

export const assignAdminChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ conversationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();

    await updateConversation(supabase, data.conversationId, {
      status: "assigned",
      assignedTo: context.userId,
    });

    await insertChatMessage(supabase, {
      conversationId: data.conversationId,
      senderType: "system",
      body: "เจ้าหน้าที่เข้าร่วมแชทแล้ว",
    });

    return { ok: true };
  });

export const sendStaffChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        conversationId: z.string().uuid(),
        body: z.string().max(4000).optional(),
        metadata: richMetadataSchema.optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();

    const conversation = await getConversationById(
      supabase,
      data.conversationId,
    );
    if (!conversation) throw new Error("Conversation not found");

    const hasText = Boolean(data.body?.trim());
    const hasRich =
      Boolean(data.metadata?.attachments?.length) ||
      Boolean(data.metadata?.productCards?.length) ||
      Boolean(data.metadata?.quotation);
    if (!hasText && !hasRich) {
      throw new Error("Message cannot be empty");
    }

    const metadata = {
      ...(data.metadata ?? {}),
      kind:
        data.metadata?.kind ??
        (data.metadata?.productCards?.length
          ? "product"
          : data.metadata?.quotation
            ? "quotation"
            : data.metadata?.attachments?.length
              ? data.metadata.attachments[0]?.mime.startsWith("image/")
                ? "image"
                : "file"
              : "text"),
    };

    const message = await insertChatMessage(supabase, {
      conversationId: data.conversationId,
      senderType: "staff",
      senderId: context.userId,
      body: data.body,
      metadata,
    });

    if (conversation.status === "waiting") {
      await updateConversation(supabase, data.conversationId, {
        status: "assigned",
        assignedTo: context.userId,
      });
    }

    if (conversation.userId) {
      const { notifyUserEvent } =
        await import("@/services/notification.service");
      await notifyUserEvent(supabase, conversation.userId, "chat_staff_reply", {
        conversationId: data.conversationId,
        href: `/?chat=${data.conversationId}`,
      });
    }

    return message;
  });

export const closeAdminChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ conversationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();

    await updateConversation(supabase, data.conversationId, {
      status: "closed",
    });

    await insertChatMessage(supabase, {
      conversationId: data.conversationId,
      senderType: "system",
      body: "ปิดการสนทนาแล้ว — ขอบคุณที่ติดต่อ WP ALL",
    });

    return { ok: true };
  });

export const searchChatProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ q: z.string().max(100).default("") }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    const result = await listPublicProducts(supabase, {
      search: data.q.trim() || undefined,
      pageSize: 10,
      sortBy: "name",
      sortDir: "asc",
    });
    return result.data.map(mapProductToChatCard);
  });

export const fetchChatUserQuotations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    const quotes = await listUserQuotations(supabase, data.userId);
    return quotes.filter((q) => q.status === "draft" || q.status === "sent");
  });

export const sendStaffChatProducts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        conversationId: z.string().uuid(),
        productIds: z.array(z.string().uuid()).min(1).max(8),
        body: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();

    const { data: rows, error } = await supabase
      .from("products_public")
      .select(
        "id, slug, name, image_url, retail_price, compare_at_price, product_type",
      )
      .in("id", data.productIds);

    if (error) throw new Error(error.message);

    const cards: ChatProductCardPayload[] = (rows ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.name),
      slug: String(row.slug),
      imageUrl: row.image_url ? String(row.image_url) : null,
      price: Number(row.retail_price),
      compareAtPrice: row.compare_at_price
        ? Number(row.compare_at_price)
        : null,
      productType: row.product_type as "standard" | "custom",
    }));

    if (!cards.length) throw new Error("ไม่พบสินค้า");

    const message = await insertChatMessage(supabase, {
      conversationId: data.conversationId,
      senderType: "staff",
      senderId: context.userId,
      body: data.body ?? "แนะนำสินค้าให้ดูค่ะ/ครับ",
      metadata: { kind: "product", productCards: cards },
    });

    const conversation = await getConversationById(
      supabase,
      data.conversationId,
    );
    if (conversation?.userId) {
      const { notifyUserEvent } =
        await import("@/services/notification.service");
      await notifyUserEvent(supabase, conversation.userId, "chat_staff_reply", {
        conversationId: data.conversationId,
        href: `/?chat=${data.conversationId}`,
      });
    }

    return message;
  });

export const sendStaffChatQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        conversationId: z.string().uuid(),
        quotationId: z.string().uuid(),
        body: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();

    const conversation = await getConversationById(
      supabase,
      data.conversationId,
    );
    if (!conversation) throw new Error("Conversation not found");

    const quote = await getQuotationDetail(supabase, data.quotationId);
    if (!quote) throw new Error("ไม่พบใบเสนอราคา");
    if (conversation.userId && quote.userId !== conversation.userId) {
      throw new Error("ใบเสนอราคาไม่ตรงกับลูกค้าในแชท");
    }

    const { publicToken } = await updateQuotationStatus(
      supabase,
      data.quotationId,
      "sent",
      "ส่งผ่านแชท",
    );

    const message = await insertChatMessage(supabase, {
      conversationId: data.conversationId,
      senderType: "staff",
      senderId: context.userId,
      body:
        data.body ?? `ส่งใบเสนอราคา ${quote.quotationNumber} ให้แล้วค่ะ/ครับ`,
      metadata: {
        kind: "quotation",
        quotation: {
          quotationId: quote.id,
          quotationNumber: quote.quotationNumber,
          grandTotal: quote.grandTotal,
          validUntil: quote.validUntil,
          status: "sent",
          publicToken: publicToken ?? quote.metadata?.publicToken ?? null,
        },
      },
    });

    if (conversation.userId) {
      const { notifyUserEvent } =
        await import("@/services/notification.service");
      await notifyUserEvent(supabase, conversation.userId, "chat_staff_reply", {
        conversationId: data.conversationId,
        href: `/?chat=${data.conversationId}`,
      });
    }

    return message;
  });

export const fetchChatSettingsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { requireAdmin } = await import("@/lib/server-auth");
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getChatSettings(supabase);
  });

export const saveChatSettingsAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        aiEnabled: z.boolean(),
        minLifetimeSpend: z.number().min(0),
        dailyQuota: z.number().int().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { requireAdmin } = await import("@/lib/server-auth");
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const now = new Date().toISOString();

    await Promise.all([
      supabase
        .from("settings")
        .update({ value: data.aiEnabled, updated_at: now })
        .eq("key", "chat.ai_enabled"),
      supabase
        .from("settings")
        .update({ value: data.minLifetimeSpend, updated_at: now })
        .eq("key", "chat.ai_min_lifetime_spend"),
      supabase
        .from("settings")
        .update({ value: data.dailyQuota, updated_at: now })
        .eq("key", "chat.ai_daily_quota"),
    ]);

    return { ok: true };
  });
