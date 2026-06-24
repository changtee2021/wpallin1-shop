export type HeroBannerDto = {
  id: string;
  imageUrl: string;
  linkUrl: string | null;
  alt: string | null;
  sortOrder: number;
  isActive: boolean;
};
