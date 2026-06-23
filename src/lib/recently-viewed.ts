import type { ProductPublicDto } from "@/types/api/products";

const STORAGE_KEY = "wpall_recently_viewed";
const MAX_ITEMS = 12;

type StoredItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  retailPrice: number;
  viewedAt: number;
};

export function trackRecentlyViewed(product: ProductPublicDto): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: StoredItem[] = raw ? (JSON.parse(raw) as StoredItem[]) : [];
    const next: StoredItem[] = [
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        retailPrice: product.retailPrice,
        viewedAt: Date.now(),
      },
      ...list.filter((item) => item.id !== product.id),
    ].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota errors */
  }
}

export function getRecentlyViewed(): StoredItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredItem[]) : [];
  } catch {
    return [];
  }
}

export type RecentlyViewedItem = StoredItem;
