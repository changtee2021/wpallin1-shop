import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import {
  PRODUCT_CATEGORIES,
  productsInCategory,
} from "@/data/products-catalog";
import { PROJECT_KIND_LABELS, PROJECTS } from "@/data/projects";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** Left padding that lines a full-bleed row up with the 7xl container. */
const bleedPadding =
  "px-4 sm:px-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]";

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
        <h1 className="mt-0 max-w-3xl text-3xl leading-[1.3] font-medium tracking-tight text-balance sm:text-4xl lg:text-5xl">
          {pick({
            th: "ม่าน มู่ลี่ และระบบมอเตอร์ ผลิตในไทย สั่งทำ พอดีทุกหน้าต่าง",
            en: "Curtains, blinds and motorized systems — made in Thailand, made to fit.",
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
              All Product
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

/** Chapter 3 — the range. On desktop the section pins and the category cards travel sideways. */
export function BrandProductRail() {
  const { t } = useT();
  const pick = useBi();

  return (
    <section className="pin-x bg-cream">
      <div className="pin-x-stage py-20 lg:py-28">
        <div className={cn(container, "w-full")}>
          <SectionHeading
            index="03"
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

        <div className="pin-x-viewport no-scrollbar mt-10 snap-x snap-mandatory scroll-px-4 overflow-x-auto sm:scroll-px-6 lg:mt-12 lg:scroll-px-8">
          <ol className={cn("pin-x-track flex w-max gap-6 pb-2", bleedPadding)}>
            {PRODUCT_CATEGORIES.map((category, index) => {
              const products = productsInCategory(category.id);
              return (
                <li
                  key={category.id}
                  className="scroll-rise w-[80vw] shrink-0 snap-start sm:w-[22rem] lg:w-[24rem]"
                  style={{ ["--i" as string]: Math.min(index, 2) }}
                >
                  <Link
                    to="/products"
                    search={{ category: category.id }}
                    className="group block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface">
                      <img
                        src={category.image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                      />
                      <span className="brand-index absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-foreground">
                        {category.index}
                      </span>
                    </div>
                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h3 className="text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary lg:text-2xl">
                        {pick(category.name)}
                      </h3>
                      <ArrowUpRight
                        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                      {pick(category.description)}
                    </p>
                    <p className="brand-index mt-4 text-muted-foreground">
                      {products.length}{" "}
                      {pick({
                        th: "รายการ",
                        en: products.length === 1 ? "line" : "lines",
                      })}
                    </p>
                  </Link>
                </li>
              );
            })}
            <li className="w-[80vw] shrink-0 snap-start sm:w-[22rem] lg:w-[24rem]">
              <Link
                to="/products"
                className="group flex aspect-[4/3] flex-col justify-between rounded-sm bg-primary-deep p-8 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-cream"
              >
                <span className="brand-kicker text-accent">All products</span>
                <span className="flex items-end justify-between gap-4">
                  <span className="brand-heading">
                    {pick({ th: "ดูสินค้าทั้งหมด", en: "See every product" })}
                  </span>
                  <ArrowRight
                    className="size-6 shrink-0 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

/** Chapter 4 — proof. One large project and four smaller ones, each revealed by a mask. */
export function BrandProjectsBento() {
  const { t } = useT();
  const pick = useBi();
  const projects = PROJECTS.slice(0, 5);

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <SectionHeading
          index="04"
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

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:auto-rows-[17rem] lg:grid-cols-4">
          {projects.map((project, index) => {
            const meta = [
              pick(PROJECT_KIND_LABELS[project.kind]),
              project.location ? pick(project.location) : null,
              project.year,
            ]
              .filter(Boolean)
              .join(" · ");
            const lead = index === 0;

            return (
              <li
                key={project.slug}
                className={cn(
                  "scroll-wipe-up-soft",
                  lead
                    ? "aspect-[4/3] sm:col-span-2 lg:row-span-2 lg:aspect-auto"
                    : "aspect-[4/3] lg:aspect-auto",
                )}
                style={{ ["--i" as string]: lead ? 0 : (index - 1) % 2 }}
              >
                <Link
                  to="/projects/$slug"
                  params={{ slug: project.slug }}
                  className="group relative isolate flex size-full flex-col justify-end overflow-hidden rounded-sm bg-surface p-5 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 lg:p-6"
                >
                  <div className="scroll-zoom absolute inset-0 -z-10">
                    <img
                      src={project.cover}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.72),rgb(0_0_0/0)_60%)]" />
                  <p className="text-xs tracking-wide text-white/75 uppercase">
                    {meta}
                  </p>
                  <h3
                    className={cn(
                      "mt-1 font-medium tracking-tight text-balance",
                      lead ? "text-2xl lg:text-3xl" : "text-lg",
                    )}
                  >
                    {pick(project.title)}
                  </h3>
                  {lead ? (
                    <p className="mt-2 line-clamp-2 max-w-lg text-sm leading-6 text-white/80">
                      {pick(project.summary)}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function BrandEntrySplit() {
  const pick = useBi();
  const entries = [
    {
      to: "/products" as const,
      image: "/home/hero-bedroom-sheer.png",
      kicker: { th: "สำหรับบ้านและที่พักอาศัย", en: "For homes" },
      title: { th: "เลือกม่านให้บ้านคุณ", en: "Dress your home" },
      text: {
        th: "ดูสินค้า ส่งขนาดหน้าต่าง แล้วเราช่วยแนะนำรุ่นที่เหมาะกับห้อง",
        en: "Browse products, send your window sizes and we'll recommend what suits each room.",
      },
      cta: { th: "ดูสินค้า", en: "Browse products" },
    },
    {
      to: "/partners" as const,
      image: "/home/dealer-business-talk.png",
      kicker: {
        th: "สำหรับร้านม่านและผู้รับเหมา",
        en: "For dealers and contractors",
      },
      title: { th: "เป็นตัวแทนจำหน่าย WP ALL", en: "Become a WP ALL dealer" },
      text: {
        th: "ราคาตัวแทน ผลิตตามออเดอร์ และงาน OEM / ODM สำหรับแบรนด์ของคุณ",
        en: "Dealer pricing, made-to-order production and OEM / ODM for your own brand.",
      },
      cta: { th: "ดูโปรแกรมตัวแทน", en: "See the dealer programme" },
    },
  ];

  return (
    <section className="grid md:grid-cols-2">
      {entries.map((entry, index) => (
        <Link
          key={entry.to}
          to={entry.to}
          style={{ ["--i" as string]: index }}
          className="scroll-wipe-up-soft group relative isolate flex min-h-[28rem] flex-col justify-end overflow-hidden p-8 text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-accent sm:p-12 lg:min-h-[36rem]"
        >
          <img
            src={entry.image}
            alt=""
            aria-hidden
            loading="lazy"
            className="scroll-zoom absolute inset-0 -z-10 size-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.7),rgb(0_0_0/0.15))]" />
          <p className="brand-kicker text-white/75">{entry.kicker.en}</p>
          <h2 className="brand-heading mt-3">{pick(entry.title)}</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/80">
            {pick(entry.text)}
          </p>
          <span className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium">
            {pick(entry.cta)}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </Link>
      ))}
    </section>
  );
}
