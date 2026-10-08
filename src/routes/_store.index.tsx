import { createFileRoute, redirect } from "@tanstack/react-router";

import { BrandChannels } from "@/components/storefront/home/brand-channels-section";
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
import { DEALER_ONLY_PURCHASE } from "@/lib/features";
import { pageHead } from "@/lib/seo";
import { buildOrganizationJsonLd } from "@/lib/seo-structured-data";

export const Route = createFileRoute("/_store/")({
  beforeLoad: () => {
    if (DEALER_ONLY_PURCHASE) throw redirect({ to: "/shop", replace: true });
  },
  head: () =>
    pageHead({
      title: "WP ALL | Perfect Fit Curtains, Blinds & Smart Motor Systems",
      description:
        "ม่าน มู่ลี่ ที่ใส่ใจทุกรายละเอียด ให้ทุกหน้าต่างพอดี และทุกมุมห้องสวย ด้วยดีไซน์ ฟังก์ชัน และเทคโนโลยีมอเตอร์อัจฉริยะ",
      path: "/",
      image: "/home/hero-living-curtains.png",
      jsonLd: buildOrganizationJsonLd(),
    }),
  component: HomePage,
});

/**
 * Story order: promise → range → projects → craftsmanship → partner steps → ordering website and app (footer closes with the contact CTA).
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
      <BrandChannels />
    </>
  );
}
