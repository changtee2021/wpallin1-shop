export type ProductType = "standard" | "custom";

export type ProductOptionChoiceDto = {
  key: string;
  label: string;
  priceDelta: number;
};

export type ProductOptionGroupDto = {
  groupKey: string;
  groupLabel: string;
  required: boolean;
  choices: ProductOptionChoiceDto[];
};

export type ProductPublicDto = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  sku: string;
  productType: ProductType;
  retailPrice: number;
  compareAtPrice?: number | null;
  imageUrl: string | null;
  isFeatured: boolean;
  isActive: boolean;
  stock: number;
  moq: number;
  leadTimeDays: number | null;
  unit: string | null;
  weightKg: number | null;
  attributes: Record<string, unknown> | null;
  optionGroups: ProductOptionGroupDto[];
  createdAt?: string | null;
  /** QA seed product (slug mock-*, tag mock, metadata.is_mock) — not indexed for SEO */
  isMock: boolean;
};

export type ProductListQuery = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  productType?: ProductType;
  inStock?: boolean;
  style?: string[];
  color?: string[];
  material?: string[];
  sortBy?: "name" | "retail_price" | "created_at";
  sortDir?: "asc" | "desc";
};

export type ShopFilterFacetOption = {
  value: string;
  count: number;
};

export type ShopFilterFacets = {
  priceRange: { min: number; max: number };
  categories: Array<{ slug: string; name: string; count: number }>;
  styles: ShopFilterFacetOption[];
  colors: ShopFilterFacetOption[];
  materials: ShopFilterFacetOption[];
};
