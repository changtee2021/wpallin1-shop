import { z } from "zod";

import type {
  RoomAnalysisDto,
  StyleRecommendationDto,
} from "@/types/api/room-advisor";
import type { ConfiguratorCatalog } from "@/domain/configurator";

const analysisSchema = z.object({
  roomType: z.string(),
  lightLevel: z.string(),
  interiorStyle: z.array(z.string()),
  moodTags: z.array(z.string()),
  styleTags: z.array(z.string()),
  customerNeeds: z.array(z.string()),
  colorSuggestions: z.array(z.string()),
  constraints: z.array(z.string()),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

const recommendationSchema = z.object({
  rank: z.number().int().min(1).max(3),
  title: z.string(),
  productType: z.enum(["pleated", "eyelet", "wave"]).nullable(),
  colorHint: z.string(),
  benefits: z.array(z.string()),
  description: z.string(),
});

const toolResponseSchema = z.object({
  analysis: analysisSchema,
  recommendations: z.array(recommendationSchema).min(1).max(3),
});

const SYSTEM_PROMPT = `คุณคือผู้เชี่ยวชาญด้านผ้าม่านและมู่ลี่ของ WP ALL ในประเทศไทย
วิเคราะห์รูปห้อง/หน้างานที่ได้รับ แล้วแนะนำแบบม่านที่เหมาะสม

สินค้าที่ขายได้:
- pleated (ม่านจีบ)
- eyelet (ม่านตาไก่)
- wave (ม่าน Wave)

ให้ความสำคัญกับ:
- ประเภทห้อง แสง เฟอร์นิเจอร์ โทนสี
- ความต้องการกันแสง/ความเป็นส่วนตัว
- ข้อจำกัดการติดตั้งที่มองเห็น (ช่องกระจก เพดาน ฯลฯ)

ตอบเป็นภาษาไทยใน reasoning, benefits, description
แนะนำ 1–3 แบบ เรียงจากเหมาะที่สุด`;

type AnalyzeInput = {
  imageUrls: string[];
  roomTypeHint?: string | null;
  customerNotes?: string | null;
};

async function callOpenAiVision(
  input: AnalyzeInput,
): Promise<z.infer<typeof toolResponseSchema>> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("ยังไม่ได้ตั้งค่า OPENAI_API_KEY");

  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";
  const userText = [
    "วิเคราะห์รูปห้องนี้และแนะนำแบบม่าน",
    input.roomTypeHint ? `ประเภทห้องที่ผู้ใช้ระบุ: ${input.roomTypeHint}` : null,
    input.customerNotes ? `ความต้องการเพิ่มเติม: ${input.customerNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const imageContent = input.imageUrls.slice(0, 3).map((url) => ({
    type: "image_url" as const,
    image_url: { url, detail: "low" as const },
  }));

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [{ type: "text", text: userText }, ...imageContent],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_room_advice",
            description: "ส่งผลวิเคราะห์ห้องและแบบม่านที่แนะนำ",
            parameters: {
              type: "object",
              properties: {
                analysis: {
                  type: "object",
                  properties: {
                    roomType: { type: "string" },
                    lightLevel: { type: "string" },
                    interiorStyle: { type: "array", items: { type: "string" } },
                    moodTags: { type: "array", items: { type: "string" } },
                    styleTags: { type: "array", items: { type: "string" } },
                    customerNeeds: { type: "array", items: { type: "string" } },
                    colorSuggestions: {
                      type: "array",
                      items: { type: "string" },
                    },
                    constraints: { type: "array", items: { type: "string" } },
                    reasoning: { type: "string" },
                    confidence: { type: "number" },
                  },
                  required: [
                    "roomType",
                    "lightLevel",
                    "interiorStyle",
                    "moodTags",
                    "styleTags",
                    "customerNeeds",
                    "colorSuggestions",
                    "constraints",
                    "reasoning",
                    "confidence",
                  ],
                  additionalProperties: false,
                },
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      rank: { type: "number" },
                      title: { type: "string" },
                      productType: {
                        type: ["string", "null"],
                        enum: ["pleated", "eyelet", "wave", null],
                      },
                      colorHint: { type: "string" },
                      benefits: { type: "array", items: { type: "string" } },
                      description: { type: "string" },
                    },
                    required: [
                      "rank",
                      "title",
                      "productType",
                      "colorHint",
                      "benefits",
                      "description",
                    ],
                    additionalProperties: false,
                  },
                },
              },
              required: ["analysis", "recommendations"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: {
        type: "function",
        function: { name: "submit_room_advice" },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("RATE_LIMIT");
    throw new Error(`AI error ${res.status}: ${text.slice(0, 200)}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{
      message?: { tool_calls?: Array<{ function?: { arguments?: string } }> };
    }>;
  };
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI ไม่สามารถวิเคราะห์รูปได้");
  return toolResponseSchema.parse(JSON.parse(args));
}

function scoreFabric(
  fabric: ConfiguratorCatalog["fabrics"][number],
  rec: z.infer<typeof recommendationSchema>,
): number {
  const hay = `${fabric.name} ${fabric.code}`.toLowerCase();
  const needle = rec.colorHint.toLowerCase();
  let score = 0;
  for (const part of needle.split(/\s+/)) {
    if (part.length >= 2 && hay.includes(part)) score += 3;
  }
  if (rec.productType && hay.includes(rec.productType)) score += 1;
  return score;
}

export function matchFabricsToRecommendations(
  catalog: ConfiguratorCatalog,
  rawRecs: z.infer<typeof recommendationSchema>[],
): StyleRecommendationDto[] {
  return rawRecs
    .sort((a, b) => a.rank - b.rank)
    .map((rec) => {
      const scored = catalog.fabrics
        .map((f) => ({ fabric: f, score: scoreFabric(f, rec) }))
        .sort((a, b) => b.score - a.score);
      const best = scored[0]?.score ? scored[0].fabric : catalog.fabrics[0];

      return {
        rank: rec.rank,
        title: rec.title,
        productType: rec.productType,
        fabricId: best?.id ?? null,
        fabricName: best?.name ?? null,
        fabricSwatchUrl: best?.swatchUrl ?? null,
        colorHint: rec.colorHint,
        benefits: rec.benefits,
        description: rec.description,
      };
    });
}

export async function analyzeRoomPhotos(
  input: AnalyzeInput,
  catalog: ConfiguratorCatalog,
): Promise<{
  analysis: RoomAnalysisDto;
  recommendations: StyleRecommendationDto[];
}> {
  const raw = await callOpenAiVision(input);
  return {
    analysis: raw.analysis,
    recommendations: matchFabricsToRecommendations(catalog, raw.recommendations),
  };
}
