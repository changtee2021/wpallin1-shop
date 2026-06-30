const STORAGE_KEY = "wpall-room-advisor-guest";

export function getRoomAdvisorGuestSessionId(): string {
  if (typeof window === "undefined") return crypto.randomUUID();
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export function buildRoomAdvisorShareUrl(
  token: string,
  origin = typeof window !== "undefined" ? window.location.origin : "",
): string {
  return `${origin}/room-advisor/share/${token}`;
}
