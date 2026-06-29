import type { InspirationRoomDto } from "@/types/api/inspiration";

function similarityScore(
  current: InspirationRoomDto,
  candidate: InspirationRoomDto,
): number {
  if (current.id === candidate.id) return -1;

  let score = 0;
  if (
    current.roomType &&
    candidate.roomType &&
    current.roomType === candidate.roomType
  ) {
    score += 4;
  }
  for (const tag of current.moodTags) {
    if (candidate.moodTags.includes(tag)) score += 2;
  }
  for (const tag of current.styleTags) {
    if (candidate.styleTags.includes(tag)) score += 2;
  }
  return score;
}

export function findSimilarInspirationRooms(
  current: InspirationRoomDto,
  allRooms: InspirationRoomDto[],
  limit = 6,
): InspirationRoomDto[] {
  const scored = allRooms
    .map((room) => ({ room, score: similarityScore(current, room) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.room.likeCount !== a.room.likeCount) {
        return b.room.likeCount - a.room.likeCount;
      }
      return b.room.viewCount - a.room.viewCount;
    });

  const picked = scored.slice(0, limit).map((entry) => entry.room);
  if (picked.length >= limit) return picked;

  const used = new Set([current.id, ...picked.map((r) => r.id)]);
  const fallback = allRooms
    .filter((room) => !used.has(room.id))
    .sort((a, b) => b.likeCount - a.likeCount || b.viewCount - a.viewCount);

  return [...picked, ...fallback].slice(0, limit);
}
