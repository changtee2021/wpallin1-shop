import { FileText, Package, Percent, Wallet } from "lucide-react";

import { ABOUT_PARTNER_CHIPS } from "@/data/about-content";

const benefits = [
  {
    icon: Percent,
    title: "ราคาตัวแทน",
    desc: "ราคาส่งจากโรงงาน WP ALL โดยตรง",
  },
  {
    icon: Package,
    title: "Quick order SKU",
    desc: "สั่งด้วยรหัสสินค้า ไม่ต้องค้นหาทีละชิ้น",
  },
  {
    icon: FileText,
    title: "ใบเสนอราคา",
    desc: "ออกใบเสนอราคาให้ลูกค้าปลายทางของคุณ",
  },
  {
    icon: Wallet,
    title: "Wallet / เครดิต",
    desc: "ชำระสะดวกและติดตามยอดในพอร์ทัล",
  },
];

export function DealerRegisterBenefits() {
  return (
    <aside className="rounded-2xl border bg-muted/30 p-6">
      <h2 className="text-lg font-bold text-primary">สิทธิ์ตัวแทน WP ALL</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        สำหรับร้านค้าปลีก ขายส่ง งานโครงการ นักออกแบบ และช่าง —
        สั่งจากโรงงานโดยตรง
      </p>
      <ul className="mt-4 flex flex-wrap gap-1.5">
        {ABOUT_PARTNER_CHIPS.map((chip) => (
          <li
            key={chip.value}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground"
          >
            {chip.th}
          </li>
        ))}
      </ul>
      <ul className="mt-5 space-y-4">
        {benefits.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs text-muted-foreground">
        ทีมงานตรวจสอบใบสมัครภายใน 1–3 วันทำการ
      </p>
    </aside>
  );
}
