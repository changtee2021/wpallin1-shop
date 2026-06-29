import type { SupabaseClient } from "@supabase/supabase-js";

import { slugifyCatalogTitle } from "@/lib/catalog-slug";
import { buildDetailImagesFromHotspots } from "@/lib/inspiration-detail-images";
import type {
  InspirationDetailImageDto,
  InspirationHotspotDto,
  InspirationRoomDto,
  InspirationRoomInput,
  InspirationRoomStatus,
} from "@/types/api/inspiration";

type RoomRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  room_type: string | null;
  style_tags: string[] | null;
  mood_tags: string[] | null;
  sort_order: number;
  is_featured: boolean;
  status: InspirationRoomStatus;
  view_count: number;
  like_count: number;
  detail_images: unknown;
  created_at: string;
  updated_at: string;
};

type HotspotRow = {
  id: string;
  room_id: string;
  label: string | null;
  product_id: string | null;
  fabric_id: string | null;
  configurator_product_type: string | null;
  pos_x: number;
  pos_y: number;
  sort_order: number;
};

const ROOM_SELECT =
  "id, slug, title, description, image_url, room_type, style_tags, mood_tags, sort_order, is_featured, status, view_count, like_count, detail_images, created_at, updated_at";

function parseDetailImages(raw: unknown): InspirationDetailImageDto[] {
  if (!Array.isArray(raw)) return [];
  const out: InspirationDetailImageDto[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const imageUrl = row.imageUrl ?? row.image_url;
    const label = row.label;
    if (typeof imageUrl !== "string" || typeof label !== "string") continue;
    out.push({
      id: typeof row.id === "string" ? row.id : crypto.randomUUID(),
      imageUrl,
      label,
      caption:
        typeof row.caption === "string"
          ? row.caption
          : row.caption === null
            ? null
            : undefined,
      hotspotId:
        typeof row.hotspotId === "string"
          ? row.hotspotId
          : typeof row.hotspot_id === "string"
            ? row.hotspot_id
            : null,
    });
  }
  return out;
}

async function loadHotspotsForRooms(
  supabase: SupabaseClient,
  roomIds: string[],
): Promise<Map<string, InspirationHotspotDto[]>> {
  if (!roomIds.length) return new Map();

  const { data: hotspots, error } = await supabase
    .from("inspiration_hotspots")
    .select(
      "id, room_id, label, product_id, fabric_id, configurator_product_type, pos_x, pos_y, sort_order",
    )
    .in("room_id", roomIds)
    .order("sort_order");

  if (error) throw new Error(error.message);

  const productIds = [
    ...new Set(
      (hotspots ?? [])
        .map((h) => (h as HotspotRow).product_id)
        .filter(Boolean) as string[],
    ),
  ];
  const fabricIds = [
    ...new Set(
      (hotspots ?? [])
        .map((h) => (h as HotspotRow).fabric_id)
        .filter(Boolean) as string[],
    ),
  ];

  const [{ data: products }, { data: fabrics }] = await Promise.all([
    productIds.length
      ? supabase
          .from("products_public")
          .select("id, slug, name, product_type, image_url")
          .in("id", productIds)
      : Promise.resolve({ data: [] }),
    fabricIds.length
      ? supabase.from("fabrics").select("id, name").in("id", fabricIds)
      : Promise.resolve({ data: [] }),
  ]);

  const productMap = new Map(
    (products ?? []).map((p) => [
      p.id,
      {
        slug: p.slug,
        name: p.name,
        productType: p.product_type as InspirationHotspotDto["productType"],
        imageUrl: (p as { image_url?: string | null }).image_url ?? null,
      },
    ]),
  );
  const fabricMap = new Map((fabrics ?? []).map((f) => [f.id, f.name]));

  const byRoom = new Map<string, InspirationHotspotDto[]>();
  for (const row of hotspots ?? []) {
    const h = row as HotspotRow;
    const product = h.product_id ? productMap.get(h.product_id) : null;
    const dto: InspirationHotspotDto = {
      id: h.id,
      label: h.label,
      productId: h.product_id,
      productSlug: product?.slug ?? null,
      productName: product?.name ?? null,
      productImageUrl: product?.imageUrl ?? null,
      productType: product?.productType ?? null,
      fabricId: h.fabric_id,
      fabricName: h.fabric_id ? (fabricMap.get(h.fabric_id) ?? null) : null,
      configuratorProductType: h.configurator_product_type,
      posX: Number(h.pos_x),
      posY: Number(h.pos_y),
      sortOrder: h.sort_order,
    };
    const list = byRoom.get(h.room_id) ?? [];
    list.push(dto);
    byRoom.set(h.room_id, list);
  }
  return byRoom;
}

function mapRoom(
  row: RoomRow,
  hotspots: InspirationHotspotDto[],
): InspirationRoomDto {
  const storedDetails = parseDetailImages(row.detail_images);
  const detailImages =
    storedDetails.length > 0
      ? storedDetails
      : buildDetailImagesFromHotspots({ hotspots, detailImages: [] });

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    roomType: row.room_type,
    styleTags: row.style_tags ?? [],
    moodTags: row.mood_tags ?? [],
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    status: row.status,
    viewCount: Number(row.view_count ?? 0),
    likeCount: Number(row.like_count ?? 0),
    detailImages,
    hotspots,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPublicInspirationRooms(
  supabase: SupabaseClient,
): Promise<InspirationRoomDto[]> {
  const { data, error } = await supabase
    .from("inspiration_rooms")
    .select(ROOM_SELECT)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as RoomRow[];
  const hotspotMap = await loadHotspotsForRooms(
    supabase,
    rows.map((r) => r.id),
  );
  return rows.map((row) => mapRoom(row, hotspotMap.get(row.id) ?? []));
}

export async function getPublicInspirationRoomBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<InspirationRoomDto | null> {
  const { data, error } = await supabase
    .from("inspiration_rooms")
    .select(ROOM_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as RoomRow;
  const hotspotMap = await loadHotspotsForRooms(supabase, [row.id]);
  return mapRoom(row, hotspotMap.get(row.id) ?? []);
}

export async function listAdminInspirationRooms(
  supabase: SupabaseClient,
): Promise<InspirationRoomDto[]> {
  const { data, error } = await supabase
    .from("inspiration_rooms")
    .select(ROOM_SELECT)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as RoomRow[];
  const hotspotMap = await loadHotspotsForRooms(
    supabase,
    rows.map((r) => r.id),
  );
  return rows.map((row) => mapRoom(row, hotspotMap.get(row.id) ?? []));
}

export async function saveInspirationRoom(
  supabase: SupabaseClient,
  input: InspirationRoomInput,
): Promise<InspirationRoomDto> {
  const slug =
    input.slug.trim() ||
    slugifyCatalogTitle(input.title) ||
    `room-${Date.now()}`;

  const roomPayload = {
    slug,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    image_url: input.imageUrl.trim(),
    room_type: input.roomType?.trim() || null,
    style_tags: input.styleTags ?? [],
    mood_tags: input.moodTags ?? [],
    sort_order: input.sortOrder ?? 0,
    is_featured: input.isFeatured ?? false,
    status: input.status ?? "published",
    detail_images: (input.detailImages ?? []).map((detail) => ({
      id: detail.id,
      imageUrl: detail.imageUrl,
      label: detail.label,
      caption: detail.caption ?? null,
      hotspotId: detail.hotspotId ?? null,
    })),
  };

  let roomId = input.id;

  if (roomId) {
    const { error } = await supabase
      .from("inspiration_rooms")
      .update(roomPayload)
      .eq("id", roomId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("inspiration_rooms")
      .insert(roomPayload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    roomId = data.id;
  }

  if (input.hotspots) {
    const { data: existingHotspots, error: existingError } = await supabase
      .from("inspiration_hotspots")
      .select("id")
      .eq("room_id", roomId);
    if (existingError) throw new Error(existingError.message);

    const existingIds = new Set(
      (existingHotspots ?? []).map((row) => row.id as string),
    );
    const keptIds = new Set(
      input.hotspots
        .map((hotspot) => hotspot.id)
        .filter((id): id is string => Boolean(id)),
    );

    const removedIds = [...existingIds].filter((id) => !keptIds.has(id));
    if (removedIds.length) {
      const { error: deleteError } = await supabase
        .from("inspiration_hotspots")
        .delete()
        .in("id", removedIds);
      if (deleteError) throw new Error(deleteError.message);
    }

    for (const [index, hotspot] of input.hotspots.entries()) {
      const payload = {
        room_id: roomId,
        label: hotspot.label?.trim() || null,
        product_id: hotspot.productId || null,
        fabric_id: hotspot.fabricId || null,
        configurator_product_type: hotspot.configuratorProductType || null,
        pos_x: hotspot.posX,
        pos_y: hotspot.posY,
        sort_order: hotspot.sortOrder ?? index,
      };

      if (hotspot.id && existingIds.has(hotspot.id)) {
        const { error: updateError } = await supabase
          .from("inspiration_hotspots")
          .update(payload)
          .eq("id", hotspot.id);
        if (updateError) throw new Error(updateError.message);
        continue;
      }

      const insertPayload = hotspot.id
        ? { id: hotspot.id, ...payload }
        : payload;
      const { error: insertError } = await supabase
        .from("inspiration_hotspots")
        .insert(insertPayload);
      if (insertError) throw new Error(insertError.message);
    }
  }

  const { data: saved, error: readError } = await supabase
    .from("inspiration_rooms")
    .select(ROOM_SELECT)
    .eq("id", roomId)
    .single();
  if (readError) throw new Error(readError.message);
  const hotspotMap = await loadHotspotsForRooms(supabase, [roomId]);
  return mapRoom(saved as RoomRow, hotspotMap.get(roomId) ?? []);
}

export async function getAdminInspirationRoomById(
  supabase: SupabaseClient,
  id: string,
): Promise<InspirationRoomDto | null> {
  const { data, error } = await supabase
    .from("inspiration_rooms")
    .select(ROOM_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  const row = data as RoomRow;
  const hotspotMap = await loadHotspotsForRooms(supabase, [row.id]);
  return mapRoom(row, hotspotMap.get(row.id) ?? []);
}

export async function duplicateInspirationRoom(
  supabase: SupabaseClient,
  id: string,
): Promise<InspirationRoomDto> {
  const source = await getAdminInspirationRoomById(supabase, id);
  if (!source) throw new Error("Room not found");

  let slug = `${source.slug}-copy`;
  const { data: existing } = await supabase
    .from("inspiration_rooms")
    .select("slug")
    .like("slug", `${slug}%`);
  if ((existing ?? []).some((row) => row.slug === slug)) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  return saveInspirationRoom(supabase, {
    slug,
    title: `${source.title} (สำเนา)`,
    description: source.description,
    imageUrl: source.imageUrl,
    roomType: source.roomType,
    styleTags: source.styleTags,
    moodTags: source.moodTags,
    sortOrder: source.sortOrder + 1,
    isFeatured: false,
    status: "draft",
    detailImages: source.detailImages,
    hotspots: source.hotspots.map((hotspot, index) => ({
      label: hotspot.label,
      productId: hotspot.productId,
      fabricId: hotspot.fabricId,
      configuratorProductType: hotspot.configuratorProductType,
      posX: hotspot.posX,
      posY: hotspot.posY,
      sortOrder: index,
    })),
  });
}

export async function reorderInspirationRooms(
  supabase: SupabaseClient,
  orders: Array<{ id: string; sortOrder: number }>,
): Promise<void> {
  const results = await Promise.all(
    orders.map(({ id, sortOrder }) =>
      supabase
        .from("inspiration_rooms")
        .update({ sort_order: sortOrder })
        .eq("id", id),
    ),
  );
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
}

export async function deleteInspirationRoom(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("inspiration_rooms")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}
