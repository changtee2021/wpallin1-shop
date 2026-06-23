import type { SupabaseClient } from "@supabase/supabase-js";

import { emptyProductList, normalizeProductListQuery } from "@/domain/catalog";
import type { CategoryDto } from "@/types/api/categories";
import type { ApiListResponse } from "@/types/api/common";
import type { ProductListQuery, ProductPublicDto } from "@/types/api/products";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sku: string | null;
  product_type: string;
  retail_price: number;
  compare_at_price: number | null;
  image_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  stock_qty: number;
  min_order_qty: number;
  category_id: string | null;
  created_at: string;
};

const categoryCache = new Map<string, { slug: string; name: string }>();

async function loadCategoryMap(supabase: SupabaseClient) {
  if (categoryCache.size) return categoryCache;
  const { data } = await supabase
    .from("product_categories")
    .select("id, slug, name")
    .eq("is_active", true);
  for (const row of data ?? []) {
    categoryCache.set(row.id, { slug: row.slug, name: row.name });
  }
  return categoryCache;
}

function mapProduct(
  row: ProductRow,
  categories: Map<string, { slug: string; name: string }>,
): ProductPublicDto {
  const cat = row.category_id ? categories.get(row.category_id) : null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    categorySlug: cat?.slug ?? null,
    categoryName: cat?.name ?? null,
    sku: row.sku ?? row.slug,
    productType: row.product_type as ProductPublicDto["productType"],
    retailPrice: Number(row.retail_price),
    compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
    imageUrl: row.image_url,
    isFeatured: row.is_featured,
    isActive: row.is_active,
    stock: Number(row.stock_qty),
    moq: row.min_order_qty,
    leadTimeDays: null,
  };
}

export async function listCategories(
  supabase: SupabaseClient,
): Promise<CategoryDto[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("id, slug, name, description, image_url, sort_order")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
  }));
}

export async function listPublicProducts(
  supabase: SupabaseClient,
  query: ProductListQuery = {},
): Promise<ApiListResponse<ProductPublicDto>> {
  const normalized = normalizeProductListQuery(query);
  const categories = await loadCategoryMap(supabase);

  let categoryId: string | null = null;
  if (normalized.category) {
    const match = [...categories.entries()].find(
      ([, c]) => c.slug === normalized.category,
    );
    categoryId = match?.[0] ?? null;
  }

  let builder = supabase
    .from("products_public")
    .select("*", { count: "exact" });

  if (normalized.search) {
    builder = builder.or(
      `name.ilike.%${normalized.search}%,sku.ilike.%${normalized.search}%,slug.ilike.%${normalized.search}%`,
    );
  }
  if (normalized.featured) {
    builder = builder.eq("is_featured", true);
  }
  if (categoryId) {
    builder = builder.eq("category_id", categoryId);
  }

  const sortCol = normalized.sortBy ?? "created_at";
  builder = builder.order(sortCol, {
    ascending: normalized.sortDir !== "desc",
  });
  builder = builder.range(normalized.from, normalized.to);

  const { data, error, count } = await builder;

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return emptyProductList(normalized.page, normalized.pageSize);
    }
    throw new Error(error.message);
  }

  const total = count ?? 0;
  return {
    data: (data ?? []).map((row) => mapProduct(row as ProductRow, categories)),
    meta: {
      page: normalized.page,
      pageSize: normalized.pageSize,
      total,
      totalPages: total ? Math.ceil(total / normalized.pageSize) : 0,
    },
  };
}

export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<ProductPublicDto | null> {
  const categories = await loadCategoryMap(supabase);
  const { data, error } = await supabase
    .from("products_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as ProductRow, categories);
}

export async function getProductById(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductPublicDto | null> {
  const categories = await loadCategoryMap(supabase);
  const { data, error } = await supabase
    .from("products_public")
    .select("*")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapProduct(data as ProductRow, categories);
}
