import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/data/products-catalog";
import { PROJECT_KIND_LABELS, PROJECTS, type Project } from "@/data/projects";
import { SMART_MOTOR_TYPES } from "@/data/smart-motor";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const HERO_SLIDES: { src: string; caption: Bi }[] = [
  {
    src: "/home/hero-living-curtains.png",
    caption: {
      th: "ม่านจีบเต็มบาน ห้องนั่งเล่น",
      en: "Full-height pleated curtains, living room",
    },
  },
  {
    src: "/products/wood-blinds.webp",
    caption: { th: "มู่ลี่ไม้ Basswood", en: "Basswood wooden blinds" },
  },
  {
    src: "/home/hero-bedroom-sheer.png",
    caption: {
      th: "ม่านโปร่งคู่ม่านทึบ ห้องนอน",
      en: "Sheer and blackout layers, bedroom",
    },
  },
];

const HERO_INTERVAL_MS = 6500;

export function BrandHero() {
  const pick = useBi();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % HERO_SLIDES.length),
      HERO_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [active]);

  return (
    <section className="scroll-hero-card relative isolate overflow-hidden bg-primary-deep text-white">
      <div className="scroll-parallax absolute inset-0 -z-10">
        {HERO_SLIDES.map((slide, index) => (
          <img
            key={slide.src}
            src={slide.src}
            alt=""
            aria-hidden
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : undefined}
            className={cn(
              "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1600ms] ease-out",
              index === active
                ? "scale-100 opacity-100"
                : "scale-[1.04] opacity-0",
            )}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.72),rgb(0_0_0/0.28)_55%,rgb(0_0_0/0.3))]" />
      </div>

      <div
        className={cn(
          container,
          "scroll-fade-away flex min-h-svh flex-col justify-end pt-28 pb-10 lg:pb-14",
        )}
      >
        <p
          className="hero-blur-in brand-kicker flex items-center gap-3 text-white/75"
          style={{ ["--delay" as string]: "100ms" }}
        >
          <span aria-hidden className="h-px w-8 bg-accent" />
          Made in Thailand · Made to measure
        </p>
        <h1 className="mt-5 max-w-4xl text-4xl leading-[1.2] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {pick({
            th: "พอดีทุกหน้าต่าง สวยทุกมุมห้อง",
            en: "Made to fit every window. Made to be lived with.",
          })
            .split(" ")
            .map((phrase, index) => (
              <span
                key={index}
                className="hero-word inline-block whitespace-nowrap"
                style={{ ["--i" as string]: index }}
              >
                {phrase}
                {"\u00a0"}
              </span>
            ))}
        </h1>
        <p
          className="hero-blur-in mt-5 max-w-xl text-base leading-7 text-white/80 text-pretty sm:text-lg sm:leading-8"
          style={{ ["--delay" as string]: "500ms" }}
        >
          {pick({
            th: "ม่าน มู่ลี่ และระบบมอเตอร์ ออกแบบให้เข้ากับทุกพื้นที่ สั่งทำตามขนาดจริงทุกชิ้น",
            en: "Curtains, blinds and motorized systems, designed for every space and made to the exact size of every window.",
          })}
        </p>
        <div
          className="hero-blur-in mt-8 flex items-center justify-between gap-6"
          style={{ ["--delay" as string]: "650ms" }}
        >
          <Button
            size="lg"
            className="h-12 rounded-full bg-accent px-6 text-white hover:bg-accent/90"
            asChild
          >
            <Link to="/products">
              {pick({ th: "ดูสินค้าทั้งหมด", en: "Explore products" })}
              <ArrowRight className="ml-1 size-4" aria-hidden />
            </Link>
          </Button>
          <div className="flex gap-2">
            {HERO_SLIDES.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`${index + 1} — ${pick(slide.caption)}`}
                aria-current={index === active}
                className="group flex h-11 w-10 items-center"
              >
                <span
                  className={cn(
                    "h-0.5 w-full transition-colors",
                    index === active
                      ? "bg-accent"
                      : "bg-white/35 group-hover:bg-white/70",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Alternate products between the two rows so each row mixes categories. */
const MARQUEE_ROWS = [0, 1].map((row) =>
  CATALOG_PRODUCTS.filter((_, index) => index % 2 === row),
);

const MARQUEE_SECONDS_PER_CARD = 5;

function MarqueeCard({
  product,
  hidden,
}: {
  product: CatalogProduct;
  hidden?: boolean;
}) {
  const pick = useBi();

  return (
    <li className="w-[15rem] shrink-0 sm:w-[17rem] lg:w-[19rem]">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        tabIndex={hidden ? -1 : undefined}
        className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
          <img
            src={product.image}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
          />
        </div>
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <h3 className="truncate text-lg font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
            {pick(product.name)}
          </h3>
          <ArrowUpRight
            className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            aria-hidden
          />
        </div>
      </Link>
    </li>
  );
}

/** Chapter 2 — the range. Two rows of products drift in opposite directions and pause under the pointer. */
export function BrandProductRail() {
  const { t } = useT();
  const pick = useBi();

  return (
    <section className="overflow-hidden bg-cream py-20 lg:py-28">
      <div>
        <div className={container}>
          <SectionHeading
            index="02"
            kicker="Our products"
            title={pick({
              th: "ครบทุกอย่างสำหรับหน้าต่าง ในที่เดียว",
              en: "Everything for the window, in one place",
            })}
            description={pick({
              th: "ทุกรายการสั่งผลิตตามขนาด ขอใบเสนอราคาได้ฟรี",
              en: "Every item is made to measure. Quotes are free.",
            })}
            action={
              <Link
                to="/products"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
              >
                {t("site.cta.viewAll")}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            }
          />
        </div>

        <div className="mt-10 flex flex-col gap-7 lg:mt-12 lg:gap-8">
          {MARQUEE_ROWS.map((products, row) => (
            <div
              key={row}
              className="product-marquee no-scrollbar"
              data-reverse={row === 1 ? "" : undefined}
              style={{
                ["--marquee-duration" as string]: `${products.length * MARQUEE_SECONDS_PER_CARD}s`,
              }}
            >
              <div className="product-marquee-track">
                {[false, true].map((hidden) => (
                  <ul
                    key={String(hidden)}
                    aria-hidden={hidden || undefined}
                    className="product-marquee-group"
                  >
                    {products.map((product) => (
                      <MarqueeCard
                        key={product.slug}
                        product={product}
                        hidden={hidden}
                      />
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Home shows exactly these three, in this order. */
const FEATURED_PROJECT_SLUGS = [
  "colors-of-buriram-2025",
  "bangkok-design-week-2025",
  "merit-and-woranakorn",
] as const;

/**
 * Chapter 3 — proof. One full-width project at a time; each next project
 * slides up and covers the previous one (CSS sticky stack, no JS).
 */
export function BrandProjectsBento() {
  const { t } = useT();
  const pick = useBi();
  const projects = FEATURED_PROJECT_SLUGS.map((slug) =>
    PROJECTS.find((project) => project.slug === slug),
  ).filter((project): project is Project => Boolean(project));

  return (
    <section className="brand-section relative isolate bg-background">
      <div className={container}>
        <SectionHeading
          index="03"
          kicker="Projects"
          title={pick({
            th: "งานจริงจากโครงการและตัวแทนของเรา",
            en: "Real work from our projects and dealers",
          })}
          action={
            <Link
              to="/projects"
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
            >
              {t("site.cta.viewAll")}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          }
        />

        <ul className="mt-12">
          {projects.map((project, index) => {
            const meta = [
              pick(PROJECT_KIND_LABELS[project.kind]),
              project.location ? pick(project.location) : null,
              project.year,
            ]
              .filter(Boolean)
              .join(" · ");
            const last = index === projects.length - 1;

            return (
              <li
                key={project.slug}
                className={cn(
                  "sticky top-20 lg:top-24",
                  last ? undefined : "pb-[14svh]",
                )}
                style={{ zIndex: index + 1 }}
              >
                <Link
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="group relative isolate flex h-[68svh] min-h-[22rem] w-full flex-col justify-end overflow-hidden rounded-md bg-surface p-6 text-white shadow-[0_-12px_40px_rgb(0_0_0/0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 sm:p-8 lg:h-[72svh] lg:p-10"
                >
                  <img
                    src={project.cover}
                    alt=""
                    aria-hidden
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className="absolute inset-0 -z-10 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.75),rgb(0_0_0/0)_60%)]" />
                  <p className="text-xs tracking-wide text-white/75 uppercase">
                    {meta}
                  </p>
                  <h3 className="mt-1 text-2xl font-medium tracking-tight text-balance lg:text-4xl">
                    {pick(project.title)}
                  </h3>
                  <p className="mt-2 line-clamp-2 max-w-xl text-sm leading-6 text-white/80 lg:text-base">
                    {pick(project.summary)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/** Chapter 4 — Smart Motor: one photo, three controls, five types. Detail lives on /smart-motor. */
export function BrandSmartMotor() {
  const pick = useBi();

  return (
    <section className="brand-section bg-cream">
      <div className={container}>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="scroll-rise relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
            <img
              src="/products/motorized-track.webp"
              alt={pick({
                th: "รางม่านมอเตอร์ WP ALL",
                en: "WP ALL motorised curtain track",
              })}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>

          <div>
            <SectionHeading
              index="04"
              kicker="Smart Motor"
              title={pick({
                th: "ม่านและมู่ลี่ทุกแบบ ติดมอเตอร์ได้",
                en: "Every curtain and blind, made smart.",
              })}
              description={pick({
                th: "เปิด-ปิดจากรีโมท สวิตช์ติดผนัง หรือมือถือ",
                en: "Run it from a remote, a wall switch or your phone.",
              })}
            />

            <ul className="mt-8 divide-y divide-border border-y border-border">
              {SMART_MOTOR_TYPES.map((type, index) => (
                <li
                  key={type.id}
                  className="flex min-h-12 items-baseline gap-4 py-3"
                >
                  <span className="brand-index w-6 shrink-0 text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium tracking-tight text-foreground lg:text-lg">
                    {type.title}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              to="/smart-motor"
              className="group mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
            >
              {pick({
                th: "ดู Smart Motor ทั้งหมด",
                en: "Explore Smart Motor",
              })}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const CHOOSE_STEPS: { title: Bi; text: Bi }[] = [
  {
    title: { th: "วัดขนาดหน้าต่าง", en: "Measure your window" },
    text: {
      th: "วัดความกว้างและความสูงของหน้าต่างหรือผนังที่จะติดตั้ง วัดหลายจุดแล้วใช้ค่าที่ต้องการให้ม่านคลุม",
      en: "Measure the width and height of the window or wall. Check a few points and use the size you want the curtain to cover.",
    },
  },
  {
    title: { th: "เลือกตามห้องและแสง", en: "Match the room and light" },
    text: {
      th: "ห้องนอนมักใช้ม่านทึบคู่ม่านโปร่ง ห้องนั่งเล่นเน้นความโปร่งและลวดลาย ห้องน้ำหรือครัวเลือกวัสดุที่ทนความชื้น",
      en: "Bedrooms often pair blackout with sheer. Living rooms favour airy fabric and pattern. Bathrooms and kitchens need moisture-friendly materials.",
    },
  },
  {
    title: { th: "เลือกวิธีเปิด-ปิด", en: "Choose how it opens" },
    text: {
      th: "เปิดด้วยมือ ดึงโซ่ หรือติดมอเตอร์ควบคุมผ่านรีโมทและมือถือ เหมาะกับหน้าต่างบานสูงหรือบานกว้าง",
      en: "Open by hand, by chain, or add a motor with remote and phone control — handy for tall or wide windows.",
    },
  },
  {
    title: { th: "ส่งขนาดให้เรา", en: "Send us your sizes" },
    text: {
      th: "ส่งขนาดและรูปหน้าต่าง ทีมงานช่วยแนะนำรุ่นที่เหมาะ แล้วผลิตตามขนาดจริงของคุณ",
      en: "Share your sizes and a photo. Our team recommends a fit, then makes it to your exact measurements.",
    },
  },
];

/** Chapter 5 — how to choose curtains for your home. Explains the path from window to order. */
export function BrandChooseGuide() {
  const pick = useBi();

  return (
    <section className="brand-section relative isolate border-t border-border bg-surface">
      <div className={container}>
        <SectionHeading
          index="06"
          kicker="For homes"
          title={pick({
            th: "เลือกม่านให้บ้านคุณยังไงดี",
            en: "How to choose curtains for your home",
          })}
          description={pick({
            th: "สี่ขั้นตอนสั้นๆ ตั้งแต่วัดหน้าต่าง จนได้ม่านที่พอดีกับห้อง",
            en: "Four short steps, from measuring the window to a curtain that fits the room.",
          })}
        />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-black/10 lg:sticky lg:top-28">
            <img
              src="/home/hero-bedroom-sheer.png"
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          </div>

          <div>
            <ol className="divide-y divide-border border-y border-border">
              {CHOOSE_STEPS.map((step, index) => (
                <li
                  key={step.title.en}
                  className="scroll-rise flex items-start gap-5 py-7 lg:gap-7 lg:py-9"
                  style={{ ["--i" as string]: index }}
                >
                  <span className="text-4xl leading-none font-medium tracking-tight text-accent lg:text-5xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-medium tracking-tight text-foreground lg:text-xl">
                      {pick(step.title)}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground lg:text-base">
                      {pick(step.text)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Button
                size="lg"
                className="h-12 rounded-full bg-accent px-6 text-white hover:bg-accent/90"
                asChild
              >
                <Link to="/products">
                  {pick({ th: "ดูสินค้า", en: "Browse products" })}
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
              <Link
                to="/contact"
                search={{ topic: "quote" }}
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
              >
                {pick({ th: "ส่งขนาดขอคำแนะนำ", en: "Send sizes for advice" })}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
