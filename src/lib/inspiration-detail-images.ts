import type {
  InspirationDetailImageDto,
  InspirationHotspotDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

/** Shared material detail assets in /public/inspiration/details */
export const INSPIRATION_DETAIL_ASSETS = {
  fabricLinenTeal: {
    imageUrl: "/inspiration/details/detail-fabric-linen-teal.png",
    label: "เนื้อผ้า Linen เขียวมิ้นท์",
    caption: "ทอละเอียด สัมผัสนุ่ม ระบายอากาศดี",
  },
  fabricLinenBeige: {
    imageUrl: "/inspiration/details/detail-fabric-linen-beige.png",
    label: "เนื้อผ้า Linen เบจ",
    caption: "โทนอบอุ่น เหมาะห้องนั่งเล่น",
  },
  fabricBlackout: {
    imageUrl: "/inspiration/details/detail-fabric-blackout.png",
    label: "ผ้า Blackout 3 ชั้น",
    caption: "กันแสงและ UV ได้ดี",
  },
  fabricSheer: {
    imageUrl: "/inspiration/details/detail-fabric-sheer.png",
    label: "ผ้า Sheer โปร่งแสง",
    caption: "กรองแสงนุ่ม ให้บรรยากาศโปร่ง",
  },
  curtainWave: {
    imageUrl: "/inspiration/details/detail-curtain-wave.png",
    label: "จีบสไตล์ Wave",
    caption: "เส้นผ้านุ่มหรู ดูเรียบหรู",
  },
  curtainEyelet: {
    imageUrl: "/inspiration/details/detail-curtain-eyelet.png",
    label: "ตาไก่ (Eyelet)",
    caption: "เลื่อนลื่น ติดตั้งง่าย",
  },
  railTrack: {
    imageUrl: "/inspiration/details/detail-rail-track.png",
    label: "รางม่านอลูมิเนียม",
    caption: "โครงแข็งแรง รองรับม่านหนัก",
  },
  rollerBlind: {
    imageUrl: "/inspiration/details/detail-roller-blind.png",
    label: "มู่ลี่ม้วน",
    caption: "ควบคุมแสง ประหยัดพื้นที่",
  },
} as const;

type AssetKey = keyof typeof INSPIRATION_DETAIL_ASSETS;

function asset(
  key: AssetKey,
  id: string,
  hotspotId?: string | null,
): InspirationDetailImageDto {
  const item = INSPIRATION_DETAIL_ASSETS[key];
  return {
    id,
    imageUrl: item.imageUrl,
    label: item.label,
    caption: item.caption,
    hotspotId: hotspotId ?? null,
  };
}

function detailsForHotspot(
  hotspot: InspirationHotspotDto,
  index: number,
): InspirationDetailImageDto[] {
  const slug = hotspot.productSlug ?? "";
  const fabric = (hotspot.fabricName ?? "").toLowerCase();
  const label = (hotspot.label ?? "").toLowerCase();
  const baseId = hotspot.id.slice(-3);
  const out: InspirationDetailImageDto[] = [];

  if (slug.includes("rail") || label.includes("ราง")) {
    out.push(asset("railTrack", `d-${baseId}-rail`, hotspot.id));
    return out;
  }
  if (
    slug.includes("roller") ||
    slug.includes("motorized") ||
    label.includes("มู่ลี่")
  ) {
    out.push(asset("rollerBlind", `d-${baseId}-roller`, hotspot.id));
    return out;
  }
  if (slug.includes("zebra") || label.includes("zebra")) {
    out.push(asset("rollerBlind", `d-${baseId}-zebra`, hotspot.id));
    return out;
  }

  if (
    fabric.includes("teal") ||
    fabric.includes("mint") ||
    label.includes("มิ้นท์")
  ) {
    out.push(asset("fabricLinenTeal", `d-${baseId}-fab`, hotspot.id));
  } else if (
    fabric.includes("beige") ||
    fabric.includes("sand") ||
    fabric.includes("linen")
  ) {
    out.push(asset("fabricLinenBeige", `d-${baseId}-fab`, hotspot.id));
  } else if (
    fabric.includes("blackout") ||
    fabric.includes("navy") ||
    fabric.includes("grey")
  ) {
    out.push(asset("fabricBlackout", `d-${baseId}-fab`, hotspot.id));
  } else if (
    fabric.includes("sheer") ||
    fabric.includes("white") ||
    fabric.includes("cream")
  ) {
    out.push(asset("fabricSheer", `d-${baseId}-fab`, hotspot.id));
  }

  const type = hotspot.configuratorProductType ?? "";
  if (type === "wave" || label.includes("wave")) {
    out.push(asset("curtainWave", `d-${baseId}-wave`, hotspot.id));
  } else if (
    type === "eyelet" ||
    label.includes("eyelet") ||
    label.includes("ตาไก่")
  ) {
    out.push(asset("curtainEyelet", `d-${baseId}-eye`, hotspot.id));
  } else if (type === "pleated" || label.includes("จีบ")) {
    out.push(asset("curtainWave", `d-${baseId}-pleat`, hotspot.id));
  }

  if (!out.length) {
    out.push(
      asset(
        index % 2 === 0 ? "fabricLinenBeige" : "curtainWave",
        `d-${baseId}-gen`,
        hotspot.id,
      ),
    );
  }

  return out;
}

export function buildDetailImagesFromHotspots(
  room: Pick<InspirationRoomDto, "hotspots" | "detailImages">,
): InspirationDetailImageDto[] {
  if (room.detailImages?.length) return room.detailImages;

  const seen = new Set<string>();
  const images: InspirationDetailImageDto[] = [];

  for (const [index, hotspot] of room.hotspots.entries()) {
    for (const detail of detailsForHotspot(hotspot, index)) {
      if (seen.has(detail.imageUrl)) continue;
      seen.add(detail.imageUrl);
      images.push(detail);
      if (images.length >= 4) return images;
    }
  }

  if (!images.length) {
    return [
      asset("fabricLinenBeige", `d-${room.hotspots[0]?.id ?? "0"}-a`),
      asset("curtainWave", `d-${room.hotspots[0]?.id ?? "0"}-b`),
    ];
  }

  return images;
}

export function resolveRoomDetailImages(
  room: InspirationRoomDto,
): InspirationDetailImageDto[] {
  return buildDetailImagesFromHotspots(room);
}
