import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import type { ProductPublicDto } from "@/types/api/products";

const MAX_COMPARE = 4;
const STORAGE_KEY = "wpall_compare_items";

type CompareContextValue = {
  items: ProductPublicDto[];
  toggle: (product: ProductPublicDto) => void;
  remove: (id: string) => void;
  clear: () => void;
  isSelected: (id: string) => boolean;
  isFull: boolean;
  count: number;
};

const CompareContext = createContext<CompareContextValue | null>(null);

function loadStored(): ProductPublicDto[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ProductPublicDto[];
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ProductPublicDto[]>(() => loadStored());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const toggle = useCallback((product: ProductPublicDto) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      if (prev.length >= MAX_COMPARE) {
        toast.error("เปรียบเทียบได้สูงสุด 4 รายการ");
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isSelected = useCallback(
    (id: string) => items.some((p) => p.id === id),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      toggle,
      remove,
      clear,
      isSelected,
      isFull: items.length >= MAX_COMPARE,
      count: items.length,
    }),
    [items, toggle, remove, clear, isSelected],
  );

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
