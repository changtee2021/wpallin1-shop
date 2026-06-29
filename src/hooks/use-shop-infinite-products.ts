import { useCallback, useEffect, useRef, useState } from "react";

import {
  fetchPublicProducts,
  fetchSmartSearchProducts,
} from "@/lib/api.functions";
import {
  buildShopListOptions,
  shopFilterKey,
  type ShopSearchState,
} from "@/lib/shop-search";
import type { ProductPublicDto } from "@/types/api/products";

type ProductPage = {
  data: ProductPublicDto[];
  meta: { total: number; totalPages: number };
};

export function useShopInfiniteProducts(
  search: ShopSearchState,
  initial: ProductPage,
) {
  const [items, setItems] = useState(initial.data);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initial.meta.total);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const filterKey = shopFilterKey(search);

  useEffect(() => {
    setItems(initial.data);
    setPage(1);
    setTotal(initial.meta.total);
  }, [filterKey, initial.data, initial.meta.total]);

  const hasMore = items.length < total;

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;
    const listOptions = buildShopListOptions(search, nextPage);

    try {
      const result = search.smartQuery?.trim()
        ? await fetchSmartSearchProducts({
            data: {
              query: search.smartQuery.trim(),
              ...listOptions,
              search: undefined,
            },
          })
        : await fetchPublicProducts({ data: listOptions });

      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const appended = result.data.filter((p) => !seen.has(p.id));
        return appended.length ? [...prev, ...appended] : prev;
      });
      setPage(nextPage);
      setTotal(result.meta.total);
    } finally {
      loadingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, page, search, filterKey]);

  return { items, total, hasMore, loadingMore, loadMore };
}
