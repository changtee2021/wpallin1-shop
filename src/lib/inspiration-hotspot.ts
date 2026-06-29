import { buildDetailImagesFromHotspots } from "@/lib/inspiration-detail-images";
import type { InspirationHotspotDto } from "@/types/api/inspiration";

export type InspirationHotspotKind = "ready" | "custom";

export function getHotspotProductImageUrl(
  hotspot: InspirationHotspotDto,
): string | null {
  if (hotspot.productImageUrl) return hotspot.productImageUrl;

  const images = buildDetailImagesFromHotspots({
    hotspots: [hotspot],
    detailImages: [],
  });
  return images[0]?.imageUrl ?? null;
}

export function getInspirationHotspotKind(
  hotspot: InspirationHotspotDto,
): InspirationHotspotKind {
  if (hotspot.productType === "custom") return "custom";

  if (hotspot.productSlug || hotspot.productId) {
    return "ready";
  }

  if (hotspot.fabricId || hotspot.configuratorProductType) {
    return "custom";
  }

  return "custom";
}
