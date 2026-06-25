import type { SupabaseClient } from "@supabase/supabase-js";

import { slugifyCatalogTitle } from "@/lib/catalog-slug";
import { resolveShopCategorySlugForMarketingCategory } from "@/lib/marketing-catalog-products";
import {
  getPublicProductsByIds,
  listPublicProducts,
} from "@/services/catalog.service";
import type {
  CatalogStatus,
  CatalogViewDevice,
  CatalogViewStatsDto,
  CatalogVisibility,
  MarketingCatalogAccessDto,
  MarketingCatalogCategoryDto,
  MarketingCatalogDto,
  MarketingCatalogInput,
} from "@/types/api/marketing-catalogs";
import type { ProductPublicDto } from "@/types/api/products";

const CATALOG_SELECT =
  "id, slug, category_id, title, brand, description, cover_image_url, pdf_url, pdf_storage_path, external_link, tags, version, page_count, file_size, visibility, allow_download, is_featured, status, sort_order, is_public, is_active, created_at, updated_at, marketing_catalog_categories(name)";

type CatalogRow = {
  id: string;
  slug: string;
  category_id: string | null;
  title: string;
  brand: string | null;
  description: string | null;
  cover_image_url: string | null;
  pdf_url: string | null;
  pdf_storage_path: string | null;
  external_link: string | null;
  tags: string[] | null;
  version: string | null;
  page_count: number | null;
  file_size: number | null;
  visibility: CatalogVisibility | null;
  allow_download: boolean | null;
  is_featured: boolean | null;
  status: CatalogStatus | null;
  sort_order: number;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  marketing_catalog_categories?: { name: string } | null;
};

type ProductLinkRow = {
  catalog_id: string;
  product_id: string;
};

function resolveVisibility(row: CatalogRow): CatalogVisibility {
  if (row.visibility) return row.visibility;
  return row.is_public ? "public" : "private";
}

function resolveStatus(row: CatalogRow): CatalogStatus {
  if (row.status) return row.status;
  return row.is_active ? "published" : "draft";
}

function mapCatalog(
  row: CatalogRow,
  productIds: string[],
): MarketingCatalogDto {
  const visibility = resolveVisibility(row);
  const status = resolveStatus(row);
  return {
    id: row.id,
    slug: row.slug ?? row.id,
    categoryId: row.category_id,
    categoryName: row.marketing_catalog_categories?.name ?? null,
    title: row.title,
    brand: row.brand,
    description: row.description,
    coverImageUrl: row.cover_image_url,
    pdfUrl: row.pdf_url,
    pdfStoragePath: row.pdf_storage_path,
    externalLink: row.external_link,
    tags: row.tags ?? [],
    version: row.version,
    pageCount: row.page_count,
    fileSize: row.file_size,
    visibility,
    allowDownload: row.allow_download ?? false,
    isFeatured: row.is_featured ?? false,
    status,
    sortOrder: row.sort_order,
    isPublic: visibility === "public" && status === "published",
    isActive: status === "published",
    productIds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isPublishedPublic(catalog: MarketingCatalogDto): boolean {
  return catalog.status === "published" && catalog.visibility === "public";
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

async function fetchCatalogRows(
  supabase: SupabaseClient,
  filter?: {
    categoryId?: string | null;
    storefront?: boolean;
    publicOnly?: boolean;
  },
): Promise<MarketingCatalogDto[]> {
  let query = supabase
    .from("marketing_catalogs")
    .select(CATALOG_SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filter?.storefront) {
    query = query
      .eq("status", "published")
      .in("visibility", ["public", "dealer"]);
  } else if (filter?.publicOnly) {
    query = query.eq("status", "published").eq("visibility", "public");
  }

  if (filter?.categoryId) {
    query = query.eq("category_id", filter.categoryId);
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

export async function isApprovedDealerUser(
  supabase: SupabaseClient,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) return false;

  const { data: roles, error: roleErr } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (roleErr) throw new Error(roleErr.message);

  const roleList = (roles ?? []).map((row) => row.role as string);
  if (roleList.some((role) => role === "admin" || role === "super_admin")) {
    return true;
  }

  if (!roleList.includes("dealer")) return false;

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("account_status")
    .eq("id", userId)
    .maybeSingle();

  if (profileErr) throw new Error(profileErr.message);
  return profile?.account_status === "approved";
}

function stripPdfForLock(catalog: MarketingCatalogDto): MarketingCatalogDto {
  return {
    ...catalog,
    pdfUrl: null,
    allowDownload: false,
  };
}

export async function resolveMarketingCatalogAccess(
  supabase: SupabaseClient,
  ref: string,
  userId?: string | null,
): Promise<MarketingCatalogAccessDto | null> {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ref);

  let query = supabase.from("marketing_catalogs").select(CATALOG_SELECT);

  if (isUuid) {
    query = query.eq("id", ref);
  } else {
    query = query.eq("slug", ref);
  }

  query = query
    .eq("status", "published")
    .in("visibility", ["public", "dealer"]);

  const { data, error } = await query.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const productMap = await loadProductIdsByCatalog(supabase, [data.id]);
  const catalog = mapCatalog(data as CatalogRow, productMap.get(data.id) ?? []);

  if (catalog.visibility === "public") {
    return { access: "full", catalog };
  }

  const approved = await isApprovedDealerUser(supabase, userId);
  if (approved) {
    return { access: "full", catalog };
  }

  return {
    access: "locked",
    reason: "dealer",
    catalog: stripPdfForLock(catalog),
  };
}

export async function listPublicMarketingCatalogs(
  supabase: SupabaseClient,
  categoryId?: string | null,
): Promise<MarketingCatalogDto[]> {
  return fetchCatalogRows(supabase, { categoryId, storefront: true });
}

export async function getPublicMarketingCatalogById(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketingCatalogDto | null> {
  const { data, error } = await supabase
    .from("marketing_catalogs")
    .select(CATALOG_SELECT)
    .eq("id", id)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const productMap = await loadProductIdsByCatalog(supabase, [data.id]);
  return mapCatalog(data as CatalogRow, productMap.get(data.id) ?? []);
}

/** @deprecated use getPublicMarketingCatalogBySlug */
export async function getPublicMarketingCatalog(
  supabase: SupabaseClient,
  id: string,
): Promise<MarketingCatalogDto | null> {
  return getPublicMarketingCatalogById(supabase, id);
}

export async function getPublicMarketingCatalogBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<MarketingCatalogDto | null> {
  const { data, error } = await supabase
    .from("marketing_catalogs")
    .select(CATALOG_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("visibility", "public")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const productMap = await loadProductIdsByCatalog(supabase, [data.id]);
  return mapCatalog(data as CatalogRow, productMap.get(data.id) ?? []);
}

export async function getMarketingCatalogBySlugOrId(
  supabase: SupabaseClient,
  ref: string,
  options?: { includeUnpublished?: boolean; userId?: string | null },
): Promise<MarketingCatalogDto | null> {
  const result = await resolveMarketingCatalogAccess(
    supabase,
    ref,
    options?.userId,
  );
  if (!result) return null;
  if (result.access === "locked" && !options?.includeUnpublished) return null;
  return result.catalog;
}

export async function listRelatedMarketingCatalogs(
  supabase: SupabaseClient,
  catalog: MarketingCatalogDto,
  limit = 4,
  userId?: string | null,
): Promise<MarketingCatalogDto[]> {
  const all = await listPublicMarketingCatalogs(
    supabase,
    catalog.categoryId ?? undefined,
  );
  const approved =
    catalog.visibility === "dealer"
      ? await isApprovedDealerUser(supabase, userId)
      : true;

  return all
    .filter((item) => item.id !== catalog.id)
    .filter((item) => item.visibility === "public" || approved)
    .slice(0, limit);
}

export async function listProductsForMarketingCatalog(
  supabase: SupabaseClient,
  catalog: MarketingCatalogDto,
  limit = 8,
): Promise<{ products: ProductPublicDto[]; shopCategorySlug: string | null }> {
  const seen = new Set<string>();
  const products: ProductPublicDto[] = [];

  if (catalog.productIds.length) {
    const linked = await getPublicProductsByIds(supabase, catalog.productIds);
    for (const product of linked) {
      if (products.length >= limit) break;
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      products.push(product);
    }
  }

  const shopCategorySlug = await resolveShopCategorySlugForMarketingCategory(
    supabase,
    catalog.categoryId,
  );

  if (products.length < limit && shopCategorySlug) {
    const { data } = await listPublicProducts(supabase, {
      category: shopCategorySlug,
      pageSize: limit,
      sortBy: "created_at",
      sortDir: "desc",
    });

    for (const product of data) {
      if (products.length >= limit) break;
      if (seen.has(product.id)) continue;
      seen.add(product.id);
      products.push(product);
    }
  }

  return { products, shopCategorySlug };
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
    .select(CATALOG_SELECT)
    .in("id", catalogIds)
    .eq("status", "published")
    .eq("visibility", "public")
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
    .select("id, name, slug, sort_order, is_active")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug ?? null,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  }));
}

export async function listAdminMarketingCatalogs(
  supabase: SupabaseClient,
): Promise<MarketingCatalogDto[]> {
  return fetchCatalogRows(supabase);
}

export async function saveMarketingCatalogCategory(
  supabase: SupabaseClient,
  input: { id?: string; name: string; sortOrder?: number; isActive?: boolean },
): Promise<void> {
  const slug = slugifyCatalogTitle(input.name, input.id);
  const payload = {
    name: input.name.trim(),
    slug,
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

function inputToPayload(input: MarketingCatalogInput, catalogId?: string) {
  const visibility: CatalogVisibility =
    input.visibility ??
    (input.isPublic === false
      ? "private"
      : input.isPublic === true
        ? "public"
        : "public");

  const status: CatalogStatus =
    input.status ??
    (input.isActive === false
      ? "draft"
      : input.isActive === true
        ? "published"
        : "published");

  const slug =
    input.slug?.trim() ||
    slugifyCatalogTitle(input.title, catalogId ?? input.id);

  return {
    slug,
    category_id: input.categoryId ?? null,
    title: input.title.trim(),
    brand: input.brand?.trim() || null,
    description: input.description?.trim() || null,
    cover_image_url: input.coverImageUrl ?? null,
    pdf_url: input.pdfUrl ?? null,
    pdf_storage_path: input.pdfStoragePath ?? null,
    external_link: input.externalLink?.trim() || null,
    tags: input.tags ?? [],
    version: input.version?.trim() || null,
    page_count: input.pageCount ?? null,
    file_size: input.fileSize ?? null,
    visibility,
    allow_download: input.allowDownload ?? false,
    is_featured: input.isFeatured ?? false,
    status,
    sort_order: input.sortOrder ?? 0,
    is_public: visibility === "public" && status === "published",
    is_active: status === "published",
    updated_at: new Date().toISOString(),
  };
}

export async function saveMarketingCatalog(
  supabase: SupabaseClient,
  input: MarketingCatalogInput,
  createdBy?: string | null,
): Promise<string> {
  let catalogId = input.id;

  if (catalogId) {
    const payload = inputToPayload(input, catalogId);
    const { error } = await supabase
      .from("marketing_catalogs")
      .update(payload)
      .eq("id", catalogId);
    if (error) throw new Error(error.message);
  } else {
    const payload = inputToPayload(input);
    const { data, error } = await supabase
      .from("marketing_catalogs")
      .insert({ ...payload, created_by: createdBy ?? null })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    catalogId = data.id;

    if (!input.slug) {
      const slug = slugifyCatalogTitle(input.title, catalogId);
      await supabase
        .from("marketing_catalogs")
        .update({ slug, updated_at: new Date().toISOString() })
        .eq("id", catalogId);
    }
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

export async function recordMarketingCatalogView(
  supabase: SupabaseClient,
  input: {
    catalogId: string;
    userId?: string | null;
    pageNumber?: number;
    device: CatalogViewDevice;
  },
): Promise<void> {
  const { error } = await supabase.from("marketing_catalog_views").insert({
    catalog_id: input.catalogId,
    user_id: input.userId ?? null,
    page_number: input.pageNumber ?? null,
    device: input.device,
  });
  if (error) throw new Error(error.message);
}

export async function getMarketingCatalogViewStats(
  supabase: SupabaseClient,
  catalogIds: string[],
): Promise<CatalogViewStatsDto[]> {
  if (!catalogIds.length) return [];

  const { data, error } = await supabase
    .from("marketing_catalog_views")
    .select("catalog_id, created_at")
    .in("catalog_id", catalogIds);

  if (error) throw new Error(error.message);

  const now = Date.now();
  const day7 = now - 7 * 24 * 60 * 60 * 1000;
  const day30 = now - 30 * 24 * 60 * 60 * 1000;

  const statsMap = new Map<string, CatalogViewStatsDto>();
  for (const id of catalogIds) {
    statsMap.set(id, { catalogId: id, views7d: 0, views30d: 0, viewsAll: 0 });
  }

  for (const row of data ?? []) {
    const id = row.catalog_id as string;
    const entry = statsMap.get(id);
    if (!entry) continue;
    const created = new Date(row.created_at as string).getTime();
    entry.viewsAll += 1;
    if (created >= day30) entry.views30d += 1;
    if (created >= day7) entry.views7d += 1;
  }

  return Array.from(statsMap.values());
}

export { isPublishedPublic };
