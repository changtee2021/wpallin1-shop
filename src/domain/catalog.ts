import type { ApiListResponse } from "@/types/api/common";
import type { ProductListQuery, ProductPublicDto } from "@/types/api/products";

export function normalizeProductListQuery(query: ProductListQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 24));
  return {
    ...query,
    page,
    pageSize,
    from: (page - 1) * pageSize,
    to: page * pageSize - 1,
  };
}

export function emptyProductList(
  page = 1,
  pageSize = 24,
): ApiListResponse<ProductPublicDto> {
  return {
    data: [],
    meta: {
      page,
      pageSize,
      total: 0,
      totalPages: 0,
    },
  };
}
