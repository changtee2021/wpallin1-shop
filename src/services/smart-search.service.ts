import type { SupabaseClient } from "@supabase/supabase-js";

import {
  expandSearchTerms,
  extractMaxPrice,
  extractMinPrice,
  inferCategoryFromQuery,
} from "@/domain/product-search";
import {
  searchIntentSchema,
  searchIntentToProductQuery,
  type SearchIntent,
} from "@/domain/search-intent";
import type { ApiListResponse } from "@/types/api/common";
import type { ProductListQuery, ProductPublicDto } from "@/types/api/products";
import { listPublicProducts } from "@/services/catalog.service";

const SYSTEM_PROMPT = `You are a product search assistant for WP ALL, a Thai curtain and blind e-commerce store.
Parse the user's natural language query into structured search intent JSON.

Categories (slug): curtains, roller-blinds, zebra-blinds, curtain-rails, accessories, ready-made

Output ONLY valid JSON matching this schema:
{
  "keywords": string[],
  "category": string | null,
  "filters": {
    "style": string[],
    "color": string[],
    "material": string[],
    "minPrice": number | null,
    "maxPrice": number | null,
    "productType": "standard" | "custom" | null,
    "inStock": boolean | null,
    "featured": boolean | null
  },
  "explanationTh": string
}

Rules:
- explanationTh: short Thai summary of what user wants (1 sentence)
- keywords: remaining product terms not captured in filters
- Infer category from context (e.g. ม่าน → curtains, มู่ลี่ → roller-blinds)
- Extract price limits from phrases like "ไม่เกิน 3000", "งบ 5000"
- Use null for unknown filter fields, empty arrays for none
- style/color/material values in Thai or English as user mentioned`;

function parseFallbackIntent(query: string): SearchIntent {
  const trimmed = query.trim();
  const category = inferCategoryFromQuery(trimmed);
  const maxPrice = extractMaxPrice(trimmed);
  const minPrice = extractMinPrice(trimmed);

  const terms = expandSearchTerms(trimmed);
  const stopWords = new Set([
    "อยาก",
    "ได้",
    "ที่",
    "สำหรับ",
    "ห้อง",
    "งบ",
    "ไม่",
    "เกิน",
    "บาท",
    "want",
    "need",
    "for",
    "under",
    "budget",
  ]);
  const keywords = terms.filter(
    (t) => t.length > 1 && !stopWords.has(t.toLowerCase()),
  );

  const parts: string[] = [];
  if (category) {
    const catLabels: Record<string, string> = {
      curtains: "ม่าน",
      "roller-blinds": "มู่ลี่",
      "zebra-blinds": "Zebra",
      "curtain-rails": "รางม่าน",
      accessories: "อุปกรณ์",
      "ready-made": "ม่านสำเร็จรูป",
    };
    parts.push(catLabels[category] ?? category);
  }
  if (keywords.length) parts.push(keywords.slice(0, 3).join(" "));
  if (maxPrice) parts.push(`ไม่เกิน ฿${maxPrice.toLocaleString()}`);

  return searchIntentSchema.parse({
    keywords: keywords.length ? keywords : [trimmed],
    category,
    filters: {
      maxPrice,
      minPrice,
    },
    explanationTh: parts.length ? parts.join(" • ") : `ค้นหา: ${trimmed}`,
  });
}

async function parseIntentWithLlm(query: string): Promise<SearchIntent | null> {
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
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: query },
        ],
      }),
    });

    if (!res.ok) return null;

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content;
    if (!content) return null;

    const raw = JSON.parse(content) as Record<string, unknown>;
    const filters = raw.filters as Record<string, unknown> | undefined;
    const cleaned = {
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      category: raw.category ?? undefined,
      filters: filters
        ? {
            style: filters.style ?? undefined,
            color: filters.color ?? undefined,
            material: filters.material ?? undefined,
            minPrice: filters.minPrice ?? undefined,
            maxPrice: filters.maxPrice ?? undefined,
            productType: filters.productType ?? undefined,
            inStock: filters.inStock ?? undefined,
            featured: filters.featured ?? undefined,
          }
        : undefined,
      explanationTh:
        typeof raw.explanationTh === "string" ? raw.explanationTh : "",
    };

    return searchIntentSchema.parse(cleaned);
  } catch {
    return null;
  }
}

export async function parseSearchIntent(
  query: string,
  options?: { allowLlm?: boolean },
): Promise<{ intent: SearchIntent; source: "llm" | "fallback" }> {
  if (options?.allowLlm !== false) {
    const llmIntent = await parseIntentWithLlm(query);
    if (llmIntent) {
      return { intent: llmIntent, source: "llm" };
    }
  }
  return { intent: parseFallbackIntent(query), source: "fallback" };
}

export type SmartSearchResult = ApiListResponse<ProductPublicDto> & {
  intent: SearchIntent;
  source: "llm" | "fallback";
};

export async function smartSearchProducts(
  supabase: SupabaseClient,
  query: string,
  options: Omit<ProductListQuery, "search" | "category"> & {
    allowLlm?: boolean;
  } = {},
): Promise<SmartSearchResult> {
  const { allowLlm, ...listOptions } = options;
  const { intent, source } = await parseSearchIntent(query, { allowLlm });
  const listQuery = searchIntentToProductQuery(
    intent,
    listOptions.page,
    listOptions.pageSize,
    listOptions.sortBy,
    listOptions.sortDir,
  );
  const products = await listPublicProducts(supabase, listQuery);
  return { ...products, intent, source };
}
