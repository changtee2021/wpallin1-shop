import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  Check,
  Download,
  FileText,
  Play,
  Ruler,
} from "lucide-react";
import { useState, type MouseEvent } from "react";

import { ArrowFillAnchor } from "@/components/brand/arrow-fill-link";
import { ContactLineButton } from "@/components/brand/contact-cta";
import { BrandPageError } from "@/components/brand/page-states";
import { ProductCard } from "@/components/brand/product-card";
import { ProjectCard } from "@/components/brand/project-card";
import { SectionHeading } from "@/components/brand/section-heading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  CATALOG_PRODUCTS,
  PRODUCT_CONTROL_LABELS,
  PRODUCT_MATERIAL_LABELS,
  PRODUCT_ROOM_LABELS,
  getCatalogProduct,
  getProductCategory,
  getProductSubcategory,
  type ProductDocument,
  type ProductDocumentType,
  type ProductVideo,
} from "@/data/products-catalog";
import { getProductFaqs } from "@/data/product-faqs";
import { PROJECTS } from "@/data/projects";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { shopHref } from "@/lib/features";
import { absoluteUrl } from "@/lib/public-url";
import { pageHead } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/products/$slug")({
  loader: ({ params }) => {
    const product = getCatalogProduct(params.slug);
    if (!product) throw redirect({ to: "/products", replace: true });
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.product) return {};
    const { product } = loaderData;
    const faqs = getProductFaqs(product.slug);
    const productLd = {
      "@type": "Product",
      name: product.name.th,
      alternateName: product.name.en,
      description: product.summary.th,
      image: [product.image, ...(product.gallery ?? [])].map((src) =>
        absoluteUrl(src),
      ),
      category: getProductCategory(product.category).name.en,
      brand: { "@type": "Brand", name: "WP ALL" },
      manufacturer: { "@type": "Organization", name: siteConfig.legalNameEn },
    };
    return pageHead({
      title: `${product.name.th} (${product.code}) | WP ALL`,
      description: product.summary.th,
      path: `/products/${product.slug}`,
      image: product.image,
      type: "product",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          productLd,
          ...(faqs.length
            ? [
                {
                  "@type": "FAQPage",
                  mainEntity: faqs.map((item) => ({
                    "@type": "Question",
                    name: item.question.th,
                    acceptedAnswer: { "@type": "Answer", text: item.answer.th },
                  })),
                },
              ]
            : []),
        ],
      },
    });
  },
  errorComponent: ({ reset }) => <BrandPageError onRetry={reset} />,
  component: ProductDetailPage,
});

const DOCUMENT_TYPE_LABELS: Record<ProductDocumentType, Bi> = {
  catalogue: { th: "แคตตาล็อก", en: "Catalogue" },
  certificate: { th: "ใบรับรอง", en: "Certificate" },
  "test-report": { th: "ผลทดสอบ", en: "Test report" },
  "install-guide": { th: "คู่มือติดตั้ง", en: "Installation guide" },
};

const DOCUMENT_TYPE_ICONS = {
  catalogue: BookOpen,
  certificate: Award,
  "test-report": FileText,
  "install-guide": Ruler,
} satisfies Record<ProductDocumentType, typeof FileText>;

function VideoTile({ video }: { video: ProductVideo }) {
  const pick = useBi();
  const [playing, setPlaying] = useState(false);

  return (
    <figure>
      <div className="relative aspect-video overflow-hidden rounded-sm bg-foreground">
        {playing ? (
          video.kind === "youtube" ? (
            <iframe
              src={`${video.src}${video.src.includes("?") ? "&" : "?"}autoplay=1&rel=0`}
              title={pick(video.title)}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="size-full"
            />
          ) : (
            <video
              src={video.src}
              poster={video.poster}
              controls
              autoPlay
              playsInline
              className="size-full object-cover"
            />
          )
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label={`${pick({ th: "เล่นวิดีโอ", en: "Play video" })}: ${pick(video.title)}`}
          >
            <img
              src={video.poster}
              alt=""
              loading="lazy"
              className="size-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-100"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform group-hover:scale-105">
                <Play className="ml-0.5 size-6 fill-current" aria-hidden />
              </span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-3 text-sm font-medium">
        {pick(video.title)}
      </figcaption>
    </figure>
  );
}

function DocumentRow({ document }: { document: ProductDocument }) {
  const pick = useBi();
  const Icon = DOCUMENT_TYPE_ICONS[document.type];

  return (
    <li className="flex items-center gap-4 py-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface">
        <Icon className="size-5 text-foreground" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{pick(document.title)}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {pick(DOCUMENT_TYPE_LABELS[document.type])}
          {document.year ? ` · ${document.year}` : ""}
          {document.sizeLabel ? ` · PDF ${document.sizeLabel}` : " · PDF"}
        </p>
      </div>
      <Button variant="ghost" className="h-11 rounded-full px-4" asChild>
        <a href={document.href} target="_blank" rel="noreferrer">
          <Download className="mr-1.5 size-4" aria-hidden />
          {pick({ th: "เปิดดู", en: "Open" })}
        </a>
      </Button>
    </li>
  );
}

function scrollToSection(event: MouseEvent<HTMLAnchorElement>) {
  const id = event.currentTarget.hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  event.preventDefault();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  target.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", `#${id}`);
}

function ProductDetailPage() {
  const { t } = useT();
  const pick = useBi();
  const { product } = Route.useLoaderData();
  const category = getProductCategory(product.category);
  const subcategory = getProductSubcategory(product.subcategory);
  const images = [product.image, ...(product.gallery ?? [])];
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = images[Math.min(activeImage, images.length - 1)];
  const featureImage = product.gallery?.[0] ?? product.image;
  const gallery = product.gallery ?? [];

  const related = CATALOG_PRODUCTS.filter(
    (item) => item.category === product.category && item.slug !== product.slug,
  ).slice(0, 3);
  const projects = PROJECTS.filter((project) =>
    project.productSlugs.includes(product.slug),
  );
  const documents = product.documents ?? [];
  const videos = product.videos ?? [];
  const faqs = getProductFaqs(product.slug);

  const sections = [
    { id: "overview", label: { th: "ภาพรวม", en: "Overview" }, show: true },
    {
      id: "highlights",
      label: { th: "จุดเด่น", en: "Highlights" },
      show: Boolean(product.stats?.length),
    },
    {
      id: "gallery",
      label: { th: "แกลเลอรี", en: "Gallery" },
      show: gallery.length > 0,
    },
    {
      id: "series",
      label: { th: "รุ่น", en: "Series" },
      show: Boolean(product.series?.length),
    },
    {
      id: "specs",
      label: { th: "สเปกและสี", en: "Specs & colours" },
      show: Boolean(product.specs?.length || product.colors?.length),
    },
    {
      id: "videos",
      label: { th: "วิดีโอ", en: "Videos" },
      show: videos.length > 0,
    },
    { id: "downloads", label: { th: "เอกสาร", en: "Downloads" }, show: true },
    {
      id: "projects",
      label: { th: "ผลงานจริง", en: "Projects" },
      show: projects.length > 0,
    },
    {
      id: "faq",
      label: { th: "คำถามที่พบบ่อย", en: "FAQ" },
      show: faqs.length > 0,
    },
  ].filter((section) => section.show);
  const sectionIndex = (id: string) =>
    String(sections.findIndex((section) => section.id === id) + 1).padStart(
      2,
      "0",
    );

  const meta: { label: Bi; value: string }[] = [
    { label: { th: "หมวด", en: "Category" }, value: pick(subcategory.name) },
    {
      label: { th: "วัสดุ", en: "Material" },
      value: product.materials
        .map((material) => pick(PRODUCT_MATERIAL_LABELS[material]))
        .join(" · "),
    },
    {
      label: { th: "การควบคุม", en: "Control" },
      value: product.controls
        .map((control) => pick(PRODUCT_CONTROL_LABELS[control]))
        .join(" · "),
    },
    {
      label: { th: "เหมาะกับ", en: "Suits" },
      value: product.rooms
        .map((room) => pick(PRODUCT_ROOM_LABELS[room]))
        .join(" · "),
    },
  ];

  const catalogueCardClass =
    "group mt-10 flex items-center justify-between gap-6 rounded-xl bg-background p-6 transition-shadow hover:shadow-[0_18px_40px_-24px_rgb(0_0_0/0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
  const catalogueCard = (
    <>
      <span className="flex items-center gap-4">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-base font-medium">
            {pick({ th: "แคตตาล็อกออนไลน์", en: "Online catalogue" })}
          </span>
          <span className="mt-0.5 block text-sm text-muted-foreground">
            {product.catalogSlug
              ? pick({
                  th: "เปิดอ่านได้ทันทีทุกอุปกรณ์",
                  en: "Read it on any device",
                })
              : pick({
                  th: "ดูแคตตาล็อกทั้งหมดของ WP ALL",
                  en: "Browse all WP ALL catalogues",
                })}
          </span>
        </span>
      </span>
      <ArrowUpRight
        className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        aria-hidden
      />
    </>
  );

  return (
    <article>
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
        >
          <Link
            to="/products"
            className="inline-flex min-h-11 items-center gap-1.5 hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("nav.products")}
          </Link>
          <span aria-hidden>/</span>
          <Link
            to="/products"
            search={{ category: category.id }}
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            {pick(category.name)}
          </Link>
          <span aria-hidden>/</span>
          <Link
            to="/products"
            search={{ category: category.id, sub: subcategory.id }}
            className="inline-flex min-h-11 items-center hover:text-foreground"
          >
            {pick(subcategory.name)}
          </Link>
        </nav>
      </div>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-6 pb-16 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16 lg:px-8 lg:pb-24">
        <div className="order-2 flex flex-col lg:order-1 lg:pt-6">
          <p className="brand-kicker text-muted-foreground">
            {category.index} — {category.name.en}
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,5vw,4.25rem)] leading-[1.08] font-medium tracking-tight text-foreground text-balance">
            {pick(product.name)}
          </h1>
          <p className="mt-3 text-sm tracking-[0.14em] text-muted-foreground uppercase">
            {product.code}
          </p>
          <p className="mt-8 max-w-md text-lg leading-8 text-foreground/85 text-pretty">
            {pick(product.tagline)}
          </p>

          <dl className="mt-10 divide-y divide-border border-y border-border">
            {meta.map((row) => (
              <div
                key={row.label.en}
                className="grid grid-cols-[6.5rem_1fr] gap-4 py-3 text-sm"
              >
                <dt className="text-muted-foreground">{pick(row.label)}</dt>
                <dd className="text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ContactLineButton className="sm:flex-1" />
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 sm:flex-1"
              asChild
            >
              {product.catalogSlug ? (
                <Link to="/catalogs/$id" params={{ id: product.catalogSlug }}>
                  <BookOpen className="mr-2 size-4" aria-hidden />
                  {pick({ th: "ดูแคตตาล็อก", en: "View catalogue" })}
                </Link>
              ) : (
                <a href="#downloads" onClick={scrollToSection}>
                  <BookOpen className="mr-2 size-4" aria-hidden />
                  {pick({
                    th: "แคตตาล็อกและเอกสาร",
                    en: "Catalogue & documents",
                  })}
                </a>
              )}
            </Button>
          </div>
          <div className="mt-6 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">
              {pick({
                th: "สำหรับตัวแทนจำหน่าย ดูราคาและสั่งซื้อออนไลน์",
                en: "For dealers: see prices and order online",
              })}
            </p>
            <ArrowFillAnchor
              href={shopHref()}
              className="mt-3 w-full"
              style={{ height: "3rem" }}
            >
              {pick({ th: "ไปที่ร้านค้าตัวแทน", en: "Go to the dealer shop" })}
            </ArrowFillAnchor>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface lg:aspect-[5/6]">
            <img
              key={currentImage}
              src={currentImage}
              alt={pick(product.name)}
              fetchPriority="high"
              className="size-full animate-in object-cover duration-500 fade-in"
            />
          </div>
          {images.length > 1 ? (
            <div className="mt-3 flex gap-3">
              {images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`${pick(product.name)} ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={cn(
                    "size-20 overflow-hidden rounded-sm bg-surface ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    index === activeImage
                      ? "ring-1 ring-foreground"
                      : "opacity-60 hover:opacity-100",
                  )}
                >
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* In-page navigation */}
      <div className="sticky top-[72px] z-30 border-y border-border bg-background/90 backdrop-blur-md lg:top-[84px] lg:before:pointer-events-none lg:before:absolute lg:before:inset-x-0 lg:before:bottom-full lg:before:h-[84px] lg:before:bg-background/90 lg:before:backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <p className="hidden shrink-0 text-sm font-medium lg:block">
            {pick(product.name)}
          </p>
          <nav
            aria-label={pick({ th: "ส่วนต่างๆ ของหน้า", en: "On this page" })}
            className="no-scrollbar -mx-2 flex-1 overflow-x-auto lg:flex lg:justify-center"
          >
            <ul className="flex min-w-max">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={scrollToSection}
                    className="inline-flex min-h-12 items-center px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {section.label.en}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="brand-section scroll-mt-40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-24 lg:px-8">
          <div>
            <p className="brand-kicker flex items-center gap-3 text-muted-foreground">
              <span className="brand-index">{sectionIndex("overview")}</span>
              <span aria-hidden className="h-px w-8 bg-border" />
              Overview
            </p>
            <p className="mt-6 text-xl leading-9 text-foreground text-pretty lg:text-2xl lg:leading-10">
              {pick(product.summary)}
            </p>
          </div>
          <ul className="space-y-0 divide-y divide-border self-end border-y border-border">
            {product.highlights.map((highlight) => (
              <li
                key={highlight.en}
                className="flex gap-4 py-4 text-sm leading-6"
              >
                <Check
                  className="mt-1 size-4 shrink-0 text-primary"
                  aria-hidden
                />
                {pick(highlight)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Feature banner */}
      <section className="relative">
        <div className="relative mx-auto aspect-[4/5] max-h-[80vh] w-full overflow-hidden bg-foreground sm:aspect-[16/9] lg:aspect-[21/9]">
          <img
            src={featureImage}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="scroll-zoom size-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-16">
            <p className="brand-kicker text-white/70">{product.code}</p>
            <p className="mt-3 max-w-2xl text-[clamp(1.75rem,3.6vw,3rem)] leading-tight font-medium text-white text-balance">
              {pick(product.tagline)}
            </p>
          </div>
        </div>
      </section>

      {/* Bento highlights */}
      {product.stats?.length ? (
        <section id="highlights" className="brand-section scroll-mt-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("highlights")}
              kicker="Highlights"
              title="The numbers behind it"
            />
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(2,13rem)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface sm:col-span-2 lg:row-span-2 lg:aspect-auto">
                <img
                  src={product.gallery?.[1] ?? product.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              {product.stats.map((stat) => (
                <div
                  key={stat.label.en}
                  className="flex min-h-40 flex-col justify-between rounded-xl bg-surface p-6 lg:min-h-0 lg:p-8"
                >
                  <p className="text-sm text-muted-foreground">
                    {pick(stat.label)}
                  </p>
                  <p className="text-[clamp(2rem,3.4vw,3rem)] leading-none font-medium tracking-tight text-foreground tabular-nums">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Story */}
      {product.story?.length ? (
        <section className="border-t border-border">
          {product.story.map((block, index) => (
            <div
              key={block.title.en}
              className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8 lg:py-24"
            >
              <div
                className={cn(
                  "aspect-[4/3] overflow-hidden rounded-sm bg-surface",
                  index % 2 === 1 && "lg:order-2",
                )}
              >
                <img
                  src={block.image}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="max-w-md">
                <p className="brand-kicker text-muted-foreground">Craft</p>
                <h2 className="mt-4 text-2xl font-medium tracking-tight lg:text-3xl">
                  {block.title.en}
                </h2>
                <p className="mt-5 text-base leading-8 text-muted-foreground text-pretty">
                  {pick(block.body)}
                </p>
              </div>
            </div>
          ))}
        </section>
      ) : null}

      {/* Gallery */}
      {gallery.length ? (
        <section
          id="gallery"
          className="brand-section scroll-mt-40 border-t border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("gallery")}
              kicker="Gallery"
              title="In the space"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {gallery.map((src, index) => (
                <div
                  key={src}
                  className={cn(
                    "scroll-wipe-up-soft group aspect-[4/3] overflow-hidden rounded-sm bg-surface",
                    gallery.length % 2 === 1 &&
                      index === 0 &&
                      "sm:col-span-2 sm:aspect-[21/9]",
                  )}
                  style={{ ["--i" as string]: index % 2 }}
                >
                  <div className="scroll-zoom size-full">
                    <img
                      src={src}
                      alt={`${pick(product.name)} ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Series */}
      {product.series?.length ? (
        <section
          id="series"
          className="brand-section scroll-mt-40 border-t border-border bg-surface"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("series")}
              kicker="Series"
              title="Choose the right series"
            />
            <ol className="mt-12 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {product.series.map((series, index) => (
                <li key={series.name.en} className="bg-background p-6 lg:p-8">
                  <span className="brand-index text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-6 text-lg font-medium">
                    {pick(series.name)}
                  </h3>
                  {series.description ? (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {pick(series.description)}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Specs & colours */}
      {product.specs?.length || product.colors?.length ? (
        <section
          id="specs"
          className="brand-section scroll-mt-40 border-t border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("specs")}
              kicker="Specifications"
              title="Technical details"
            />
            <div className="mt-12 grid gap-14 lg:grid-cols-2 lg:gap-20">
              {product.specs?.length ? (
                <dl className="divide-y divide-border border-y border-border">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label.en}
                      className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-6 py-4 text-sm"
                    >
                      <dt className="text-muted-foreground">
                        {pick(spec.label)}
                      </dt>
                      <dd className="font-medium text-foreground">
                        {pick(spec.value)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
              {product.colors?.length ? (
                <div>
                  <h3 className="brand-kicker text-muted-foreground">
                    Colours & finishes
                  </h3>
                  <div className="mt-6 space-y-8">
                    {product.colors.map((set) => (
                      <div key={set.label.en}>
                        <p className="text-sm font-medium">
                          {pick(set.label)}
                          {set.note ? (
                            <span className="ml-2 font-normal text-muted-foreground">
                              {pick(set.note)}
                            </span>
                          ) : null}
                        </p>
                        {set.codes?.length ? (
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {set.codes.map((color) => (
                              <li
                                key={color.code}
                                className="rounded-full bg-surface px-3 py-1.5 text-xs"
                              >
                                <span className="font-medium">
                                  {color.code}
                                </span>
                                <span className="ml-1.5 text-muted-foreground">
                                  {pick(color.name)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ))}
                    <p className="text-xs leading-5 text-muted-foreground">
                      {pick({
                        th: "สีบนหน้าจออาจต่างจากของจริง ขอดูตัวอย่างสีจริงได้ที่ทีมงาน",
                        en: "On-screen colours can differ from the real thing — ask our team for physical samples.",
                      })}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Videos */}
      {videos.length ? (
        <section
          id="videos"
          className="brand-section scroll-mt-40 border-t border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("videos")}
              kicker="Videos"
              title="See it in action"
            />
            <div className="mt-12 grid gap-x-6 gap-y-10 md:grid-cols-2">
              {videos.map((video) => (
                <VideoTile key={video.src} video={video} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Catalogue & documents */}
      <section
        id="downloads"
        className="brand-section scroll-mt-40 border-t border-border bg-surface"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-8">
          <div>
            <SectionHeading
              index={sectionIndex("downloads")}
              kicker="Downloads"
              title="Catalogue & documents"
              description={pick({
                th: "แคตตาล็อกออนไลน์ ใบรับรอง และเอกสารทางเทคนิคของสินค้านี้",
                en: "The online catalogue, certificates and technical documents for this product.",
              })}
            />
            {product.catalogSlug ? (
              <Link
                to="/catalogs/$id"
                params={{ id: product.catalogSlug }}
                className={catalogueCardClass}
              >
                {catalogueCard}
              </Link>
            ) : (
              <Link to="/catalogs" className={catalogueCardClass}>
                {catalogueCard}
              </Link>
            )}
          </div>

          <div className="lg:pt-24">
            {documents.length ? (
              <ul className="divide-y divide-border border-y border-border">
                {documents.map((document) => (
                  <DocumentRow key={document.href} document={document} />
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background p-8">
                <Award className="size-6 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-base font-medium">
                  {pick({
                    th: "ต้องการใบรับรองหรือเอกสารทางเทคนิค?",
                    en: "Need certificates or technical documents?",
                  })}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pick({
                    th: "สอบถามใบรับรอง ผลทดสอบ หรือคู่มือติดตั้งของสินค้านี้กับทีมงานได้ทาง LINE",
                    en: "Ask our team on LINE about certificates, test reports or installation guides for this product.",
                  })}
                </p>
                <ContactLineButton
                  variant="outline"
                  size="default"
                  className="mt-6"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Projects */}
      {projects.length ? (
        <section
          id="projects"
          className="brand-section scroll-mt-40 border-t border-border"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              index={sectionIndex("projects")}
              kicker="Seen in"
              title="Real installations"
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      {faqs.length ? (
        <section
          id="faq"
          className="brand-section scroll-mt-40 border-t border-border bg-surface"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
            <SectionHeading
              index={sectionIndex("faq")}
              kicker="FAQ"
              title="Frequently asked questions"
              description={pick({
                th: "ไม่เจอคำตอบที่ต้องการ? ทัก LINE ได้เลย",
                en: "Can't find your answer? Message us on LINE.",
              })}
            />
            <Accordion type="multiple" className="border-t border-border">
              {faqs.map((item) => (
                <AccordionItem key={item.question.en} value={item.question.en}>
                  <AccordionTrigger className="min-h-14 text-left text-base font-medium hover:no-underline">
                    {pick(item.question)}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-2xl text-base leading-7 text-muted-foreground">
                    {pick(item.answer)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length ? (
        <section className="brand-section border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker={category.name.en}
              title="More in this category"
              action={
                <Link
                  to="/products"
                  search={{ category: category.id }}
                  className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-foreground"
                >
                  {t("site.cta.viewAll")}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              }
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
