import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { CountUpNumber } from "@/components/storefront/home/count-up-number";
import { CATALOG_PRODUCTS } from "@/data/products-catalog";
import { ABOUT_IMAGES, ABOUT_PROCESS } from "@/data/about-content";
import { useBi, type Bi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const STATEMENT: Bi = {
  th: "ทุกหน้าต่างไม่เหมือนกัน เราจึงผลิตเองทุกชิ้น ตัด ประกอบ และตรวจคุณภาพ ในโรงงานเดียว ตามขนาดจริงของหน้างานคุณ",
  en: "No two windows are alike. So we make every piece ourselves — cut, assembled and checked in one factory, to the size of your window.",
};

const USP_ITEMS: { title: Bi; text: Bi }[] = [
  {
    title: { th: "ผลิตเองในโรงงาน", en: "Made in our own factory" },
    text: {
      th: "ตัด ประกอบ และตรวจคุณภาพที่คลองสามวา กรุงเทพฯ",
      en: "Cut, assembled and checked in Khlong Sam Wa, Bangkok",
    },
  },
  {
    title: { th: "สั่งทำตามขนาดจริง", en: "Made to order" },
    text: {
      th: "ผลิตตามขนาดหน้างาน ไม่ต้องปรับหน้าต่างให้เข้ากับสินค้า",
      en: "Built to your measurements, not the other way round",
    },
  },
  {
    title: { th: "Dealer / OEM / ODM", en: "Dealer / OEM / ODM" },
    text: {
      th: "ผลิตให้ร้านม่านและแบรนด์ทั่วประเทศ",
      en: "Manufacturing partner for curtain shops and brands",
    },
  },
  {
    title: { th: "ระบบมอเตอร์อัจฉริยะ", en: "Smart motorized systems" },
    text: {
      th: "รางมอเตอร์เงียบ ควบคุมผ่านรีโมทและมือถือ",
      en: "Quiet motors with remote and mobile control",
    },
  },
];

/** Chapter 1 — the promise. Words light up one by one as the sentence scrolls into view. */
export function BrandStatement() {
  const pick = useBi();
  const words = pick(STATEMENT).split(" ");

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <p className="brand-kicker flex items-center gap-3 text-primary">
          <span className="brand-index text-muted-foreground">01</span>
          <span aria-hidden className="h-px w-8 bg-border" />
          Why WP ALL
        </p>
        <p className="mt-8 max-w-5xl text-3xl leading-[1.4] font-medium tracking-tight text-balance text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.35]">
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="scroll-word inline-block"
              style={{ ["--i" as string]: index }}
            >
              {word}
              {"\u00a0"}
            </span>
          ))}
        </p>

        <ul className="mt-16 grid divide-y divide-border border-t border-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          {USP_ITEMS.map((item, index) => (
            <li
              key={item.title.en}
              className="scroll-rise flex gap-4 py-7 sm:px-2 lg:px-6 lg:first:pl-0 lg:last:pr-0"
              style={{ ["--i" as string]: index }}
            >
              <span className="brand-index pt-0.5 text-accent">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h2 className="text-base font-medium text-foreground">
                  {pick(item.title)}
                </h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {pick(item.text)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Which factory photo belongs to each of the six production steps. */
const STEP_PHOTO = [3, 0, 0, 2, 3, 1] as const;

/** Chapter 2 — the factory, right after the promise so proof comes early. One screen: photo + six steps that expand on tap or hover. */
export function BrandFactory() {
  const pick = useBi();
  const [active, setActive] = useState(0);

  const stats: { value: string; label: Bi }[] = [
    {
      value: String(CATALOG_PRODUCTS.length),
      label: { th: "รายการสินค้า", en: "Product lines" },
    },
    {
      value: "38",
      label: {
        th: "สีมู่ลี่อลูมิเนียม 25 มม.",
        en: "Aluminium blind colours (25 mm)",
      },
    },
    {
      value: "120 kg",
      label: {
        th: "รับน้ำหนักรางมอเตอร์ Nano Power",
        en: "Nano Power motor load",
      },
    },
    {
      value: "6 m",
      label: {
        th: "ความยาวรางมอเตอร์ต่อเส้น",
        en: "Motor track length per run",
      },
    },
  ];

  return (
    <section className="brand-section relative z-10 -mt-10 rounded-t-[2rem] bg-primary-deep text-white lg:-mt-16 lg:rounded-t-[3rem]">
      <div className={container}>
        <SectionHeading
          tone="dark"
          index="02"
          kicker="Our factory"
          title={pick({
            th: "จากวัสดุ สู่ชิ้นงานที่พอดีหน้าต่าง",
            en: "From raw material to a perfect fit",
          })}
          description={pick({
            th: "ทุกออเดอร์ผ่าน 6 ขั้นตอนในโรงงานของเราที่คลองสามวา กรุงเทพฯ",
            en: "Every order goes through six steps in our factory in Khlong Sam Wa, Bangkok.",
          })}
        />

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-stretch lg:gap-14">
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-black/20 lg:aspect-auto lg:min-h-[28rem]">
            {ABOUT_IMAGES.factory.map((src, photo) => (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className={cn(
                  "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-out",
                  STEP_PHOTO[active] === photo
                    ? "scale-100 opacity-100"
                    : "scale-[1.05] opacity-0",
                )}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 lg:p-6">
              <p className="text-lg font-medium text-white lg:text-xl">
                {pick(ABOUT_PROCESS[active].title)}
              </p>
              <span className="brand-index shrink-0 rounded-full bg-black/45 px-3 py-1.5 text-white backdrop-blur-sm">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(ABOUT_PROCESS.length).padStart(2, "0")}
              </span>
            </div>
          </div>

          <ol className="flex flex-col lg:justify-center">
            {ABOUT_PROCESS.map((step, index) => {
              const open = active === index;
              return (
                <li
                  key={step.title.en}
                  className="border-t border-white/15 last:border-b"
                  onMouseEnter={() => setActive(index)}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setActive(index)}
                    onFocus={() => setActive(index)}
                    className="flex min-h-14 w-full items-center gap-5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span
                      className={cn(
                        "brand-index w-6 shrink-0 transition-colors",
                        open ? "text-accent" : "text-white/40",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-lg font-medium tracking-tight transition-colors lg:text-xl",
                        open ? "text-white" : "text-white/55",
                      )}
                    >
                      {pick(step.title)}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "h-px bg-accent transition-[width] duration-500",
                        open ? "w-8" : "w-0",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows] duration-500 ease-out",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <p className="overflow-hidden pl-11 text-sm leading-6 text-white/70">
                      <span className="block pb-4">{pick(step.body)}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-12 flex flex-col gap-8 border-t border-white/15 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label.en}>
                <dd className="text-3xl font-medium tracking-tight text-white lg:text-4xl">
                  <CountUpNumber value={stat.value} />
                </dd>
                <dt className="mt-1 text-xs leading-5 text-white/60">
                  {pick(stat.label)}
                </dt>
              </div>
            ))}
          </dl>
          <Link
            to="/about"
            className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-white"
          >
            {pick({ th: "รู้จัก WP ALL", en: "Meet WP ALL" })}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
