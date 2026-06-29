import { buildDetailImagesFromHotspots } from "@/lib/inspiration-detail-images";
import type {
  InspirationHotspotDto,
  InspirationMaterialAdminDto,
  InspirationMaterialDto,
  InspirationMaterialType,
  InspirationRoomDto,
} from "@/types/api/inspiration";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function detectInspirationMaterialType(
  hotspot: InspirationHotspotDto,
): InspirationMaterialType {
  const slug = (hotspot.productSlug ?? "").toLowerCase();
  const label = (hotspot.label ?? "").toLowerCase();

  if (slug.includes("rail") || label.includes("ราง")) return "rail";
  if (
    slug.includes("roller") ||
    slug.includes("motorized") ||
    slug.includes("zebra") ||
    label.includes("มู่ลี่") ||
    label.includes("zebra")
  ) {
    return "blind";
  }

  const type = hotspot.configuratorProductType ?? "";
  if (
    type === "wave" ||
    type === "eyelet" ||
    type === "pleated" ||
    label.includes("wave") ||
    label.includes("eyelet") ||
    label.includes("จีบ")
  ) {
    return "style";
  }

  if (hotspot.fabricId || hotspot.fabricName) return "fabric";

  return "style";
}

function materialGroupKey(hotspot: InspirationHotspotDto): string {
  if (hotspot.fabricId) return `fabric:${hotspot.fabricId}`;
  if (hotspot.productSlug) return `product:${hotspot.productSlug}`;
  const label = (hotspot.label ?? "").trim().toLowerCase();
  if (label) return `label:${label}`;
  return `hotspot:${hotspot.id}`;
}

export function materialSlugForHotspot(hotspot: InspirationHotspotDto): string {
  if (hotspot.fabricId) return `fabric-${hotspot.fabricId}`;
  if (hotspot.productSlug) return `product-${slugify(hotspot.productSlug)}`;
  const label = (hotspot.label ?? hotspot.fabricName ?? "").trim();
  if (label) return `label-${slugify(label)}`;
  return `hotspot-${hotspot.id.slice(0, 8)}`;
}

function swatchForHotspot(hotspot: InspirationHotspotDto): {
  imageUrl: string;
  label: string;
  caption: string | null;
} {
  const images = buildDetailImagesFromHotspots({
    hotspots: [hotspot],
    detailImages: [],
  });
  const first = images[0];
  const label =
    hotspot.label ||
    hotspot.fabricName ||
    hotspot.productName ||
    first?.label ||
    "Material";
  return {
    imageUrl:
      first?.imageUrl ?? "/inspiration/details/detail-fabric-linen-beige.png",
    label,
    caption: first?.caption ?? null,
  };
}

type MaterialAccumulator = {
  slug: string;
  label: string;
  caption: string | null;
  imageUrl: string;
  materialType: InspirationMaterialType;
  fabricId: string | null;
  productSlug: string | null;
  productId: string | null;
  configuratorProductType: string | null;
  roomSlugs: Set<string>;
  hotspotIds: Set<string>;
};

function dbMaterialToDto(
  material: InspirationMaterialAdminDto,
): InspirationMaterialDto {
  return {
    id: material.id,
    slug: material.slug,
    label: material.title,
    caption: material.description,
    imageUrl: material.heroImageUrl,
    materialType: material.materialType,
    fabricId: material.fabricId,
    productSlug: material.productSlug,
    productId: material.productId,
    configuratorProductType: null,
    roomSlugs: material.roomLinks
      .map((link) => link.roomSlug)
      .filter((slug): slug is string => Boolean(slug)),
    roomCount: material.roomLinks.length,
    hotspotIds: material.roomLinks
      .map((link) => link.hotspotId)
      .filter((id): id is string => Boolean(id)),
    galleryUrls: material.galleryUrls,
    isDbManaged: true,
    sortOrder: material.sortOrder,
    isFeatured: material.isFeatured,
  };
}

export function buildInspirationMaterials(
  rooms: InspirationRoomDto[],
  dbMaterials: InspirationMaterialAdminDto[] = [],
): InspirationMaterialDto[] {
  const dbSlugs = new Set(dbMaterials.map((material) => material.slug));
  const aggregate = buildAggregateMaterials(rooms).filter(
    (material) => !dbSlugs.has(material.slug),
  );
  const fromDb = dbMaterials.map(dbMaterialToDto);

  return [...fromDb, ...aggregate].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }
    if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
      return (b.sortOrder ?? 0) - (a.sortOrder ?? 0);
    }
    if (b.roomCount !== a.roomCount) return b.roomCount - a.roomCount;
    return a.label.localeCompare(b.label, "th");
  });
}

function buildAggregateMaterials(
  rooms: InspirationRoomDto[],
): InspirationMaterialDto[] {
  const map = new Map<string, MaterialAccumulator>();

  for (const room of rooms) {
    for (const hotspot of room.hotspots) {
      const key = materialGroupKey(hotspot);
      const swatch = swatchForHotspot(hotspot);
      const existing = map.get(key);

      if (!existing) {
        map.set(key, {
          slug: materialSlugForHotspot(hotspot),
          label: swatch.label,
          caption: swatch.caption,
          imageUrl: swatch.imageUrl,
          materialType: detectInspirationMaterialType(hotspot),
          fabricId: hotspot.fabricId,
          productSlug: hotspot.productSlug,
          productId: hotspot.productId,
          configuratorProductType: hotspot.configuratorProductType,
          roomSlugs: new Set([room.slug]),
          hotspotIds: new Set([hotspot.id]),
        });
        continue;
      }

      existing.roomSlugs.add(room.slug);
      existing.hotspotIds.add(hotspot.id);
      if (!existing.fabricId && hotspot.fabricId) {
        existing.fabricId = hotspot.fabricId;
      }
      if (!existing.productSlug && hotspot.productSlug) {
        existing.productSlug = hotspot.productSlug;
      }
      if (!existing.productId && hotspot.productId) {
        existing.productId = hotspot.productId;
      }
      if (
        !existing.configuratorProductType &&
        hotspot.configuratorProductType
      ) {
        existing.configuratorProductType = hotspot.configuratorProductType;
      }
    }
  }

  return [...map.values()]
    .map((entry) => ({
      slug: entry.slug,
      label: entry.label,
      caption: entry.caption,
      imageUrl: entry.imageUrl,
      materialType: entry.materialType,
      fabricId: entry.fabricId,
      productSlug: entry.productSlug,
      productId: entry.productId,
      configuratorProductType: entry.configuratorProductType,
      roomSlugs: [...entry.roomSlugs],
      roomCount: entry.roomSlugs.size,
      hotspotIds: [...entry.hotspotIds],
    }))
    .sort(
      (a, b) =>
        b.roomCount - a.roomCount || a.label.localeCompare(b.label, "th"),
    );
}

export function findInspirationMaterialBySlug(
  materials: InspirationMaterialDto[],
  slug: string,
): InspirationMaterialDto | undefined {
  return materials.find((material) => material.slug === slug);
}

export function findSimilarInspirationMaterials(
  current: InspirationMaterialDto,
  allMaterials: InspirationMaterialDto[],
  limit = 6,
): InspirationMaterialDto[] {
  const scored = allMaterials
    .filter((material) => material.slug !== current.slug)
    .map((material) => {
      let score = 0;
      if (material.materialType === current.materialType) score += 4;
      if (
        current.fabricId &&
        material.fabricId &&
        current.fabricId === material.fabricId
      ) {
        score += 3;
      }
      if (
        current.configuratorProductType &&
        material.configuratorProductType === current.configuratorProductType
      ) {
        score += 2;
      }
      const sharedRooms = material.roomSlugs.filter((slug) =>
        current.roomSlugs.includes(slug),
      ).length;
      score += sharedRooms;
      return { material, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.material.roomCount - a.material.roomCount;
    });

  const picked = scored.slice(0, limit).map((entry) => entry.material);
  if (picked.length >= limit) return picked;

  const used = new Set([current.slug, ...picked.map((m) => m.slug)]);
  const fallback = allMaterials
    .filter((material) => !used.has(material.slug))
    .sort((a, b) => b.roomCount - a.roomCount);

  return [...picked, ...fallback].slice(0, limit);
}

export function buildMaterialSlugByHotspotId(
  room: InspirationRoomDto,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const hotspot of room.hotspots) {
    out[hotspot.id] = materialSlugForHotspot(hotspot);
  }
  return out;
}
