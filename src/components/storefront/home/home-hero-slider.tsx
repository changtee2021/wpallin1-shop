import { HeroBannerSlider } from "@/components/storefront/hero-banner-slider";
import type { HeroBannerDto } from "@/types/api/hero-banners";

type HomeHeroSliderProps = {
  banners: HeroBannerDto[];
};

export function HomeHeroSlider({ banners }: HomeHeroSliderProps) {
  return <HeroBannerSlider banners={banners} variant="home" />;
}
