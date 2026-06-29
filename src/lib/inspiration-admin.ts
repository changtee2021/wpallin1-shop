import type {
  InspirationDetailImageDto,
  InspirationHotspotDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

export type HotspotDraftKind = "ready" | "custom" | "rail" | "blind";

export type HotspotDraft = {
  clientId: string;
  id?: string;
  kind: HotspotDraftKind;
  label: string;
  productId: string | null;
  productName: string | null;
  fabricId: string | null;
  fabricName: string | null;
  configuratorProductType: string | null;
  posX: number;
  posY: number;
  sortOrder: number;
};

export function newHotspotDraft(
  posX: number,
  posY: number,
  sortOrder: number,
): HotspotDraft {
  return {
    clientId: crypto.randomUUID(),
    kind: "custom",
    label: "",
    productId: null,
    productName: null,
    fabricId: null,
    fabricName: null,
    configuratorProductType: null,
    posX,
    posY,
    sortOrder,
  };
}

export function hotspotDtoToDraft(
  hotspot: InspirationHotspotDto,
  index: number,
): HotspotDraft {
  const slug = (hotspot.productSlug ?? "").toLowerCase();
  const label = (hotspot.label ?? "").toLowerCase();
  let kind: HotspotDraftKind = "custom";

  if (slug.includes("rail") || label.includes("ราง")) {
    kind = "rail";
  } else if (
    slug.includes("roller") ||
    slug.includes("motorized") ||
    slug.includes("zebra") ||
    label.includes("มู่ลี่")
  ) {
    kind = "blind";
  } else if (hotspot.productId || hotspot.productSlug) {
    kind = "ready";
  } else if (hotspot.fabricId || hotspot.configuratorProductType) {
    kind = "custom";
  }

  return {
    clientId: hotspot.id,
    id: hotspot.id,
    kind,
    label: hotspot.label ?? "",
    productId: hotspot.productId,
    productName: hotspot.productName,
    fabricId: hotspot.fabricId,
    fabricName: hotspot.fabricName,
    configuratorProductType: hotspot.configuratorProductType,
    posX: hotspot.posX,
    posY: hotspot.posY,
    sortOrder: hotspot.sortOrder ?? index,
  };
}

export function hotspotDraftToInput(hotspot: HotspotDraft, index: number) {
  return {
    id: hotspot.id,
    label: hotspot.label.trim() || null,
    productId:
      hotspot.kind === "ready" ||
      hotspot.kind === "rail" ||
      hotspot.kind === "blind"
        ? hotspot.productId
        : null,
    fabricId: hotspot.kind === "custom" ? hotspot.fabricId : null,
    configuratorProductType:
      hotspot.kind === "custom" ? hotspot.configuratorProductType : null,
    posX: hotspot.posX,
    posY: hotspot.posY,
    sortOrder: index,
  };
}

export type RoomEditorState = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string;
  roomType: string;
  moodTags: string;
  styleTags: string;
  sortOrder: number;
  isFeatured: boolean;
  status: InspirationRoomDto["status"];
  hotspots: HotspotDraft[];
  detailImages: InspirationDetailImageDto[];
};

export function emptyRoomEditorState(): RoomEditorState {
  return {
    slug: "",
    title: "",
    description: "",
    imageUrl: "",
    roomType: "",
    moodTags: "",
    styleTags: "",
    sortOrder: 0,
    isFeatured: false,
    status: "draft",
    hotspots: [],
    detailImages: [],
  };
}

export function roomToEditorState(room: InspirationRoomDto): RoomEditorState {
  return {
    id: room.id,
    slug: room.slug,
    title: room.title,
    description: room.description ?? "",
    imageUrl: room.imageUrl,
    roomType: room.roomType ?? "",
    moodTags: room.moodTags.join(", "),
    styleTags: room.styleTags.join(", "),
    sortOrder: room.sortOrder,
    isFeatured: room.isFeatured,
    status: room.status,
    hotspots: room.hotspots.map(hotspotDtoToDraft),
    detailImages: room.detailImages ?? [],
  };
}

export function splitTags(value: string) {
  return value
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}
