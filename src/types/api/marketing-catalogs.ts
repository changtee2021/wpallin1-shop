export type CatalogVisibility = "public" | "dealer" | "private";
export type CatalogStatus = "draft" | "published" | "archived";

export type MarketingCatalogCategoryDto = {
  id: string;
  name: string;
  slug: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type MarketingCatalogDto = {
  id: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  brand: string | null;
  description: string | null;
  coverImageUrl: string | null;
  pdfUrl: string | null;
  pdfStoragePath: string | null;
  externalLink: string | null;
  tags: string[];
  version: string | null;
  pageCount: number | null;
  fileSize: number | null;
  visibility: CatalogVisibility;
  allowDownload: boolean;
  isFeatured: boolean;
  status: CatalogStatus;
  sortOrder: number;
  /** @deprecated use visibility + status */
  isPublic: boolean;
  /** @deprecated use status */
  isActive: boolean;
  productIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type MarketingCatalogInput = {
  id?: string;
  slug?: string;
  categoryId?: string | null;
  title: string;
  brand?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  pdfUrl?: string | null;
  pdfStoragePath?: string | null;
  externalLink?: string | null;
  tags?: string[];
  version?: string | null;
  pageCount?: number | null;
  fileSize?: number | null;
  visibility?: CatalogVisibility;
  allowDownload?: boolean;
  isFeatured?: boolean;
  status?: CatalogStatus;
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
  productIds?: string[];
};

export type CatalogViewDevice = "mobile" | "desktop" | "tablet";

export type RecordCatalogViewInput = {
  catalogId: string;
  pageNumber?: number;
  device: CatalogViewDevice;
};

export type MarketingCatalogAccessDto =
  | { access: "full"; catalog: MarketingCatalogDto }
  | { access: "locked"; catalog: MarketingCatalogDto; reason: "dealer" };

export type CatalogViewStatsDto = {
  catalogId: string;
  views7d: number;
  views30d: number;
  viewsAll: number;
};
