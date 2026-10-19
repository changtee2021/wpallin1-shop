import { createFileRoute } from "@tanstack/react-router";

import { ContactCtaBand } from "@/components/brand/contact-cta";
import {
  SmartMotorControl,
  SmartMotorFeatures,
  SmartMotorHero,
  SmartMotorModels,
  SmartMotorNumbers,
  SmartMotorTypes,
} from "@/components/storefront/smart-motor/smart-motor-sections";
import { pageHead } from "@/lib/seo";
import { bi } from "@/lib/bi";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/_store/smart-motor")({
  head: ({ match }) =>
    pageHead({
      locale: match.context.locale,
      title: bi(match.context.locale ?? "th", PAGE_META.smartMotor.title),
      description: bi(
        match.context.locale ?? "th",
        PAGE_META.smartMotor.description,
      ),
      path: "/smart-motor",
      image: "/products/motorized-track.webp",
    }),
  component: SmartMotorPage,
});

/**
 * Technology-product story: wide hero → numbers → how it works → control → models → compatibility.
 * Motion is CSS scroll-timeline only (see styles.css), so there is no JS on scroll.
 */
function SmartMotorPage() {
  return (
    <>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />
      <SmartMotorHero />
      <SmartMotorNumbers />
      <SmartMotorFeatures />
      <SmartMotorControl />
      <SmartMotorModels />
      <SmartMotorTypes />
      <ContactCtaBand
        kicker="Smart Motor"
        title={{
          th: "อยากได้ม่านหรือมู่ลี่แบบติดมอเตอร์?",
          en: "Want motorised curtains or blinds?",
        }}
        description={{
          th: "บอกประเภทและขนาดหน้างาน ทีมงานช่วยเลือกระบบที่เหมาะให้ คุยกับเราได้ทาง LINE",
          en: "Tell us the type and size. Our team will help you choose the right system. Reach us on LINE.",
        }}
      />
    </>
  );
}
