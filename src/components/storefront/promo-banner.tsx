import { Link } from "@tanstack/react-router";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";

const slides = [
  {
    title: "ศูนย์กลางผ้าม่าน",
    subtitle: "ครบวงจร ตั้งแต่เลือกจนถึงติดตั้ง",
    cta: "ช้อปเลย",
    to: "/shop" as const,
    bg: "from-primary to-primary/80",
  },
  {
    title: "มู่ลี่ & Zebra",
    subtitle: "ลดแสง UV สไตล์โมเดิร์น",
    cta: "ดูสินค้า",
    to: "/shop" as const,
    search: { category: "roller-blinds" },
    bg: "from-accent to-accent/80",
  },
  {
    title: "ผ้าม่านสำเร็จรูป",
    subtitle: "พร้อมติดตั้ง ไม่ต้องรอ",
    cta: "สั่งซื้อวันนี้",
    to: "/shop" as const,
    search: { category: "ready-made" },
    bg: "from-primary/90 to-teal-700",
  },
];

export function PromoBanner() {
  return (
    <Carousel className="w-full" opts={{ loop: true }}>
      <CarouselContent>
        {slides.map((slide, i) => (
          <CarouselItem key={i}>
            <div
              className={`relative flex h-36 items-center overflow-hidden rounded-xl bg-gradient-to-r px-6 text-white sm:h-44 sm:px-10 ${slide.bg}`}
            >
              <div className="relative z-10 max-w-md">
                <h2 className="text-xl font-bold sm:text-2xl">{slide.title}</h2>
                <p className="mt-1 text-sm text-white/90 sm:text-base">
                  {slide.subtitle}
                </p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-4 bg-white text-primary hover:bg-white/90"
                  asChild
                >
                  <Link to={slide.to} search={slide.search}>
                    {slide.cta}
                  </Link>
                </Button>
              </div>
              <div className="absolute -right-8 -bottom-8 size-40 rounded-full bg-white/10 sm:size-56" />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-2 border-none bg-white/80 shadow" />
      <CarouselNext className="right-2 border-none bg-white/80 shadow" />
    </Carousel>
  );
}
