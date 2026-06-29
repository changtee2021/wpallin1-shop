import { HeroBannerSlider } from "@/components/storefront/hero-banner-slider";
import type { HeroBannerDto } from "@/types/api/hero-banners";

type ShopHeroSliderProps = {
  banners: HeroBannerDto[];
};

export function ShopHeroSlider({ banners }: ShopHeroSliderProps) {
  return <HeroBannerSlider banners={banners} variant="shop" />;
}
