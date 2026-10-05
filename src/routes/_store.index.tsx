import { createFileRoute } from "@tanstack/react-router";

import {
  BrandEntrySplit,
  BrandHero,
  BrandProductRail,
  BrandProjectsBento,
} from "@/components/storefront/home/brand-home-sections";
import {
  BrandFactory,
  BrandStatement,
} from "@/components/storefront/home/brand-story-sections";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/")({
  head: () =>
    pageHead({
      title: "WP ALL — ม่าน มู่ลี่ และระบบมอเตอร์ ผลิตในไทย",
      description:
        "WP ALL IN 1 ผู้ผลิตผ้าม่าน มู่ลี่ ม่านม้วน ฉากกั้นห้อง PVC รางม่าน และระบบมอเตอร์อัจฉริยะ สั่งทำตามขนาด สำหรับบ้าน โครงการ และตัวแทนจำหน่าย",
      path: "/",
      image: "/home/hero-living-curtains.png",
    }),
  component: HomePage,
});

/**
 * Story order: promise → factory → range → projects → two doors (footer closes with the contact CTA).
 * Chapter numbers 01–04 are printed in each section heading; backgrounds alternate white / deep / cream / white.
 */
function HomePage() {
  return (
    <>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />
      <BrandHero />
      <BrandStatement />
      <BrandFactory />
      <BrandProductRail />
      <BrandProjectsBento />
      <BrandEntrySplit />
    </>
  );
}
