import type { SupabaseClient } from "@supabase/supabase-js";

import { slugifyCatalogTitle } from "@/lib/catalog-slug";
import { buildInspirationMaterials } from "@/lib/inspiration-materials";
import type { FabricPublicDto } from "@/lib/inspiration-material-profiles";
import { listAdminInspirationRooms } from "@/services/inspiration.service";
import type {
  InspirationMaterialAdminDto,
  InspirationMaterialInput,
  InspirationMaterialRoomLink,
  InspirationMaterialStatus,
  InspirationMaterialType,
  InspirationRoomDto,
} from "@/types/api/inspiration";

type MaterialRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  material_type: InspirationMaterialType;
  fabric_id: string | null;
  product_id: string | null;
  hero_image_url: string;
  gallery_urls: unknown;
  profile_overrides: unknown;
  sort_order: number;
  is_featured: boolean;
  status: InspirationMaterialStatus;
  created_at: string;
  updated_at: string;
};

type MaterialRoomRow = {
  material_id: string;
  room_id: string;
  hotspot_id: string | null;
};

const MATERIAL_SELECT =
  "id, slug, title, description, material_type, fabric_id, product_id, hero_image_url, gallery_urls, profile_overrides, sort_order, is_featured, status, created_at, updated_at";

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

function parseProfileOverrides(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as Record<string, unknown>;
}

async function loadRoomLinksForMaterials(
  supabase: SupabaseClient,
  materialIds: string[],
): Promise<Map<string, InspirationMaterialRoomLink[]>> {
  if (!materialIds.length) return new Map();

  const { data: links, error } = await supabase
    .from("inspiration_material_rooms")
    .select("material_id, room_id, hotspot_id")
    .in("material_id", materialIds);

  if (error) throw new Error(error.message);

  const roomIds = [
    ...new Set((links ?? []).map((row) => (row as MaterialRoomRow).room_id)),
  ];

  const { data: rooms } = roomIds.length
    ? await supabase
        .from("inspiration_rooms")
        .select("id, slug, title")
        .in("id", roomIds)
    : { data: [] };

  const roomMap = new Map(
    (rooms ?? []).map((room) => [
      room.id as string,
      { slug: room.slug as string, title: room.title as string },
    ]),
  );

  const byMaterial = new Map<string, InspirationMaterialRoomLink[]>();
  for (const row of links ?? []) {
    const link = row as MaterialRoomRow;
    const room = roomMap.get(link.room_id);
    const dto: InspirationMaterialRoomLink = {
      roomId: link.room_id,
      roomSlug: room?.slug,
      roomTitle: room?.title,
      hotspotId: link.hotspot_id,
    };
    const list = byMaterial.get(link.material_id) ?? [];
    list.push(dto);
    byMaterial.set(link.material_id, list);
  }
  return byMaterial;
}

async function loadProductSlugs(
  supabase: SupabaseClient,
  productIds: string[],
): Promise<Map<string, string>> {
  if (!productIds.length) return new Map();
  const { data } = await supabase
    .from("products")
    .select("id, slug")
    .in("id", productIds);
  return new Map((data ?? []).map((p) => [p.id as string, p.slug as string]));
}

async function mapMaterialRow(
  supabase: SupabaseClient,
  row: MaterialRow,
  roomLinks: InspirationMaterialRoomLink[],
  productSlug: string | null,
): Promise<InspirationMaterialAdminDto> {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    materialType: row.material_type,
    fabricId: row.fabric_id,
    productId: row.product_id,
    productSlug,
    heroImageUrl: row.hero_image_url,
    galleryUrls: parseStringArray(row.gallery_urls),
    profileOverrides: parseProfileOverrides(row.profile_overrides),
    sortOrder: row.sort_order,
    isFeatured: row.is_featured,
    status: row.status,
    roomLinks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function mapMaterialRows(
  supabase: SupabaseClient,
  rows: MaterialRow[],
): Promise<InspirationMaterialAdminDto[]> {
  const materialIds = rows.map((row) => row.id);
  const productIds = [
    ...new Set(rows.map((row) => row.product_id).filter(Boolean) as string[]),
  ];
  const [linkMap, productSlugMap] = await Promise.all([
    loadRoomLinksForMaterials(supabase, materialIds),
    loadProductSlugs(supabase, productIds),
  ]);

  return Promise.all(
    rows.map((row) =>
      mapMaterialRow(
        supabase,
        row,
        linkMap.get(row.id) ?? [],
        row.product_id ? (productSlugMap.get(row.product_id) ?? null) : null,
      ),
    ),
  );
}

export async function listAdminMaterials(
  supabase: SupabaseClient,
): Promise<InspirationMaterialAdminDto[]> {
  const { data, error } = await supabase
    .from("inspiration_materials")
    .select(MATERIAL_SELECT)
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const rows = (data ?? []) as MaterialRow[];
  if (!rows.length) {
    const rooms = await listAdminInspirationRooms(supabase);
    if (rooms.length) {
      await seedMaterialsFromAggregate(supabase, rooms);
      const { data: seeded, error: seedError } = await supabase
        .from("inspiration_materials")
        .select(MATERIAL_SELECT)
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (seedError) throw new Error(seedError.message);
      return mapMaterialRows(supabase, (seeded ?? []) as MaterialRow[]);
    }
  }
  return mapMaterialRows(supabase, rows);
}

export async function getAdminMaterialById(
  supabase: SupabaseClient,
  id: string,
): Promise<InspirationMaterialAdminDto | null> {
  const { data, error } = await supabase
    .from("inspiration_materials")
    .select(MATERIAL_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const row = data as MaterialRow;
  const [linkMap, productSlugMap] = await Promise.all([
    loadRoomLinksForMaterials(supabase, [row.id]),
    loadProductSlugs(supabase, row.product_id ? [row.product_id] : []),
  ]);

  return mapMaterialRow(
    supabase,
    row,
    linkMap.get(row.id) ?? [],
    row.product_id ? (productSlugMap.get(row.product_id) ?? null) : null,
  );
}

export async function getPublicMaterials(
  supabase: SupabaseClient,
): Promise<InspirationMaterialAdminDto[]> {
  const { data, error } = await supabase
    .from("inspiration_materials")
    .select(MATERIAL_SELECT)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("sort_order")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return mapMaterialRows(supabase, (data ?? []) as MaterialRow[]);
}

export async function saveAdminMaterial(
  supabase: SupabaseClient,
  input: InspirationMaterialInput,
): Promise<InspirationMaterialAdminDto> {
  const slug =
    input.slug.trim() ||
    slugifyCatalogTitle(input.title) ||
    `material-${Date.now()}`;

  const payload = {
    slug,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    material_type: input.materialType,
    fabric_id: input.fabricId || null,
    product_id: input.productId || null,
    hero_image_url: input.heroImageUrl.trim(),
    gallery_urls: input.galleryUrls ?? [],
    profile_overrides: input.profileOverrides ?? {},
    sort_order: input.sortOrder ?? 0,
    is_featured: input.isFeatured ?? false,
    status: input.status ?? "draft",
  };

  let materialId = input.id;

  if (materialId) {
    const { error } = await supabase
      .from("inspiration_materials")
      .update(payload)
      .eq("id", materialId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await supabase
      .from("inspiration_materials")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    materialId = data.id;
  }

  if (input.roomLinks) {
    const { error: deleteError } = await supabase
      .from("inspiration_material_rooms")
      .delete()
      .eq("material_id", materialId);
    if (deleteError) throw new Error(deleteError.message);

    if (input.roomLinks.length) {
      const { error: insertError } = await supabase
        .from("inspiration_material_rooms")
        .insert(
          input.roomLinks.map((link) => ({
            material_id: materialId,
            room_id: link.roomId,
            hotspot_id: link.hotspotId ?? null,
          })),
        );
      if (insertError) throw new Error(insertError.message);
    }
  }

  const saved = await getAdminMaterialById(supabase, materialId);
  if (!saved) throw new Error("Material not found after save");
  return saved;
}

export async function deleteAdminMaterial(
  supabase: SupabaseClient,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("inspiration_materials")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function seedMaterialsFromAggregate(
  supabase: SupabaseClient,
  rooms: InspirationRoomDto[],
): Promise<{ created: number }> {
  const aggregate = buildInspirationMaterials(rooms);
  if (!aggregate.length) return { created: 0 };

  const { data: existing } = await supabase
    .from("inspiration_materials")
    .select("slug");
  const existingSlugs = new Set(
    (existing ?? []).map((row) => row.slug as string),
  );

  const roomIdBySlug = new Map(rooms.map((room) => [room.slug, room.id]));
  let created = 0;

  for (const material of aggregate) {
    if (existingSlugs.has(material.slug)) continue;

    const roomLinks = material.roomSlugs
      .map((slug) => {
        const roomId = roomIdBySlug.get(slug);
        return roomId ? { roomId, hotspotId: null } : null;
      })
      .filter((link): link is { roomId: string; hotspotId: null } =>
        Boolean(link),
      );

    await saveAdminMaterial(supabase, {
      slug: material.slug,
      title: material.label,
      description: material.caption,
      materialType: material.materialType,
      fabricId: material.fabricId,
      productId: material.productId,
      heroImageUrl: material.imageUrl,
      galleryUrls: [],
      sortOrder: material.roomCount,
      isFeatured: false,
      status: "published",
      roomLinks,
    });
    created += 1;
    existingSlugs.add(material.slug);
  }

  return { created };
}

export async function getPublicFabricById(
  supabase: SupabaseClient,
  fabricId: string,
): Promise<FabricPublicDto | null> {
  const { data: fabric, error } = await supabase
    .from("fabrics")
    .select(
      "id, code, name, collection_id, color_id, roll_width_cm, swatch_url",
    )
    .eq("id", fabricId)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !fabric) return null;

  const [{ data: collection }, { data: color }] = await Promise.all([
    fabric.collection_id
      ? supabase
          .from("fabric_collections")
          .select("name")
          .eq("id", fabric.collection_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    fabric.color_id
      ? supabase
          .from("colors")
          .select("name")
          .eq("id", fabric.color_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: fabric.id,
    code: fabric.code,
    name: fabric.name,
    collectionName: collection?.name ?? null,
    colorName: color?.name ?? null,
    rollWidthCm: Number(fabric.roll_width_cm),
    swatchUrl: fabric.swatch_url,
  };
}
