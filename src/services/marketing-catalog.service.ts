import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MarketingCatalogCategoryDto,
  MarketingCatalogDto,
  MarketingCatalogInput,
} from "@/types/api/marketing-catalogs";

type CatalogRow = {
  id: string;
  category_id: string | null;
  title: string;
  brand: string | null;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  tags: string[] | null;
  sort_order: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  marketing_catalog_categories?: { name: string } | null;
};

type ProductLinkRow = {
  catalog_id: string;
  product_id: string;
};

function mapCatalog(
  row: CatalogRow,
  productIds: string[],
): MarketingCatalogDto {
  return {
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.marketing_catalog_categories?.name ?? null,
    title: row.title,
    brand: row.brand,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    pdfUrl: row.pdf_url,
    externalLink: row.external_link,
    tags: row.tags ?? [],
    sortOrder: row.sort_order,
    isPublic: row.is_public,
    isActive: row.is_active,
    productIds,
    createdAt: row.created_at,
  };
}

async function loadProductIdsByCatalog(
  supabase: SupabaseClient,
  catalogIds: string[],
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!catalogIds.length) return map;

  const { data, error } = await supabase
    .from("marketing_catalog_products")
    .select("catalog_id, product_id")
    .in("catalog_id", catalogIds);

  if (error) throw new Error(error.message);

  for (const row of (data ?? []) as ProductLinkRow[]) {
    const existing = map.get(row.catalog_id) ?? [];
    existing.push(row.product_id);
    map.set(row.catalog_id, existing);
  }

  return map;
}

export async function listPublicMarketingCatalogs(
  supabase: SupabaseClient,
  categoryId?: string | null,
): Promise<MarketingCatalogDto[]> {
  let query = supabase
    .from("marketing_catalogs")
    .select(
      "id, category_id, title, brand, description, cover_image_url, pdf_url, external_link, tags, sort_order, is_public, is_active, created_at, marketing_catalog_categories(name)",
    )
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CatalogRow[];
  const productMap = await loadProductIdsByCatalog(
    supabase,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapCatalog(row, productMap.get(row.id) ?? []));
}

export async function getPublicMarketingCatalog(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketingCatalogDto | null> {
  const { data, error } = await supabase
    .from("marketing_catalogs")
    .select(
      "id, category_id, title, brand, description, cover_image_url, pdf_url, external_link, tags, sort_order, is_public, is_active, created_at, marketing_catalog_categories(name)",
    )
    .eq("id", id)
    .eq("is_public", true)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const productMap = await loadProductIdsByCatalog(supabase, [data.id]);
  return mapCatalog(data as CatalogRow, productMap.get(data.id) ?? []);
}

export async function listMarketingCatalogsForProduct(
  supabase: SupabaseClient,
  productId: string,
): Promise<MarketingCatalogDto[]> {
  const { data: links, error: linkErr } = await supabase
    .from("marketing_catalog_products")
    .select("catalog_id")
    .eq("product_id", productId);

  if (linkErr) throw new Error(linkErr.message);

  const catalogIds = (links ?? []).map((row) => row.catalog_id as string);
  if (!catalogIds.length) return [];

  const { data, error } = await supabase
    .from("marketing_catalogs")
    .select(
      "id, category_id, title, brand, description, cover_image_url, pdf_url, external_link, tags, sort_order, is_public, is_active, created_at, marketing_catalog_categories(name)",
    )
    .in("id", catalogIds)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CatalogRow[];
  const productMap = await loadProductIdsByCatalog(
    supabase,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapCatalog(row, productMap.get(row.id) ?? []));
}

export async function listAdminMarketingCatalogCategories(
  supabase: SupabaseClient,
): Promise<MarketingCatalogCategoryDto[]> {
  const { data, error } = await supabase
    .from("marketing_catalog_categories")
    .select("id, name, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function listAdminMarketingCatalogs(
  supabase: SupabaseClient,
): Promise<MarketingCatalogDto[]> {
  const { data, error } = await supabase
    .from("marketing_catalogs")
    .select(
      "id, category_id, title, brand, description, cover_image_url, pdf_url, external_link, tags, sort_order, is_public, is_active, created_at, marketing_catalog_categories(name)",
    )
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = (data ?? []) as CatalogRow[];
  const productMap = await loadProductIdsByCatalog(
    supabase,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapCatalog(row, productMap.get(row.id) ?? []));
}

export async function saveMarketingCatalogCategory(
  supabase: SupabaseClient,
  input: { id?: string; name: string; sortOrder?: number; isActive?: boolean },
): Promise<void> {
  const payload = {
    name: input.name.trim(),
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("marketing_catalog_categories")
      .update(payload)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase
    .from("marketing_catalog_categories")
    .insert(payload);
  if (error) throw new Error(error.message);
}

export async function deleteMarketingCatalogCategory(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("marketing_catalog_categories")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function saveMarketingCatalog(
  supabase: SupabaseClient,
  input: MarketingCatalogInput,
  createdBy?: string | null,
): Promise<string> {
  const payload = {
    category_id: input.categoryId ?? null,
    title: input.title.trim(),
    brand: input.brand?.trim() || null,
    description: input.description?.trim() || null,
    cover_image_url: input.coverImageUrl ?? null,
    pdf_url: input.pdfUrl ?? null,
    external_link: input.externalLink?.trim() || null,
    tags: input.tags ?? [],
    sort_order: input.sortOrder ?? 0,
    is_public: input.isPublic ?? true,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  let catalogId = input.id;

  if (catalogId) {
    const { error } = await supabase
      .from("marketing_catalogs")
      .update(payload)
      .eq("id", catalogId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("marketing_catalogs")
      .insert({ ...payload, created_by: createdBy ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    catalogId = data.id;
  }

  const productIds = input.productIds ?? [];
  const { error: deleteErr } = await supabase
    .from("marketing_catalog_products")
    .delete()
    .eq("catalog_id", catalogId);
  if (deleteErr) throw new Error(deleteErr.message);

  if (productIds.length) {
    const { error: insertErr } = await supabase
      .from("marketing_catalog_products")
      .insert(
        productIds.map((productId) => ({
          catalog_id: catalogId,
          product_id: productId,
        })),
      );
    if (insertErr) throw new Error(insertErr.message);
  }

  return catalogId;
}

export async function deleteMarketingCatalog(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("marketing_catalogs")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
