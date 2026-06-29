const VISITOR_KEY = "wpall-inspiration-visitor";
const LIKES_KEY = "wpall-inspiration-likes";
const LOCAL_STATS_KEY = "wpall-inspiration-local-stats";

type LocalStats = Record<string, { extraViews: number; extraLikes: number }>;

function readLocalStats(): LocalStats {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as LocalStats;
  } catch {
    return {};
  }
}

function writeLocalStats(stats: LocalStats) {
  localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
}

export function getInspirationVisitorId(): string {
  if (typeof window === "undefined") return "ssr-visitor";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function readInspirationLikedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKES_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

function writeInspirationLikedIds(ids: Set<string>) {
  localStorage.setItem(LIKES_KEY, JSON.stringify([...ids]));
}

export function getLocalEngagementCounts(
  roomId: string,
  base: { viewCount: number; likeCount: number },
): { viewCount: number; likeCount: number } {
  const stats = readLocalStats()[roomId];
  return {
    viewCount: base.viewCount + (stats?.extraViews ?? 0),
    likeCount: base.likeCount + (stats?.extraLikes ?? 0),
  };
}

export function bumpLocalView(roomId: string): number {
  const stats = readLocalStats();
  const room = stats[roomId] ?? { extraViews: 0, extraLikes: 0 };
  room.extraViews += 1;
  stats[roomId] = room;
  writeLocalStats(stats);
  return room.extraViews;
}

export function toggleLocalLike(roomId: string): boolean {
  const liked = readInspirationLikedIds();
  const stats = readLocalStats();
  const room = stats[roomId] ?? { extraViews: 0, extraLikes: 0 };
  const nowLiked = !liked.has(roomId);

  if (nowLiked) {
    liked.add(roomId);
    room.extraLikes += 1;
  } else {
    liked.delete(roomId);
    room.extraLikes -= 1;
  }

  stats[roomId] = room;
  writeLocalStats(stats);
  writeInspirationLikedIds(liked);
  return nowLiked;
}

export function hasViewedInspirationSession(roomId: string): boolean {
  if (typeof window === "undefined") return true;
  return sessionStorage.getItem(`insp-view-${roomId}`) === "1";
}

export function markInspirationViewedSession(roomId: string) {
  sessionStorage.setItem(`insp-view-${roomId}`, "1");
}
