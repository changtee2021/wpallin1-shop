import type { SupabaseClient } from "@supabase/supabase-js";

import { listCategories } from "@/services/catalog.service";

type MarketingCategoryRef = {
  slug: string;
  name: string;
};

const CATEGORY_RULES: { test: RegExp; productSlug: string }[] = [
  { test: /print.?roller|ม่านม้วนพิมพ์|printed.?roller/i, productSlug: "printed-roller-blinds" },
  { test: /roller|ม้วน|roll/i, productSlug: "roller-blinds" },
  { test: /vertical|แนวตั้ง|zebra/i, productSlug: "vertical-blinds" },
  { test: /aluminum|aluminium|อลูมิเนียม/i, productSlug: "aluminum-blinds" },
  { test: /wood.?blind|มู่ลี่ไม้/i, productSlug: "wood-blinds" },
  { test: /zip|ซิป/i, productSlug: "zip-blinds" },
  { test: /skylight|fss/i, productSlug: "skylight-fss" },
  { test: /folding|ประตูพับ/i, productSlug: "pvc-folding-doors" },
  { test: /strip|ริ้ว/i, productSlug: "pvc-strip-curtains" },
  { test: /wallpaper|วอลเปเปอร์/i, productSlug: "wallpaper" },
  { test: /tint|ฟิล์ม/i, productSlug: "window-tinting" },
  { test: /noren|โนเรน/i, productSlug: "noren" },
  { test: /print|พิมพ์ผ้า/i, productSlug: "fabric-print" },
  { test: /outdoor|กลางแจ้ง|ภายนอก/i, productSlug: "outdoor-curtains" },
  { test: /access|อุปกร/i, productSlug: "accessories" },
  { test: /curtain|ม่าน/i, productSlug: "curtains" },
];

export function matchProductCategorySlug(
  marketingCategory: MarketingCategoryRef,
  shopCategories: { slug: string; name: string }[],
): string | null {
  const direct = shopCategories.find(
    (c) =>
      c.slug === marketingCategory.slug ||
      c.name.trim() === marketingCategory.name.trim(),
  );
  if (direct) return direct.slug;

  const text =
    `${marketingCategory.slug} ${marketingCategory.name}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(text)) {
      const exists = shopCategories.some((c) => c.slug === rule.productSlug);
      if (exists) return rule.productSlug;
    }
  }
  return null;
}

export async function resolveShopCategorySlugForMarketingCategory(
  supabase: SupabaseClient,
  categoryId: string | null,
): Promise<string | null> {
  if (!categoryId) return null;

  const { data, error } = await supabase
    .from("marketing_catalog_categories")
    .select("slug, name")
    .eq("id", categoryId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const shopCategories = await listCategories(supabase);
  return matchProductCategorySlug(
    { slug: data.slug, name: data.name },
    shopCategories,
  );
}
