import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getOrCreateCartSessionId } from "@/lib/cart-session";
import {
  addProductToCart,
  fetchCart,
  mergeCartOnLogin,
  removeFromCart,
  saveCartItemOptions,
  updateCartItem,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useAuth } from "@/hooks/use-auth";
import type { CartDto } from "@/types/api/cart";

const emptyCart: CartDto = {
  id: "",
  items: [],
  subtotal: 0,
  discount: 0,
  itemCount: 0,
};

type CartContextValue = {
  cart: CartDto;
  loading: boolean;
  refresh: () => Promise<void>;
  addItem: (
    productId: string,
    qty?: number,
    selectedOptions?: Record<string, string>,
  ) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemOptions: (
    itemId: string,
    selectedOptions: Record<string, string>,
  ) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { session, user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<CartDto>(emptyCart);
  const [loading, setLoading] = useState(true);
  const mergedUserIdRef = useRef<string | null>(null);

  const fnOpts = useMemo(() => authServerFnOptions(session), [session?.access_token]);

  const refresh = useCallback(async () => {
    const sessionId = getOrCreateCartSessionId();
    if (!sessionId && !user) {
      setCart(emptyCart);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchCart({
        data: sessionId ? { sessionId } : {},
        ...fnOpts,
      });
      setCart(data);
    } catch {
      setCart((prev) => (prev.items.length ? prev : emptyCart));
    } finally {
      setLoading(false);
    }
  }, [fnOpts, user]);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    async function loadCart() {
      const sessionId = getOrCreateCartSessionId();
      if (!sessionId && !user) {
        if (!cancelled) {
          setCart(emptyCart);
          setLoading(false);
        }
        return;
      }

      if (!cancelled) setLoading(true);
      try {
        const shouldMerge =
          user &&
          sessionId &&
          session?.access_token &&
          mergedUserIdRef.current !== user.id;

        if (shouldMerge) {
          await mergeCartOnLogin({
            data: { sessionId },
            ...fnOpts,
          });
          mergedUserIdRef.current = user.id;
        }

        const data = await fetchCart({
          data: sessionId ? { sessionId } : {},
          ...fnOpts,
        });
        if (!cancelled) setCart(data);
      } catch {
        if (!cancelled) {
          setCart((prev) => (prev.items.length ? prev : emptyCart));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCart();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, session?.access_token, fnOpts]);

  useEffect(() => {
    if (!user) mergedUserIdRef.current = null;
  }, [user?.id]);

  const addItem = useCallback(
    async (
      productId: string,
      qty = 1,
      selectedOptions?: Record<string, string>,
    ) => {
      const sessionId = getOrCreateCartSessionId();
      const data = await addProductToCart({
        data: { sessionId, productId, qty, selectedOptions },
        ...fnOpts,
      });
      setCart(data);
    },
    [fnOpts],
  );

  const updateQty = useCallback(
    async (itemId: string, qty: number) => {
      const sessionId = getOrCreateCartSessionId();
      const data = await updateCartItem({
        data: { sessionId, itemId, qty },
        ...fnOpts,
      });
      setCart(data);
    },
    [fnOpts],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const sessionId = getOrCreateCartSessionId();
      const data = await removeFromCart({
        data: { sessionId, itemId },
        ...fnOpts,
      });
      setCart(data);
    },
    [fnOpts],
  );

  const updateItemOptions = useCallback(
    async (itemId: string, selectedOptions: Record<string, string>) => {
      const sessionId = getOrCreateCartSessionId();
      const data = await saveCartItemOptions({
        data: { sessionId, itemId, selectedOptions },
        ...fnOpts,
      });
      setCart(data);
    },
    [fnOpts],
  );

  const value = useMemo(
    () => ({
      cart,
      loading,
      refresh,
      addItem,
      updateQty,
      removeItem,
      updateItemOptions,
    }),
    [cart, loading, refresh, addItem, updateQty, removeItem, updateItemOptions],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
