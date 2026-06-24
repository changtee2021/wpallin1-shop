/** LINE OA @wpfordealer — override via VITE_LINE_OA_URL */
export const LINE_OA_URL =
  import.meta.env.VITE_LINE_OA_URL ?? "https://lin.ee/vopHClz";

export const CATALOG_FLIPBOOK_PREF_KEY = "wpall-catalog-flipbook-mode";

export function readFlipbookPref(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(CATALOG_FLIPBOOK_PREF_KEY) === "1";
}

export function writeFlipbookPref(enabled: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CATALOG_FLIPBOOK_PREF_KEY, enabled ? "1" : "0");
}

export function getCatalogPageUrl(slug: string, page?: number): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (import.meta.env.VITE_APP_PUBLIC_URL ?? "");
  const base = `${origin}/catalogs/${slug}`;
  if (page && page > 1) return `${base}?page=${page}`;
  return base;
}

export function detectCatalogDevice(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < 768) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}
