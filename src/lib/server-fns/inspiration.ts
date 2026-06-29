import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAdminClient } from "@/lib/server-fns/_shared";
import { requireAdmin } from "@/lib/server-auth";
import {
  deleteInspirationRoom,
  duplicateInspirationRoom,
  getAdminInspirationRoomById,
  getPublicInspirationRoomBySlug,
  listAdminInspirationRooms,
  listPublicInspirationRooms,
  reorderInspirationRooms,
  saveInspirationRoom,
} from "@/services/inspiration.service";

const hotspotInputSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().nullable().optional(),
  productId: z.string().uuid().nullable().optional(),
  fabricId: z.string().uuid().nullable().optional(),
  configuratorProductType: z.string().nullable().optional(),
  posX: z.number().min(0).max(100),
  posY: z.number().min(0).max(100),
  sortOrder: z.number().int().optional(),
});

const detailImageInputSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().url(),
  label: z.string().min(1),
  caption: z.string().nullable().optional(),
  hotspotId: z.string().nullable().optional(),
});

const roomInputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url(),
  roomType: z.string().nullable().optional(),
  styleTags: z.array(z.string()).optional(),
  moodTags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  detailImages: z.array(detailImageInputSchema).optional(),
  hotspots: z.array(hotspotInputSchema).optional(),
});

export const fetchPublicInspirationRooms = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = await getAdminClient();
  return listPublicInspirationRooms(supabase);
});

export const fetchPublicInspirationRoomBySlug = createServerFn({
  method: "GET",
})
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getPublicInspirationRoomBySlug(supabase, data.slug);
  });

export const fetchAdminInspirationRooms = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const supabase = await getAdminClient();
    return listAdminInspirationRooms(supabase);
  });

export const fetchAdminInspirationRoomById = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getAdminInspirationRoomById(supabase, data.id);
  });

export const saveAdminInspirationRoom = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) => roomInputSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return saveInspirationRoom(supabase, data);
  });

export const deleteAdminInspirationRoom = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    await deleteInspirationRoom(supabase, data.id);
    return { ok: true as const };
  });

export const duplicateAdminInspirationRoom = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return duplicateInspirationRoom(supabase, data.id);
  });

export const reorderAdminInspirationRooms = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z
      .object({
        orders: z.array(
          z.object({
            id: z.string().uuid(),
            sortOrder: z.number().int().min(0),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    await reorderInspirationRooms(supabase, data.orders);
    return { ok: true as const };
  });

export const incrementInspirationViewFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ roomId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const { incrementInspirationView } =
      await import("@/services/inspiration-engagement.service");
    const viewCount = await incrementInspirationView(supabase, data.roomId);
    return { viewCount };
  });

export const toggleInspirationRoomLikeFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        roomId: z.string().uuid(),
        visitorId: z.string().min(8).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const { toggleInspirationRoomLike } =
      await import("@/services/inspiration-engagement.service");
    return toggleInspirationRoomLike(supabase, data.roomId, data.visitorId);
  });
