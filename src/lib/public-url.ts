export function getPublicUrl(): string {
  return process.env.VITE_APP_PUBLIC_URL ?? "https://wpallin1-shop.vercel.app";
}

export function getDefaultOgImageUrl(): string {
  return `${getPublicUrl()}/brand/logo-mono-dark.png`;
}

export function absoluteUrl(path: string): string {
  const base = getPublicUrl().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
