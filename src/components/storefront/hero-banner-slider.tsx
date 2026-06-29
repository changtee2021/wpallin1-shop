import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { HeroBannerDto } from "@/types/api/hero-banners";

export type HeroBannerSliderVariant = "home" | "shop";

type HeroBannerSliderProps = {
  banners: HeroBannerDto[];
  variant?: HeroBannerSliderVariant;
};

const variantConfig = {
  home: {
    section:
      "relative overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5",
    image:
      "aspect-[2.4/1] w-full object-cover sm:aspect-[2.8/1] md:aspect-[3/1]",
    dotActive: "bg-white",
    dotInactive: "bg-white/50",
  },
  shop: {
    section: "relative w-full overflow-hidden bg-muted",
    image:
      "aspect-[2.2/1] w-full object-cover sm:aspect-[2.6/1] md:aspect-[3.2/1] lg:aspect-[3.5/1]",
    dotActive: "bg-accent",
    dotInactive: "bg-white/40",
  },
} as const;

function BannerSlide({
  banner,
  priority,
  imageClassName,
}: {
  banner: HeroBannerDto;
  priority?: boolean;
  imageClassName: string;
}) {
  const image = (
    <img
      src={banner.imageUrl}
      alt={banner.alt ?? "แบนเนอร์โปรโมชัน"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={imageClassName}
    />
  );

  if (!banner.linkUrl) {
    return image;
  }

  if (/^https?:\/\//i.test(banner.linkUrl)) {
    return (
      <a
        href={banner.linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {image}
      </a>
    );
  }

  return (
    <Link to={banner.linkUrl} className="block">
      {image}
    </Link>
  );
}

export function HeroBannerSlider({
  banners,
  variant = "home",
}: HeroBannerSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const config = variantConfig[variant];

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api || banners.length <= 1) return;
    const timer = window.setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [api, banners.length]);

  if (!banners.length) return null;

  return (
    <section className={config.section}>
      <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="pl-0">
              <BannerSlide
                banner={banner}
                priority={index === 0}
                imageClassName={config.image}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 ? (
          <>
            <CarouselPrevious className="left-3 hidden border-none bg-white/90 shadow sm:inline-flex" />
            <CarouselNext className="right-3 hidden border-none bg-white/90 shadow sm:inline-flex" />
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  aria-label={`สไลด์ ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    "size-2 rounded-full transition-colors",
                    current === index ? config.dotActive : config.dotInactive,
                  )}
                />
              ))}
            </div>
          </>
        ) : null}
      </Carousel>
    </section>
  );
}
