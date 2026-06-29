import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChatAiAccess } from "@/lib/chat-ai-eligibility";
import {
  getChatSettings,
  incrementDailyAiUsage,
} from "@/lib/chat-ai-eligibility";
import type { ChatMessageDto, ChatProductCard } from "@/services/chat.service";
import { smartSearchProducts } from "@/services/smart-search.service";

export type FaqItem = {
  id: string;
  keywords: string[];
  answerTh: string;
  answerEn?: string;
};

export type BotReply = {
  body: string;
  metadata?: Record<string, unknown>;
  usedLlm: boolean;
  suggestHandoff?: boolean;
};

const HANDOFF_KEYWORDS = [
  "คุยกับคน",
  "เจ้าหน้าที่",
  "พนักงาน",
  "โทรกลับ",
  "ติดต่อคน",
  "human",
  "staff",
  "agent",
];

const DEFAULT_FAQ: FaqItem[] = [
  {
    id: "shipping",
    keywords: ["จัดส่ง", "ส่งของ", "shipping"],
    answerTh: "จัดส่งทั่วประเทศ ระยะเวลา 3–7 วันทำการ ค่าส่งคิดตามน้ำหนัก/โซน",
  },
  {
    id: "payment",
    keywords: ["ชำระ", "โอน", "promptpay", "payment"],
    answerTh: "รับโอนธนาคาร และ PromptPay — อัปโหลดสลิปได้ที่หน้าออเดอร์",
  },
  {
    id: "dealer",
    keywords: ["ตัวแทน", "dealer", "สมัคร"],
    answerTh: "สมัครตัวแทนที่ /dealer/register",
  },
  {
    id: "configurator",
    keywords: ["ออกแบบ", "configurator", "วัด", "ขนาด"],
    answerTh: "ใช้เครื่องมือออกแบบม่านที่ /configurator",
  },
];

async function loadFaqItems(supabase: SupabaseClient): Promise<FaqItem[]> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "chat.faq_items")
    .maybeSingle();

  if (!data?.value || !Array.isArray(data.value)) return DEFAULT_FAQ;
  return data.value as FaqItem[];
}

function matchFaq(query: string, items: FaqItem[]): FaqItem | null {
  const q = query.toLowerCase();
  for (const item of items) {
    if (item.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return item;
    }
  }
  return null;
}

function wantsHandoff(query: string): boolean {
  const q = query.toLowerCase();
  return HANDOFF_KEYWORDS.some((kw) => q.includes(kw));
}

const CHAT_SYSTEM_PROMPT = `You are WP ALL assistant, a helpful Thai curtain and blind store chatbot.
Answer in Thai unless the user writes in English.
Be concise (2-4 sentences). Suggest relevant site paths when helpful.
If asked about dealer pricing, wholesale, or complex quotes, suggest talking to staff.
If you recommend products, mention you can show product cards.
Do not invent prices or stock — use search_products tool for product questions.`;

async function callChatLlm(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  userMessage: string,
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          ...messages.slice(-8),
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return json.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}

function toProductCards(
  products: Awaited<ReturnType<typeof smartSearchProducts>>["data"],
): ChatProductCard[] {
  return products.slice(0, 4).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl ?? null,
    price: p.retailPrice,
  }));
}

export async function generateBotReply(
  supabase: SupabaseClient,
  input: {
    userMessage: string;
    aiAccess: ChatAiAccess;
    userId?: string | null;
    locale?: string;
    history: ChatMessageDto[];
    context?: Record<string, unknown>;
  },
): Promise<BotReply> {
  if (wantsHandoff(input.userMessage)) {
    return {
      body: "ได้เลยค่ะ/ครับ กดปุ่ม «คุยเจ้าหน้าที่» ด้านล่าง หรือแจ้งชื่อกับเบอร์โทร ทีมจะติดต่อกลับเร็ว ๆ นี้",
      usedLlm: false,
      suggestHandoff: true,
    };
  }

  const faqItems = await loadFaqItems(supabase);
  const faqHit = matchFaq(input.userMessage, faqItems);

  if (!input.aiAccess.canUseLlm) {
    if (faqHit) {
      const answer =
        input.locale === "en" && faqHit.answerEn
          ? faqHit.answerEn
          : faqHit.answerTh;
      return {
        body: answer,
        metadata: { faqId: faqHit.id },
        usedLlm: false,
      };
    }

    const upsell =
      input.aiAccess.reason === "retail"
        ? `สะสมยอดซื้อ ${input.aiAccess.minSpendRequired.toLocaleString("th-TH")} บาท หรือสมัครเป็นตัวแทน เพื่อใช้ AI ช่วยแนะนำสินค้าได้\n\n`
        : input.aiAccess.reason === "quota"
          ? `คุณใช้โควต้า AI วันนี้ครบแล้ว (${input.aiAccess.dailyQuota} ข้อความ/วัน)\n\n`
          : "";

    return {
      body: `${upsell}ลองถามเรื่องจัดส่ง ชำระเงิน สมัครตัวแทน หรือกด «คุยเจ้าหน้าที่» เพื่อให้ทีมช่วยเหลือค่ะ/ครับ`,
      usedLlm: false,
      suggestHandoff: true,
    };
  }

  const historyForLlm = input.history
    .filter((m) => m.senderType === "visitor" || m.senderType === "bot")
    .map((m) => ({
      role: (m.senderType === "visitor" ? "user" : "assistant") as
        | "user"
        | "assistant",
      content: m.body,
    }));

  let productCards: ChatProductCard[] = [];
  const productIntent =
    /ม่าน|มู่ลี่|blind|curtain|zebra|ผ้า|ราง|สินค้า|แนะนำ|หา|อยากได้|product/i.test(
      input.userMessage,
    );

  if (productIntent) {
    try {
      const search = await smartSearchProducts(supabase, input.userMessage, {
        pageSize: 4,
      });
      productCards = toProductCards(search.data);
    } catch {
      // fallback to LLM only
    }
  }

  const llmReply = await callChatLlm(historyForLlm, input.userMessage);

  if (input.userId && llmReply) {
    await incrementDailyAiUsage(supabase, input.userId);
  }

  if (llmReply) {
    const metadata: Record<string, unknown> = { aiSource: "openai" };
    if (productCards.length) {
      metadata.kind = "product";
      metadata.productCards = productCards;
    }
    return {
      body: llmReply,
      metadata,
      usedLlm: true,
    };
  }

  if (faqHit) {
    return {
      body: faqHit.answerTh,
      metadata: { faqId: faqHit.id, aiSource: "fallback" },
      usedLlm: false,
    };
  }

  if (productCards.length) {
    return {
      body: "นี่คือสินค้าที่น่าจะตรงกับที่คุณต้องการค่ะ/ครับ",
      metadata: { kind: "product", productCards },
      usedLlm: false,
    };
  }

  return {
    body: "ขออภัยค่ะ/ครับ ยังไม่แน่ใจเรื่องนี้ — กด «คุยเจ้าหน้าที่» เพื่อให้ทีมช่วยต่อได้เลย",
    usedLlm: false,
    suggestHandoff: true,
  };
}

export async function getOrderStatusSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("orders")
    .select("order_number, status, payment_status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data?.length) return null;

  return data
    .map((o) => `${o.order_number}: ${o.status} (ชำระ: ${o.payment_status})`)
    .join("\n");
}

export { getChatSettings };
