import { useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/storefront/product-card";
import {
  getRecentlyViewed,
  type RecentlyViewedItem,
} from "@/lib/recently-viewed";
import type { ProductPublicDto } from "@/types/api/products";

type RecentlyViewedSectionProps = {
  title?: string;
  limit?: number;
  excludeProductIds?: string[];
  showCompare?: boolean;
  className?: string;
};

function toProductCardDto(item: RecentlyViewedItem): ProductPublicDto {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    imageUrl: item.imageUrl,
    retailPrice: item.retailPrice,
    description: null,
    categorySlug: null,
    categoryName: null,
    sku: "",
    productType: "standard",
    compareAtPrice: null,
    isFeatured: false,
    isActive: true,
    stock: 1,
    moq: 1,
    leadTimeDays: null,
    unit: null,
    weightKg: null,
    attributes: null,
    optionGroups: [],
  };
}

export function RecentlyViewedSection({
  title = "ดูล่าสุด",
  limit = 6,
  excludeProductIds = [],
  showCompare = true,
  className = "",
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  const excludeSet = useMemo(
    () => new Set(excludeProductIds),
    [excludeProductIds],
  );

  const visibleItems = useMemo(
    () => items.filter((item) => !excludeSet.has(item.id)).slice(0, limit),
    [items, excludeSet, limit],
  );

  if (visibleItems.length === 0) return null;

  return (
    <section className={className}>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {visibleItems.map((item) => (
          <ProductCard
            key={item.id}
            product={toProductCardDto(item)}
            showCompare={showCompare}
          />
        ))}
      </div>
    </section>
  );
}
