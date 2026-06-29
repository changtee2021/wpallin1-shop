import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { fetchMemberProductPrices } from "@/lib/api.functions";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import type { ProductPublicDto } from "@/types/api/products";

export function useMemberProductPrices(products: ProductPublicDto[]) {
  const { session, user } = useAuth();
  const authOpts = useAuthServerFnOptions(session);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const productKey = products.map((p) => `${p.id}:${p.retailPrice}`).join("|");

  useEffect(() => {
    if (!user || products.length === 0) {
      setPrices({});
      return;
    }

    let cancelled = false;

    const fetchPrices = () => {
      void fetchMemberProductPrices({
        data: {
          products: products.map((p) => ({
            id: p.id,
            retailPrice: p.retailPrice,
          })),
        },
        ...authOpts,
      })
        .then((data) => {
          if (!cancelled) setPrices(data);
        })
        .catch(() => {
          if (!cancelled) setPrices({});
        });
    };

    const idleId =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(fetchPrices, { timeout: 2000 })
        : window.setTimeout(fetchPrices, 100);

    return () => {
      cancelled = true;
      if (typeof requestIdleCallback !== "undefined") {
        cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as number);
      }
    };
  }, [user, authOpts, productKey, products.length]);

  return prices;
}
