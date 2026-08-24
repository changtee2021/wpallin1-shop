import { HomeHeroSlider } from "@/components/storefront/home/home-hero-slider";
import { SlideLeftLink } from "@/components/storefront/slide-left-link";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import type { HeroBannerDto } from "@/types/api/hero-banners";

const HOME_HERO_SLIDES: HeroBannerDto[] = [
  {
    id: "local-living",
    imageUrl: "/home/hero-living-curtains.png",
    alt: "ห้องนั่งเล่นผ้าม่านจีบเต็มบาน",
    linkUrl: null,
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "local-bedroom",
    imageUrl: "/home/hero-bedroom-sheer.png",
    alt: "ห้องนอนผ้าม่านโปร่งและผ้าม่านทึบ",
    linkUrl: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "local-roller",
    imageUrl: "/home/hero-roller-blinds.png",
    alt: "มู่ลี่ม้วนสำหรับบ้านและออฟฟิศ",
    linkUrl: null,
    sortOrder: 2,
    isActive: true,
  },
];

export function HomeHero() {
  return (
    <div className="relative">
      <HomeHeroSlider banners={HOME_HERO_SLIDES} />
      <HomeHeroOverlay />
    </div>
  );
}

function HomeHeroOverlay() {
  const { t } = useT();

  return (
    <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.35)_45%,rgba(0,0,0,0.15)_100%)]">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-auto flex max-w-xl flex-col items-center space-y-4 text-center text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            {t("app.tagline")}
          </p>
          <h1 className="text-3xl font-bold leading-tight text-balance sm:text-4xl md:text-5xl">
            {t("home.hero.title")}
          </h1>
          <p className="text-sm leading-relaxed text-white/90 sm:text-base">
            {t("home.hero.subtitle")}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Button
              size="lg"
              variant="secondary"
              className="min-h-11 bg-white px-5 text-primary hover:bg-white/90 sm:min-h-10"
              asChild
            >
              <SlideLeftLink to="/configurator">
                {t("home.hero.ctaConfigurator")}
              </SlideLeftLink>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-11 border-white/50 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white sm:min-h-10"
              asChild
            >
              <SlideLeftLink to="/shop">{t("home.hero.ctaShop")}</SlideLeftLink>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
