import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { fetchMemberProductPrices } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { ProductPublicDto } from "@/types/api/products";

export function useMemberProductPrices(products: ProductPublicDto[]) {
  const { session, user } = useAuth();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const productKey = products.map((p) => `${p.id}:${p.retailPrice}`).join("|");

  useEffect(() => {
    if (!user || products.length === 0) {
      setPrices({});
      return;
    }

    let cancelled = false;
    void fetchMemberProductPrices({
      data: {
        products: products.map((p) => ({
          id: p.id,
          retailPrice: p.retailPrice,
        })),
      },
      ...authServerFnOptions(session),
    })
      .then((data) => {
        if (!cancelled) setPrices(data);
      })
      .catch(() => {
        if (!cancelled) setPrices({});
      });

    return () => {
      cancelled = true;
    };
  }, [user, session, productKey, products.length]);

  return prices;
}
