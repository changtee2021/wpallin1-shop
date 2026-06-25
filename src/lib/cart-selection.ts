import type { CartItemDto } from "@/types/api/cart";

const STORAGE_KEY = "wpall_cart_selected";

export function parseItemIds(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export function serializeItemIds(ids: string[]): string {
  return ids.join(",");
}

export function filterCartItems(
  items: CartItemDto[],
  selectedIds: string[],
): CartItemDto[] {
  const set = new Set(selectedIds);
  return items.filter((item) => set.has(item.id));
}

export function calcSelectedSubtotal(items: CartItemDto[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.lineTotal, 0) * 100) / 100;
}

export function calcSelectedQty(items: CartItemDto[]): number {
  return items.reduce((sum, item) => sum + item.qty, 0);
}

export function loadStoredSelection(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredSelection(ids: string[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function proportionalDiscount(
  cartSubtotal: number,
  cartDiscount: number,
  selectedSubtotal: number,
): number {
  if (cartDiscount <= 0 || cartSubtotal <= 0 || selectedSubtotal <= 0) return 0;
  return (
    Math.round(((cartDiscount * selectedSubtotal) / cartSubtotal) * 100) / 100
  );
}
