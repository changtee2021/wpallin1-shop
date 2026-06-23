import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/_store/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader
        title="เกี่ยวกับเรา"
        description="WP All-in-1 — ผู้เชี่ยวชาญด้านผ้าม่านและมู่ลี่ ให้บริการทั้งลูกค้าปลีก โครงการ และตัวแทนจำหน่าย"
      />
      <p className="text-muted-foreground leading-relaxed">
        เนื้อหาหน้านี้จะเชื่อม CMS ใน Phase ถัดไป
      </p>
    </div>
  );
}
