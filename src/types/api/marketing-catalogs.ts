export type MarketingCatalogCategoryDto = {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type MarketingCatalogDto = {
  id: string;
  categoryId: string | null;
  categoryName: string | null;
  title: string;
  brand: string | null;
  description: string | null;
  coverImageUrl: string | null;
  pdfUrl: string | null;
  externalLink: string | null;
  tags: string[];
  sortOrder: number;
  isPublic: boolean;
  isActive: boolean;
  productIds: string[];
  createdAt: string;
};

export type MarketingCatalogInput = {
  id?: string;
  categoryId?: string | null;
  title: string;
  brand?: string | null;
  description?: string | null;
  coverImageUrl?: string | null;
  pdfUrl?: string | null;
  externalLink?: string | null;
  tags?: string[];
  sortOrder?: number;
  isPublic?: boolean;
  isActive?: boolean;
  productIds?: string[];
};
