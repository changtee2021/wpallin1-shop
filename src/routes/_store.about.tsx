import { createFileRoute } from "@tanstack/react-router";

import { AboutView } from "@/components/storefront/about/about-view";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/about")({
  head: () =>
    pageHead({
      title: "เกี่ยวกับ WP ALL | ผู้ผลิตม่าน มู่ลี่ และระบบมอเตอร์",
      description:
        "WP ALL แบรนด์ผ้าม่าน มู่ลี่ ราง และระบบมอเตอร์ สำหรับบ้านและงานโครงการ ปรัชญา C-P-C และความใส่ใจ 6 ขั้นตอนในทุกชิ้นงาน",
      path: "/about",
      image: "/brand/factory-1.webp",
    }),
  component: AboutPage,
});

function AboutPage() {
  return <AboutView />;
}
