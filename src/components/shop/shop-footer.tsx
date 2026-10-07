import { Link } from "@tanstack/react-router";
import { MessageCircle, Phone } from "lucide-react";

import { siteConfig } from "@/lib/site-config";

const brandLink = (path: string) =>
  `${siteConfig.websiteUrl.replace(/\/$/, "")}${path}`;

const BRAND_LINKS = [
  { label: "เว็บไซต์หลัก", href: brandLink("/") },
  { label: "ผลงาน", href: brandLink("/projects") },
  { label: "แคตตาล็อก", href: brandLink("/catalogs") },
  { label: "เกี่ยวกับเรา", href: brandLink("/about") },
];

export function ShopFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div className="max-w-sm">
          <img
            src="/brand/logo-color.png"
            alt="WP ALL"
            className="h-9 w-auto"
            loading="lazy"
          />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            ร้านค้าออนไลน์สำหรับตัวแทนจำหน่าย WP ALL — ราคาโรงงาน สั่งซ้ำง่าย
            ติดตามออเดอร์ได้ในที่เดียว
          </p>
        </div>

        <nav aria-label="WP ALL">
          <p className="text-sm font-medium">WP ALL</p>
          <ul className="mt-3 space-y-1">
            {BRAND_LINKS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="inline-flex min-h-9 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-medium">ติดต่อทีมขาย</p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            <li>
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-9 items-center gap-2 hover:text-foreground"
              >
                <MessageCircle className="size-4" aria-hidden />
                LINE {siteConfig.lineId}
              </a>
            </li>
            <li>
              <a
                href={`tel:${siteConfig.phoneTel}`}
                className="inline-flex min-h-9 items-center gap-2 hover:text-foreground"
              >
                <Phone className="size-4" aria-hidden />
                {siteConfig.phoneDisplay}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <p>
            © {year} {siteConfig.legalName}
          </p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              ข้อกำหนดการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
