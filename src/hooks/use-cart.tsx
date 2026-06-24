import { useCallback, useEffect, useMemo, useState } from "react";

import { getOrCreateCartSessionId } from "@/lib/cart-session";
import {
  addProductToCart,
  fetchCart,
  mergeCartOnLogin,
  removeFromCart,
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

export function useCart() {
  const { session, user } = useAuth();
  const [cart, setCart] = useState<CartDto>(emptyCart);
  const [loading, setLoading] = useState(true);

  const sessionId = useMemo(() => getOrCreateCartSessionId(), []);
  const fnOpts = useMemo(() => authServerFnOptions(session), [session]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCart({
        data: { sessionId },
        ...fnOpts,
      });
      setCart(data);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [sessionId, fnOpts]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (user && sessionId) {
      void mergeCartOnLogin({
        data: { sessionId },
        ...fnOpts,
      }).then(setCart);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback(
    async (
      productId: string,
      qty = 1,
      selectedOptions?: Record<string, string>,
    ) => {
      const data = await addProductToCart({
        data: { sessionId, productId, qty, selectedOptions },
        ...fnOpts,
      });
      setCart(data);
    },
    [sessionId, fnOpts],
  );

  const updateQty = useCallback(
    async (itemId: string, qty: number) => {
      const data = await updateCartItem({
        data: { sessionId, itemId, qty },
        ...fnOpts,
      });
      setCart(data);
    },
    [sessionId, fnOpts],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const data = await removeFromCart({
        data: { sessionId, itemId },
        ...fnOpts,
      });
      setCart(data);
    },
    [sessionId, fnOpts],
  );

  return { cart, loading, refresh, addItem, updateQty, removeItem };
}
