import type { SearchIntent } from "@/domain/search-intent";

export type ShopSearchState = {
  search?: string;
  smartQuery?: string;
  category?: string;
  page?: number;
  sortBy?: "created_at" | "name" | "retail_price";
  sortDir?: "asc" | "desc";
  minPrice?: number;
  maxPrice?: number;
  productType?: "standard" | "custom";
  inStock?: boolean;
  featured?: boolean;
  style?: string[];
  color?: string[];
  material?: string[];
};

export const SHOP_SORT_OPTIONS = [
  { sortBy: "created_at", sortDir: "desc", labelKey: "shop.sort.newest" },
  { sortBy: "retail_price", sortDir: "asc", labelKey: "shop.sort.priceAsc" },
  { sortBy: "retail_price", sortDir: "desc", labelKey: "shop.sort.priceDesc" },
  { sortBy: "name", sortDir: "asc", labelKey: "shop.sort.nameAsc" },
] as const satisfies ReadonlyArray<{
  sortBy: NonNullable<ShopSearchState["sortBy"]>;
  sortDir: NonNullable<ShopSearchState["sortDir"]>;
  labelKey: string;
}>;

export function isShopSortActive(
  search: ShopSearchState,
  sortBy: ShopSearchState["sortBy"],
  sortDir: ShopSearchState["sortDir"],
): boolean {
  return (
    (search.sortBy ?? "created_at") === sortBy &&
    (search.sortDir ?? "desc") === sortDir
  );
}

export function shopFilterKey(search: ShopSearchState): string {
  return JSON.stringify({
    search: search.search,
    smartQuery: search.smartQuery,
    category: search.category,
    sortBy: search.sortBy,
    sortDir: search.sortDir,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    productType: search.productType,
    inStock: search.inStock,
    featured: search.featured,
    style: search.style,
    color: search.color,
    material: search.material,
  });
}

export function buildShopListOptions(
  search: ShopSearchState,
  page: number,
  pageSize = 24,
) {
  return {
    page,
    pageSize,
    category: search.category,
    search: search.smartQuery ? undefined : search.search,
    minPrice: search.minPrice,
    maxPrice: search.maxPrice,
    productType: search.productType,
    inStock: search.inStock,
    featured: search.featured,
    style: search.style,
    color: search.color,
    material: search.material,
    sortBy: search.sortBy ?? "created_at",
    sortDir: search.sortDir ?? "desc",
  };
}

export function countActiveFilters(search: ShopSearchState): number {
  let count = 0;
  if (search.category) count++;
  if (search.minPrice != null) count++;
  if (search.maxPrice != null) count++;
  if (search.productType) count++;
  if (search.inStock) count++;
  if (search.featured) count++;
  if (search.search) count++;
  if (search.smartQuery) count++;
  count += search.style?.length ?? 0;
  count += search.color?.length ?? 0;
  count += search.material?.length ?? 0;
  return count;
}

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => Partial<ShopSearchState>;
};

export function buildActiveFilterChips(
  search: ShopSearchState,
  categoryNames: Record<string, string>,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (search.smartQuery) {
    chips.push({
      key: "smartQuery",
      label: search.smartQuery,
      onRemove: () => ({ smartQuery: undefined }),
    });
  } else if (search.search) {
    chips.push({
      key: "search",
      label: `"${search.search}"`,
      onRemove: () => ({ search: undefined }),
    });
  }

  if (search.category) {
    chips.push({
      key: "category",
      label: categoryNames[search.category] ?? search.category,
      onRemove: () => ({ category: undefined }),
    });
  }

  if (search.minPrice != null) {
    chips.push({
      key: "minPrice",
      label: `≥ ฿${search.minPrice.toLocaleString()}`,
      onRemove: () => ({ minPrice: undefined }),
    });
  }

  if (search.maxPrice != null) {
    chips.push({
      key: "maxPrice",
      label: `≤ ฿${search.maxPrice.toLocaleString()}`,
      onRemove: () => ({ maxPrice: undefined }),
    });
  }

  if (search.productType) {
    chips.push({
      key: "productType",
      label: search.productType === "custom" ? "สั่งทำพิเศษ" : "สินค้าพร้อมส่ง",
      onRemove: () => ({ productType: undefined }),
    });
  }

  if (search.inStock) {
    chips.push({
      key: "inStock",
      label: "มีสต็อก",
      onRemove: () => ({ inStock: undefined }),
    });
  }

  if (search.featured) {
    chips.push({
      key: "featured",
      label: "สินค้าแนะนำ",
      onRemove: () => ({ featured: undefined }),
    });
  }

  for (const value of search.style ?? []) {
    chips.push({
      key: `style-${value}`,
      label: value,
      onRemove: () => ({
        style: search.style?.filter((s) => s !== value),
      }),
    });
  }

  for (const value of search.color ?? []) {
    chips.push({
      key: `color-${value}`,
      label: value,
      onRemove: () => ({
        color: search.color?.filter((c) => c !== value),
      }),
    });
  }

  for (const value of search.material ?? []) {
    chips.push({
      key: `material-${value}`,
      label: value,
      onRemove: () => ({
        material: search.material?.filter((m) => m !== value),
      }),
    });
  }

  return chips;
}

export function clearAllFilters(): Partial<ShopSearchState> {
  return {
    search: undefined,
    smartQuery: undefined,
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    productType: undefined,
    inStock: undefined,
    featured: undefined,
    style: undefined,
    color: undefined,
    material: undefined,
    page: 1,
  };
}

export function intentToChips(intent: SearchIntent): string[] {
  const chips: string[] = [];
  if (intent.category) chips.push(intent.category);
  if (intent.filters?.style?.length) chips.push(...intent.filters.style);
  if (intent.filters?.color?.length) chips.push(...intent.filters.color);
  if (intent.filters?.material?.length) chips.push(...intent.filters.material);
  if (intent.filters?.maxPrice)
    chips.push(`≤฿${intent.filters.maxPrice.toLocaleString()}`);
  if (intent.keywords.length) chips.push(...intent.keywords.slice(0, 3));
  return chips;
}
