import { createFileRoute } from "@tanstack/react-router";

import {
  BrandChooseGuide,
  BrandHero,
  BrandProductRail,
  BrandProjectsBento,
  BrandSmartMotor,
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
        "WP ALL IN 1 แบรนด์ผ้าม่าน มู่ลี่ ม่านม้วน ฉากกั้นห้อง PVC รางม่าน และระบบมอเตอร์อัจฉริยะ สั่งทำตามขนาด สำหรับบ้าน โครงการ และตัวแทนจำหน่าย",
      path: "/",
      image: "/home/hero-living-curtains.png",
    }),
  component: HomePage,
});

/**
 * Story order: promise → range → projects → craftsmanship → partner steps (footer closes with the contact CTA).
 * W-P-A-L-L values live on the About page only.
 * Chapter numbers 01–06 are printed in each section heading; backgrounds alternate white / cream / white / deep / surface.
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
      <BrandProductRail />
      <BrandSmartMotor />
      <BrandProjectsBento />
      <BrandFactory />
      <BrandChooseGuide />
    </>
  );
}
