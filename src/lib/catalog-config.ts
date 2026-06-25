/** LINE OA @wpfordealer — override via VITE_LINE_OA_URL */
export const LINE_OA_URL =
  import.meta.env.VITE_LINE_OA_URL ?? "https://lin.ee/vopHClz";

export function getCatalogPageUrl(slug: string, page?: number): string {
  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : (import.meta.env.VITE_APP_PUBLIC_URL ?? "");
  const base = `${origin}/catalogs/${slug}`;
  if (page && page > 1) return `${base}?page=${page}`;
  return base;
}

export {
  detectCatalogDevice,
  type CatalogDevice,
} from "@/hooks/use-catalog-viewport";
