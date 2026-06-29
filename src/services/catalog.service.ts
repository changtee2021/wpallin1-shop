import type { SupabaseClient } from "@supabase/supabase-js";

import { emptyProductList, normalizeProductListQuery } from "@/domain/catalog";
import {
  buildProductSearchOrClause,
  escapeIlike,
  expandSearchTerms,
} from "@/domain/product-search";
import type { CategoryDto } from "@/types/api/categories";
import type { ApiListResponse } from "@/types/api/common";
import type {
  ProductListQuery,
  ProductPublicDto,
  ShopFilterFacets,
} from "@/types/api/products";
import { listProductOptionGroups } from "@/services/product-options.service";

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
  unit: string | null;
  weight_kg: number | null;
  attributes: Record<string, unknown> | null;
  tags: string[] | null;
  metadata: Record<string, unknown> | null;
  category_id: string | null;
  created_at: string;
};

function applyAttributeFilter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builder: any,
  key: string,
  values: string[] | undefined,
) {
  if (!values?.length) return builder;
  const clauses = values.map(
    (v) => `attributes->>${key}.ilike.%${escapeIlike(v)}%`,
  );
  return builder.or(clauses.join(","));
}

function applyProductFilters(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  builder: any,
  normalized: ReturnType<typeof normalizeProductListQuery>,
  categoryId: string | null,
) {
  if (normalized.search) {
    const terms = expandSearchTerms(normalized.search);
    const orClause = buildProductSearchOrClause(terms);
    if (orClause) builder = builder.or(orClause);
  }
  if (normalized.featured) {
    builder = builder.eq("is_featured", true);
  }
  if (categoryId) {
    builder = builder.eq("category_id", categoryId);
  }
  if (normalized.minPrice != null) {
    builder = builder.gte("retail_price", normalized.minPrice);
  }
  if (normalized.maxPrice != null) {
    builder = builder.lte("retail_price", normalized.maxPrice);
  }
  if (normalized.productType) {
    builder = builder.eq("product_type", normalized.productType);
  }
  if (normalized.inStock) {
    builder = builder.gt("stock_qty", 0);
  }
  builder = applyAttributeFilter(builder, "style", normalized.style);
  builder = applyAttributeFilter(builder, "color", normalized.color);
  builder = applyAttributeFilter(builder, "material", normalized.material);
  return builder;
}

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
  const leadTimeRaw = row.metadata?.["lead_time_days"];
  const leadTimeDays =
    typeof leadTimeRaw === "number"
      ? leadTimeRaw
      : typeof leadTimeRaw === "string" && leadTimeRaw.trim() !== ""
        ? Number(leadTimeRaw)
        : null;
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
    leadTimeDays:
      leadTimeDays != null && Number.isFinite(leadTimeDays)
        ? leadTimeDays
        : null,
    unit: row.unit ?? null,
    weightKg: row.weight_kg != null ? Number(row.weight_kg) : null,
    attributes:
      row.attributes && typeof row.attributes === "object"
        ? row.attributes
        : null,
    optionGroups: [],
    createdAt: row.created_at,
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

  builder = applyProductFilters(builder, normalized, categoryId);

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
  const product = mapProduct(data as ProductRow, categories);
  product.optionGroups = await listProductOptionGroups(supabase, product.id);
  return product;
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
  const product = mapProduct(data as ProductRow, categories);
  product.optionGroups = await listProductOptionGroups(supabase, product.id);
  return product;
}

export async function getPublicProductsByIds(
  supabase: SupabaseClient,
  ids: string[],
): Promise<ProductPublicDto[]> {
  if (!ids.length) return [];

  const categories = await loadCategoryMap(supabase);
  const { data, error } = await supabase
    .from("products_public")
    .select("*")
    .in("id", ids);

  if (error) throw new Error(error.message);

  const byId = new Map(
    (data ?? []).map((row) => [
      row.id as string,
      mapProduct(row as ProductRow, categories),
    ]),
  );

  return ids
    .map((id) => byId.get(id))
    .filter((product): product is ProductPublicDto => Boolean(product));
}

function countAttributeValues(
  rows: ProductRow[],
  key: string,
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const raw = row.attributes?.[key];
    if (raw == null) continue;
    const values = Array.isArray(raw) ? raw : [raw];
    for (const v of values) {
      const str = String(v).trim();
      if (!str) continue;
      counts.set(str, (counts.get(str) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

export async function getShopFilterFacets(
  supabase: SupabaseClient,
): Promise<ShopFilterFacets> {
  const categories = await loadCategoryMap(supabase);
  const { data, error } = await supabase
    .from("products_public")
    .select("category_id, retail_price, attributes");

  if (error) {
    if (error.code === "42P01" || error.message.includes("does not exist")) {
      return {
        priceRange: { min: 0, max: 10000 },
        categories: [],
        styles: [],
        colors: [],
        materials: [],
      };
    }
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<{
    category_id: string | null;
    retail_price: number;
    attributes: Record<string, unknown> | null;
  }>;

  const categoryCounts = new Map<string, number>();
  let minPrice = Infinity;
  let maxPrice = 0;

  for (const row of rows) {
    const price = Number(row.retail_price);
    if (Number.isFinite(price)) {
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    }
    if (row.category_id) {
      categoryCounts.set(
        row.category_id,
        (categoryCounts.get(row.category_id) ?? 0) + 1,
      );
    }
  }

  const facetRows = rows.map((r) => ({
    attributes: r.attributes,
  })) as ProductRow[];

  const categoryList = [...categories.entries()]
    .map(([id, cat]) => ({
      slug: cat.slug,
      name: cat.name,
      count: categoryCounts.get(id) ?? 0,
    }))
    .filter((c) => c.count > 0);

  return {
    priceRange: {
      min: Number.isFinite(minPrice) ? Math.floor(minPrice) : 0,
      max: maxPrice > 0 ? Math.ceil(maxPrice) : 10000,
    },
    categories: categoryList,
    styles: countAttributeValues(facetRows, "style"),
    colors: countAttributeValues(facetRows, "color"),
    materials: countAttributeValues(facetRows, "material"),
  };
}
