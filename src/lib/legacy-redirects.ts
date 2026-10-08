/**
 * Old wpallin1.com (ReadyPlanet) URLs that Google still lists. Each one is sent to the closest
 * page on the current site with a 301, so search results and bookmarks keep working and the
 * old ranking moves to the new page.
 *
 * Keys are the decoded path, lower-case, without a trailing slash and without the numeric page
 * id prefix ReadyPlanet adds (e.g. `/18200704/เกี่ยวกับเรา` is looked up as `/เกี่ยวกับเรา`).
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  "/เกี่ยวกับเรา": "/about",
  "/ม่านม้วนมอเตอร์": "/smart-motor",
  "/ผ้าม่านมอเตอร์": "/smart-motor",
  "/ม่านมอเตอร์ไฟฟ้า": "/smart-motor",
  "/screen": "/products/roller-blinds",
  "/มู่ลี่": "/products?category=blinds",
};

/** Returns the new location for an old URL, or null when the path is not a known legacy page. */
export function resolveLegacyRedirect(pathname: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  path = path
    .replace(/^\/\d+(?=\/)/, "")
    .replace(/\/+$/, "")
    .toLowerCase();
  return LEGACY_REDIRECTS[path] ?? null;
}
