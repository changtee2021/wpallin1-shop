import { buildDetailImagesFromHotspots } from "@/lib/inspiration-detail-images";
import type { TranslationKey } from "@/i18n/types";
import type {
  InspirationDetailImageDto,
  InspirationMaterialDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

export type MaterialSpecRow = {
  labelKey: TranslationKey;
  valueKey: TranslationKey;
};

const CONFIGURATOR_STYLE_KEYS: Record<string, TranslationKey> = {
  pleated: "inspiration.material.viewer.specs.style.pleated",
  wave: "inspiration.material.viewer.specs.style.wave",
  eyelet: "inspiration.material.viewer.specs.style.eyelet",
};

export function buildMaterialGalleryImages(
  material: InspirationMaterialDto,
  rooms: InspirationRoomDto[],
): InspirationDetailImageDto[] {
  const hotspotSet = new Set(material.hotspotIds);
  const seen = new Set<string>();
  const images: InspirationDetailImageDto[] = [];

  const pushImage = (image: InspirationDetailImageDto) => {
    if (seen.has(image.imageUrl)) return;
    seen.add(image.imageUrl);
    images.push(image);
  };

  pushImage({
    id: `${material.slug}-hero`,
    imageUrl: material.imageUrl,
    label: material.label,
    caption: material.caption,
  });

  for (const room of rooms) {
    if (!material.roomSlugs.includes(room.slug)) continue;

    const roomImages = buildDetailImagesFromHotspots(room);
    for (const image of roomImages) {
      if (image.hotspotId && hotspotSet.has(image.hotspotId)) {
        pushImage(image);
      }
    }
  }

  return images.slice(0, 6);
}

export function buildMaterialSpecRows(
  material: InspirationMaterialDto,
): MaterialSpecRow[] {
  const rows: MaterialSpecRow[] = [
    {
      labelKey: "inspiration.material.viewer.specs.type",
      valueKey: `inspiration.materials.type.${material.materialType}`,
    },
  ];

  if (material.configuratorProductType) {
    const styleKey =
      CONFIGURATOR_STYLE_KEYS[material.configuratorProductType] ??
      "inspiration.material.viewer.specs.style.custom";
    rows.push({
      labelKey: "inspiration.material.viewer.specs.style",
      valueKey: styleKey,
    });
  }

  rows.push({
    labelKey: "inspiration.material.viewer.specs.use",
    valueKey: `inspiration.material.viewer.specs.use.${material.materialType}`,
  });

  if (material.fabricId) {
    rows.push({
      labelKey: "inspiration.material.viewer.specs.fabric",
      valueKey: "inspiration.material.viewer.specs.fabric.custom",
    });
  }

  return rows;
}
