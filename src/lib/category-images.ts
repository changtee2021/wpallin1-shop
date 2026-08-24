import type { CategoryDto } from "@/types/api/categories";

/** Static banner art for storefront category tiles (see /public/categories). */
const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  curtains: "/categories/curtains.png",
  "roller-blinds": "/categories/aluminum-blinds.png",
  "aluminum-blinds": "/categories/aluminum-blinds.png",
  "wood-blinds": "/categories/wood-blinds.png",
  "zebra-blinds": "/categories/zebra-blinds.png",
  "roman-blinds": "/categories/roman-blinds.png",
  "curtain-rails": "/categories/curtain-rails.png",
  accessories: "/categories/accessories.png",
  "ready-made": "/categories/roller-blind-alt.png",
  "motorized-curtains": "/categories/motorized-curtains.png",
  "outdoor-curtains": "/categories/outdoor-curtains.png",
  "fabric-print": "/categories/fabric-print.png",
};

export function resolveCategoryImageUrl(category: CategoryDto): string | null {
  if (category.imageUrl?.trim()) return category.imageUrl.trim();
  return CATEGORY_IMAGE_BY_SLUG[category.slug] ?? null;
}
