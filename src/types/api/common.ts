export type ApiMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ApiListResponse<T> = {
  data: T[];
  meta: ApiMeta;
};

export type ApiError = {
  error: string;
  code?: string;
};

export type SortDirection = "asc" | "desc";

export type PaginationParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: SortDirection;
};
