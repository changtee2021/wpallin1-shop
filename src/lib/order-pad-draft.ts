import type { OrderPadLine } from "@/components/order/order-pad";

const STORAGE_PREFIX = "wpall-order-pad-draft";

export function orderPadDraftKey(userId: string | null | undefined): string {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}`;
}

export function loadOrderPadDraft(key: string): OrderPadLine[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderPadLine[];
    if (!Array.isArray(parsed) || !parsed.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveOrderPadDraft(key: string, lines: OrderPadLine[]): void {
  if (typeof window === "undefined") return;
  try {
    if (!lines.length) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, JSON.stringify(lines));
  } catch {
    // quota or private mode — ignore
  }
}

export function clearOrderPadDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
