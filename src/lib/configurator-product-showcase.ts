type ShowcaseProduct = {
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  retailPrice: number;
};

const MATCH_TERMS: Record<string, string[]> = {
  pleated: ["pleated", "จีบ"],
  eyelet: ["eyelet", "ตาไก่"],
  wave: ["wave"],
};

/** Fallback art when no linked product or metadata image exists. */
export const CONFIGURATOR_FALLBACK_IMAGES: Record<string, string> = {
  pleated:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
  eyelet:
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop",
  wave: "https://images.unsplash.com/photo-1513694203232-719a28002207?w=800&h=600&fit=crop",
};

const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  pleated: "ม่านจีบคลassic ให้รูปลอนสวยงาม เหมาะห้องรับแขก",
  eyelet: "ม่านตาไก่ ติดตั้งง่าย ดูโมเดิร์น",
  wave: "ม่าน Wave โค้งนุ่ม ให้ความรู้สึกหรูหรา",
};

export function matchShowcaseProduct(
  key: string,
  products: ShowcaseProduct[],
): ShowcaseProduct | undefined {
  const terms = MATCH_TERMS[key] ?? [key];
  return products.find((p) =>
    terms.some(
      (term) =>
        p.slug.toLowerCase().includes(term.toLowerCase()) ||
        p.name.toLowerCase().includes(term.toLowerCase()),
    ),
  );
}

export function resolveProductTypeShowcase(
  key: string,
  metadata: Record<string, unknown> | null,
  products: ShowcaseProduct[],
) {
  const metaImage =
    typeof metadata?.image_url === "string"
      ? metadata.image_url
      : typeof metadata?.imageUrl === "string"
        ? metadata.imageUrl
        : null;
  const metaDesc =
    typeof metadata?.description === "string" ? metadata.description : null;

  const matched = matchShowcaseProduct(key, products);

  return {
    imageUrl:
      metaImage ?? matched?.imageUrl ?? CONFIGURATOR_FALLBACK_IMAGES[key] ?? null,
    description:
      metaDesc ?? matched?.description ?? FALLBACK_DESCRIPTIONS[key] ?? null,
    startingPrice: matched?.retailPrice ?? null,
    showcaseSlug: matched?.slug ?? null,
  };
}

export function getConfiguratorFallbackImage(key: string): string | null {
  return CONFIGURATOR_FALLBACK_IMAGES[key] ?? null;
}
