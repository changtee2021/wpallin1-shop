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

type HomeHeroSliderProps = {
  banners: HeroBannerDto[];
};

function BannerSlide({
  banner,
  priority,
}: {
  banner: HeroBannerDto;
  priority?: boolean;
}) {
  const image = (
    <img
      src={banner.imageUrl}
      alt={banner.alt ?? "แบนเนอร์โปรโมชัน"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="aspect-[2.4/1] w-full object-cover sm:aspect-[2.8/1] lg:aspect-[3/1]"
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

export function HomeHeroSlider({ banners }: HomeHeroSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
    <section className="relative overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
      <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
        <CarouselContent className="-ml-0">
          {banners.map((banner, index) => (
            <CarouselItem key={banner.id} className="pl-0">
              <BannerSlide banner={banner} priority={index === 0} />
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
                    current === index ? "bg-white" : "bg-white/50",
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
