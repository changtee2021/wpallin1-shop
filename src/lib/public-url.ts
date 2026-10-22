// Server and browser must agree, or head tags (canonical, hreflang) duplicate
// on hydration — process.env is server-only, import.meta.env is inlined for both.
export function getPublicUrl(): string {
  return (
    import.meta.env.VITE_APP_PUBLIC_URL ||
    (typeof process !== "undefined"
      ? process.env.VITE_APP_PUBLIC_URL
      : undefined) ||
    "https://wpallin1-shop.vercel.app"
  );
}

export function getDefaultOgImageUrl(): string {
  return `${getPublicUrl()}/home/hero-living-curtains.png`;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const base = getPublicUrl().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
