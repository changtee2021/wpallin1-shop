import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Headset,
  MessageCircle,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { Button } from "@/components/ui/button";
import { CATALOG_PRODUCTS, type CatalogProduct } from "@/data/products-catalog";
import { PROJECT_KIND_LABELS, PROJECTS, type Project } from "@/data/projects";
import { SMART_MOTOR_TYPES, smartMotorImage } from "@/data/smart-motor";
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
        <h1 className="max-w-4xl text-4xl leading-[1.2] font-medium tracking-tight text-balance sm:text-5xl lg:text-6xl">
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
        <div className="mt-5 flex items-end justify-between gap-6">
          <p
            className="hero-blur-in max-w-xl text-base leading-7 text-white/80 text-pretty whitespace-pre-line sm:text-lg sm:leading-8"
            style={{ ["--delay" as string]: "500ms" }}
          >
            {pick({
              th: "Solutions ม่าน มู่ลี่ และระบบมอเตอร์\nที่ผสานดีไซน์ ฟังก์ชัน และเทคโนโลยี ให้ลงตัวกับทุกพื้นที่",
              en: "Curtain, blind and motorized solutions\nthat bring design, function and technology together for every space.",
            })}
          </p>
          <div
            className="hero-blur-in flex shrink-0 translate-y-[22px] gap-2"
            style={{ ["--delay" as string]: "650ms" }}
          >
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
            hideKicker
            index="02"
            kicker="Our products"
            title="Everything for the window, in one place"
            description={pick({
              th: "ครบทุกอย่างสำหรับหน้าต่าง ในที่เดียว",
              en: "",
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

/** Chapter 3 — Smart Motor, ahead of the projects: every curtain and blind can be motorised. */
export function BrandSmartMotor() {
  const pick = useBi();

  return (
    <section className="brand-section relative isolate bg-primary-deep text-white">
      <div className={container}>
        <SectionHeading
          hideKicker
          tone="dark"
          index="03"
          kicker="Smart Motor"
          title="Motors for every curtain and blind"
          description={pick({
            th: "ม่านและมู่ลี่ทุกแบบ ติดมอเตอร์ได้",
            en: "",
          })}
          action={
            <Link
              to="/smart-motor"
              className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-white"
            >
              {pick({ th: "ดู Smart Motor", en: "Explore Smart Motor" })}
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          }
        />

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {SMART_MOTOR_TYPES.map((type, index) => {
            const image = smartMotorImage(type);
            return (
              <li
                key={type.id}
                className="scroll-wipe-up-soft"
                style={{ ["--i" as string]: index % 3 }}
              >
                <Link
                  to="/smart-motor"
                  className="group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-sm bg-black/20 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-primary-deep"
                >
                  {image ? (
                    <div className="scroll-zoom absolute inset-0 -z-10">
                      <img
                        src={image}
                        alt=""
                        aria-hidden
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                  ) : null}
                  <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(0_0_0/0.78),rgb(0_0_0/0.05)_65%)]" />
                  <p className="text-xs tracking-wide text-white/70 uppercase">
                    {type.kind === "curtain"
                      ? pick({ th: "ม่าน", en: "Curtain" })
                      : pick({ th: "มู่ลี่", en: "Blind" })}
                  </p>
                  <h3 className="mt-1 text-lg font-medium tracking-tight text-balance">
                    {type.title}
                  </h3>
                </Link>
              </li>
            );
          })}
        </ul>
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
 * Chapter 4 — proof. One full-width project at a time; each next project
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
          hideKicker
          index="04"
          kicker="Projects"
          title="Real work from our projects and dealers"
          description={pick({
            th: "งานจริงจากโครงการและตัวแทนของเรา",
            en: "",
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

type PartnerStep = {
  icon: LucideIcon;
  title: Bi;
  text: Bi;
  tags: Bi[];
};

/** How a shop becomes a WP ALL partner, in the order it happens. */
const PARTNER_STEPS: PartnerStep[] = [
  {
    icon: MessageCircle,
    title: { th: "ติดต่อทีมงาน", en: "Get in touch" },
    text: {
      th: "ติดต่อเราผ่านช่องทางที่สะดวก ทั้ง LINE โทรศัพท์ หรือแบบฟอร์มบนเว็บไซต์",
      en: "Reach us through LINE, phone or the online form, whichever suits you.",
    },
    tags: [
      { th: "LINE", en: "LINE" },
      { th: "โทรศัพท์", en: "Phone" },
      { th: "แบบฟอร์มออนไลน์", en: "Online form" },
    ],
  },
  {
    icon: BadgeCheck,
    title: { th: "ลงทะเบียนเป็นพาร์ทเนอร์", en: "Register as a partner" },
    text: {
      th: "เปิดบัญชีผู้จำหน่าย (Vendor) เพื่อรับสิทธิ์และเงื่อนไขสำหรับพาร์ทเนอร์",
      en: "Open your vendor account to unlock partner terms and benefits.",
    },
    tags: [
      { th: "บัญชีผู้จำหน่าย", en: "Vendor account" },
      { th: "ราคาตัวแทน", en: "Dealer pricing" },
    ],
  },
  {
    icon: Headset,
    title: { th: "ทีมขายดูแลประจำ", en: "Dedicated sales support" },
    text: {
      th: "มีเจ้าหน้าที่ขายดูแลบัญชีของคุณโดยเฉพาะ ให้คำปรึกษาตลอดการทำงาน",
      en: "A sales representative is assigned to your account and advises you throughout.",
    },
    tags: [
      { th: "ผู้ดูแลบัญชี", en: "Account manager" },
      { th: "ให้คำปรึกษา", en: "Advice" },
    ],
  },
  {
    icon: BookOpen,
    title: {
      th: "รับแคตตาล็อกและข้อมูลสินค้า",
      en: "Receive catalogues and product information",
    },
    text: {
      th: "จัดส่งแคตตาล็อกและข้อมูลสินค้าตามที่คุณต้องการ",
      en: "We send the catalogues and product details you need.",
    },
    tags: [
      { th: "แคตตาล็อก", en: "Catalogues" },
      { th: "ข้อมูลสินค้า", en: "Product details" },
    ],
  },
  {
    icon: PackageCheck,
    title: { th: "สั่งซื้ออย่างสะดวก", en: "Order with ease" },
    text: {
      th: "สั่งซื้อผ่านทีมขายของเรา และผ่านเว็บไซต์เมื่อระบบพร้อมให้บริการ",
      en: "Place orders through your sales representative, and on our website once the system is ready.",
    },
    tags: [
      { th: "สั่งผ่านทีมขาย", en: "Via sales team" },
      { th: "สั่งผ่านเว็บไซต์", en: "Via website" },
    ],
  },
];

/**
 * Chapter 7 — how a shop becomes a partner. A pinned stage on the left changes scene
 * as each step on the right scrolls through the middle of the screen.
 */
export function BrandChooseGuide() {
  const pick = useBi();
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = itemRefs.current.filter((node): node is HTMLLIElement =>
      Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const total = PARTNER_STEPS.length;
  const pad = (value: number) => String(value).padStart(2, "0");

  return (
    <section className="brand-section relative isolate border-t border-border bg-surface">
      <div className={container}>
        <SectionHeading
          hideKicker
          index="06"
          kicker="Partner onboarding"
          title="Become a WP ALL partner"
          description={pick({
            th: "ขั้นตอนที่ชัดเจน ตั้งแต่การติดต่อครั้งแรก จนถึงการสั่งซื้อและการดูแลต่อเนื่อง",
            en: "",
          })}
        />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-16">
          {/* Pinned stage: decorative, the list carries the real content. */}
          <div
            aria-hidden
            className="relative hidden aspect-[4/5] overflow-hidden rounded-md bg-primary-deep text-white lg:sticky lg:top-28 lg:block"
          >
            <img
              src="/home/dealer-business-talk.png"
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 size-full scale-105 object-cover opacity-40 transition-transform duration-1000 ease-out"
              style={{ transform: "scale(" + (1.05 + active * 0.025) + ")" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/60 to-primary-deep/30" />

            <p className="brand-index absolute top-6 left-6 text-white/70">
              {pad(active + 1)} / {pad(total)}
            </p>

            {PARTNER_STEPS.map((step, index) => {
              const Icon = step.icon;
              const on = index === active;
              return (
                <div
                  key={step.title.en}
                  className={cn(
                    "absolute inset-0 flex flex-col items-center justify-center gap-6 p-10 text-center transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none",
                    on
                      ? "translate-y-0 opacity-100 blur-0"
                      : "pointer-events-none translate-y-8 opacity-0 blur-sm",
                  )}
                >
                  <span className="relative flex size-28 items-center justify-center">
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full border border-accent/60",
                        on && "motion-safe:animate-ping",
                      )}
                    />
                    <span className="absolute inset-2 rounded-full bg-white/10 ring-1 ring-white/25" />
                    <Icon className="relative size-11 text-accent" />
                  </span>
                  <p className="text-2xl font-medium tracking-tight text-balance lg:text-3xl">
                    {pick(step.title)}
                  </p>
                  <ul className="flex flex-wrap justify-center gap-2">
                    {step.tags.map((tag) => (
                      <li
                        key={tag.en}
                        className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs text-white/85"
                      >
                        {pick(tag)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="absolute inset-x-6 bottom-6 flex gap-1.5">
              {PARTNER_STEPS.map((step, index) => (
                <span
                  key={step.title.en}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  <span
                    className={cn(
                      "block h-full origin-left bg-accent transition-transform duration-700 ease-out motion-reduce:transition-none",
                      index <= active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              ))}
            </div>
          </div>

          <div>
            <ol>
              {PARTNER_STEPS.map((step, index) => {
                const Icon = step.icon;
                const on = index === active;
                const passed = index < active;
                const last = index === total - 1;
                return (
                  <li
                    key={step.title.en}
                    ref={(node) => {
                      itemRefs.current[index] = node;
                    }}
                    data-index={index}
                    className="relative flex gap-5 pb-14 lg:min-h-[44svh] lg:gap-7 lg:pb-0"
                  >
                    {!last ? (
                      <span
                        aria-hidden
                        className="absolute top-12 bottom-0 left-[1.375rem] w-px bg-border lg:top-14 lg:left-[1.625rem]"
                      >
                        <span
                          className={cn(
                            "block size-full origin-top bg-accent transition-transform duration-700 ease-out motion-reduce:transition-none",
                            passed ? "scale-y-100" : "scale-y-0",
                          )}
                        />
                      </span>
                    ) : null}

                    <span
                      className={cn(
                        "relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors duration-500 lg:size-[3.25rem]",
                        on
                          ? "border-accent bg-accent text-white"
                          : passed
                            ? "border-accent bg-surface text-accent"
                            : "border-border bg-surface text-muted-foreground",
                      )}
                    >
                      {pad(index + 1)}
                    </span>

                    <div
                      className={cn(
                        "pt-1.5 transition-opacity duration-500 lg:pt-2.5",
                        on ? "opacity-100" : "opacity-100 lg:opacity-40",
                      )}
                    >
                      <h3 className="flex items-center gap-2 text-lg font-medium tracking-tight text-foreground lg:text-2xl">
                        <Icon
                          className="size-5 text-accent lg:hidden"
                          aria-hidden
                        />
                        {pick(step.title)}
                      </h3>
                      <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground lg:text-base">
                        {pick(step.text)}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2 lg:hidden">
                        {step.tags.map((tag) => (
                          <li
                            key={tag.en}
                            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground"
                          >
                            {pick(tag)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 lg:pl-[5rem]">
              <Button
                size="lg"
                className="h-12 rounded-full bg-accent px-6 text-white hover:bg-accent/90"
                asChild
              >
                <Link to="/contact" search={{ topic: "dealer" }}>
                  {pick({ th: "สมัครเป็นพาร์ทเนอร์", en: "Become a partner" })}
                  <ArrowRight className="ml-1 size-4" aria-hidden />
                </Link>
              </Button>
              <Link
                to="/partners"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
              >
                {pick({
                  th: "ดูโปรแกรมตัวแทน",
                  en: "See the dealer programme",
                })}
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
