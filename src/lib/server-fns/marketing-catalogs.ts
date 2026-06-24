import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  deleteMarketingCatalog,
  deleteMarketingCatalogCategory,
  getPublicMarketingCatalog,
  listAdminMarketingCatalogCategories,
  listAdminMarketingCatalogs,
  listMarketingCatalogsForProduct,
  listPublicMarketingCatalogs,
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
    return getPublicMarketingCatalog(supabase, data.id);
  });

export const fetchProductMarketingCatalogs = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listMarketingCatalogsForProduct(supabase, data.productId);
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
  categoryId: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  brand: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  pdfUrl: z.string().nullable().optional(),
  externalLink: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
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
