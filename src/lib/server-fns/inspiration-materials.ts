import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAdminClient } from "@/lib/server-fns/_shared";
import { requireAdmin } from "@/lib/server-auth";
import {
  deleteAdminMaterial,
  getAdminMaterialById,
  getPublicMaterials,
  listAdminMaterials,
  saveAdminMaterial,
  seedMaterialsFromAggregate,
} from "@/services/inspiration-material.service";
import { listAdminInspirationRooms } from "@/services/inspiration.service";

const materialInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  materialType: z.enum(["fabric", "style", "rail", "blind"]),
  fabricId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
  heroImageUrl: z.string().url(),
  galleryUrls: z.array(z.string().url()).optional(),
  profileOverrides: z.record(z.unknown()).optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  roomLinks: z
    .array(
      z.object({
        roomId: z.string().uuid(),
        hotspotId: z.string().uuid().nullable().optional(),
      }),
    )
    .optional(),
});

export const fetchPublicInspirationMaterials = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = await getAdminClient();
  return getPublicMaterials(supabase);
});

export const fetchAdminInspirationMaterials = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const supabase = await getAdminClient();
    return listAdminMaterials(supabase);
  });

export const fetchAdminInspirationMaterialById = createServerFn({
  method: "GET",
})
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getAdminMaterialById(supabase, data.id);
  });

export const saveAdminInspirationMaterial = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => materialInputSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return saveAdminMaterial(supabase, data);
  });

export const deleteAdminInspirationMaterial = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    await deleteAdminMaterial(supabase, data.id);
    return { ok: true as const };
  });

export const seedAdminInspirationMaterials = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .handler(async () => {
    const supabase = await getAdminClient();
    const rooms = await listAdminInspirationRooms(supabase);
    return seedMaterialsFromAggregate(supabase, rooms);
  });
