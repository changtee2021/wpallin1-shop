import type { InspirationRoomDto } from "@/types/api/inspiration";

export type InspirationFilters = {
  roomTypes: string[];
  moods: string[];
  styles: string[];
};

export const EMPTY_INSPIRATION_FILTERS: InspirationFilters = {
  roomTypes: [],
  moods: [],
  styles: [],
};

export function countInspirationFilters(filters: InspirationFilters): number {
  return (
    filters.roomTypes.length + filters.moods.length + filters.styles.length
  );
}

export function toggleFilterValue(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function collectInspirationRoomTypes(
  rooms: InspirationRoomDto[],
): string[] {
  const set = new Set<string>();
  for (const room of rooms) {
    if (room.roomType) set.add(room.roomType);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "th"));
}

export function collectInspirationTags(
  rooms: InspirationRoomDto[],
  key: "moodTags" | "styleTags",
): string[] {
  const set = new Set<string>();
  for (const room of rooms) {
    for (const tag of room[key]) set.add(tag);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "th"));
}

function roomSearchText(room: InspirationRoomDto): string {
  return [
    room.title,
    room.description,
    room.roomType,
    ...room.moodTags,
    ...room.styleTags,
    ...room.hotspots.map((h) => h.label),
    ...room.hotspots.map((h) => h.productName),
    ...room.hotspots.map((h) => h.fabricName),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesInspirationSearch(
  room: InspirationRoomDto,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return roomSearchText(room).includes(needle);
}

export function matchesInspirationFilters(
  room: InspirationRoomDto,
  filters: InspirationFilters,
): boolean {
  if (
    filters.roomTypes.length > 0 &&
    (!room.roomType || !filters.roomTypes.includes(room.roomType))
  ) {
    return false;
  }
  if (
    filters.moods.length > 0 &&
    !filters.moods.some((tag) => room.moodTags.includes(tag))
  ) {
    return false;
  }
  if (
    filters.styles.length > 0 &&
    !filters.styles.some((tag) => room.styleTags.includes(tag))
  ) {
    return false;
  }
  return true;
}

export function filterInspirationRooms(
  rooms: InspirationRoomDto[],
  query: string,
  filters: InspirationFilters,
): InspirationRoomDto[] {
  return rooms.filter(
    (room) =>
      matchesInspirationSearch(room, query) &&
      matchesInspirationFilters(room, filters),
  );
}
