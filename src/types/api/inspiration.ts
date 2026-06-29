import type { ProductType } from "@/types/api/products";

export type InspirationRoomStatus = "draft" | "published" | "archived";

export type InspirationHotspotDto = {
  id: string;
  label: string | null;
  productId: string | null;
  productSlug: string | null;
  productName: string | null;
  productImageUrl?: string | null;
  fabricId: string | null;
  fabricName: string | null;
  configuratorProductType: string | null;
  productType?: ProductType | null;
  posX: number;
  posY: number;
  sortOrder: number;
};

export type InspirationDetailImageDto = {
  id: string;
  imageUrl: string;
  label: string;
  caption?: string | null;
  hotspotId?: string | null;
};

export type InspirationRoomDto = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string;
  roomType: string | null;
  styleTags: string[];
  moodTags: string[];
  sortOrder: number;
  isFeatured: boolean;
  status: InspirationRoomStatus;
  viewCount: number;
  likeCount: number;
  detailImages: InspirationDetailImageDto[];
  hotspots: InspirationHotspotDto[];
  createdAt: string;
  updatedAt: string;
};

export type InspirationMaterialType = "fabric" | "style" | "rail" | "blind";

export type InspirationMaterialStatus = "draft" | "published" | "archived";

export type InspirationMaterialDto = {
  id?: string;
  slug: string;
  label: string;
  caption: string | null;
  imageUrl: string;
  materialType: InspirationMaterialType;
  fabricId: string | null;
  productSlug: string | null;
  productId: string | null;
  configuratorProductType: string | null;
  roomSlugs: string[];
  roomCount: number;
  hotspotIds: string[];
  galleryUrls?: string[];
  isDbManaged?: boolean;
  sortOrder?: number;
  isFeatured?: boolean;
};

export type InspirationMaterialRoomLink = {
  roomId: string;
  roomSlug?: string;
  roomTitle?: string;
  hotspotId: string | null;
};

export type InspirationMaterialAdminDto = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  materialType: InspirationMaterialType;
  fabricId: string | null;
  productId: string | null;
  productSlug: string | null;
  heroImageUrl: string;
  galleryUrls: string[];
  profileOverrides: Record<string, unknown>;
  sortOrder: number;
  isFeatured: boolean;
  status: InspirationMaterialStatus;
  roomLinks: InspirationMaterialRoomLink[];
  createdAt: string;
  updatedAt: string;
};

export type InspirationMaterialInput = {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  materialType: InspirationMaterialType;
  fabricId?: string | null;
  productId?: string | null;
  heroImageUrl: string;
  galleryUrls?: string[];
  profileOverrides?: Record<string, unknown>;
  sortOrder?: number;
  isFeatured?: boolean;
  status?: InspirationMaterialStatus;
  roomLinks?: Array<{ roomId: string; hotspotId?: string | null }>;
};

export type InspirationRoomInput = {
  id?: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  roomType?: string | null;
  styleTags?: string[];
  moodTags?: string[];
  sortOrder?: number;
  isFeatured?: boolean;
  status?: InspirationRoomStatus;
  detailImages?: InspirationDetailImageDto[];
  hotspots?: Array<{
    id?: string;
    label?: string | null;
    productId?: string | null;
    fabricId?: string | null;
    configuratorProductType?: string | null;
    posX: number;
    posY: number;
    sortOrder?: number;
  }>;
};
