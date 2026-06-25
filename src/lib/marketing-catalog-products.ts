import type { SupabaseClient } from "@supabase/supabase-js";

import { listCategories } from "@/services/catalog.service";

type MarketingCategoryRef = {
  slug: string;
  name: string;
};

const CATEGORY_RULES: { test: RegExp; productSlug: string }[] = [
  { test: /roller|ม้วน|roll/i, productSlug: "roller-blinds" },
  { test: /zebra/i, productSlug: "zebra-blinds" },
  { test: /motor|มอเตอร์/i, productSlug: "motor-track" },
  { test: /rail|track|ราง/i, productSlug: "curtain-rails" },
  { test: /curtain|ม่าน/i, productSlug: "curtains" },
  { test: /access|อุปกร/i, productSlug: "accessories" },
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
