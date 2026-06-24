import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { optionalSupabaseAuth, requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  deleteMarketingCatalog,
  deleteMarketingCatalogCategory,
  getMarketingCatalogViewStats,
  getPublicMarketingCatalogById,
  getPublicMarketingCatalogBySlug,
  listAdminMarketingCatalogCategories,
  listAdminMarketingCatalogs,
  listMarketingCatalogsForProduct,
  listPublicMarketingCatalogs,
  listRelatedMarketingCatalogs,
  recordMarketingCatalogView,
  resolveMarketingCatalogAccess,
  saveMarketingCatalog,
  saveMarketingCatalogCategory,
} from "@/services/marketing-catalog.service";

export const fetchPublicMarketingCatalogs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        categoryId: z.string().uuid().nullable().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listPublicMarketingCatalogs(supabase, data.categoryId);
  });

export const fetchPublicMarketingCatalog = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getPublicMarketingCatalogById(supabase, data.id);
  });

export const fetchPublicMarketingCatalogBySlug = createServerFn({
  method: "GET",
})
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getPublicMarketingCatalogBySlug(supabase, data.slug);
  });

export const fetchMarketingCatalogAccess = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ref: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return resolveMarketingCatalogAccess(
      supabase,
      data.ref,
      context.userId ?? null,
    );
  });

/** @deprecated use fetchMarketingCatalogAccess */
export const fetchMarketingCatalogRef = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ref: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const result = await resolveMarketingCatalogAccess(
      supabase,
      data.ref,
      context.userId ?? null,
    );
    if (!result) return null;
    return result.catalog;
  });

export const fetchRelatedMarketingCatalogs = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        catalogId: z.string().uuid(),
        limit: z.number().int().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const access = await resolveMarketingCatalogAccess(
      supabase,
      data.catalogId,
      context.userId ?? null,
    );
    if (!access) return [];
    return listRelatedMarketingCatalogs(
      supabase,
      access.catalog,
      data.limit ?? 4,
      context.userId ?? null,
    );
  });

export const fetchProductMarketingCatalogs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listMarketingCatalogsForProduct(supabase, data.productId);
  });

export const recordCatalogView = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        catalogId: z.string().uuid(),
        pageNumber: z.number().int().positive().optional(),
        device: z.enum(["mobile", "desktop", "tablet"]),
        userId: z.string().uuid().nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    await recordMarketingCatalogView(supabase, data);
    return { ok: true };
  });

export const fetchAdminMarketingCatalogCategories = createServerFn({
  method: "GET",
})
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminMarketingCatalogCategories(supabase);
  });

export const fetchAdminMarketingCatalogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminMarketingCatalogs(supabase);
  });

export const fetchAdminCatalogViewStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ catalogIds: z.array(z.string().uuid()) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getMarketingCatalogViewStats(supabase, data.catalogIds);
  });

export const saveAdminMarketingCatalogCategory = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().min(1),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await saveMarketingCatalogCategory(supabase, data);
    return { ok: true };
  });

export const deleteAdminMarketingCatalogCategory = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await deleteMarketingCatalogCategory(supabase, data.id);
    return { ok: true };
  });

const catalogInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  pdfStoragePath: z.string().nullable().optional(),
  externalLink: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  version: z.string().nullable().optional(),
  pageCount: z.number().int().nullable().optional(),
  fileSize: z.number().int().nullable().optional(),
  visibility: z.enum(["public", "dealer", "private"]).optional(),
  allowDownload: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  sortOrder: z.number().int().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
  productIds: z.array(z.string().uuid()).optional(),
});

export const saveAdminMarketingCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => catalogInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const id = await saveMarketingCatalog(supabase, data, context.userId);
    return { ok: true, id };
  });

export const deleteAdminMarketingCatalog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await deleteMarketingCatalog(supabase, data.id);
    return { ok: true };
  });
