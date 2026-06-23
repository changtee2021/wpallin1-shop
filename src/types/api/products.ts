export type ProductType = "standard" | "custom";

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
  createdAt?: string | null;
};

export type ProductListQuery = {
  page?: number;
  pageSize?: number;
  category?: string;
  search?: string;
  featured?: boolean;
  sortBy?: "name" | "retail_price" | "created_at";
  sortDir?: "asc" | "desc";
};
