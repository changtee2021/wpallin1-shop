import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  SearchX,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";

import {
  ContactCtaBand,
  ContactLineButton,
} from "@/components/brand/contact-cta";
import {
  BrandPageError,
  BrandGridSkeleton,
} from "@/components/brand/page-states";
import { ProductCard } from "@/components/brand/product-card";
import { Button } from "@/components/ui/button";
import {
  CATALOG_PRODUCTS,
  PRODUCT_CATEGORIES,
  PRODUCT_CATEGORY_IDS,
  PRODUCT_CONTROL_LABELS,
  PRODUCT_CONTROLS,
  PRODUCT_MATERIAL_LABELS,
  PRODUCT_MATERIALS,
  PRODUCT_ROOM_LABELS,
  PRODUCT_ROOMS,
  PRODUCT_SUBCATEGORY_IDS,
  getProductCategory,
  subcategoriesOf,
  type CatalogProduct,
  type ProductCategoryId,
} from "@/data/products-catalog";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const productsSearchSchema = z.object({
  category: z.enum(PRODUCT_CATEGORY_IDS).optional().catch(undefined),
  sub: z.enum(PRODUCT_SUBCATEGORY_IDS).optional().catch(undefined),
  room: z.enum(PRODUCT_ROOMS).optional().catch(undefined),
  control: z.enum(PRODUCT_CONTROLS).optional().catch(undefined),
  material: z.enum(PRODUCT_MATERIALS).optional().catch(undefined),
});

type ProductsSearch = z.infer<typeof productsSearchSchema>;

export const Route = createFileRoute("/_store/products/")({
  validateSearch: (search) => productsSearchSchema.parse(search),
  head: ({ match }) => {
    const category = match.search.category
      ? getProductCategory(match.search.category)
      : null;
    return pageHead({
      title: category
        ? `${category.name.th} | WP ALL`
        : "สินค้าทั้งหมด | WP ALL",
      description: category
        ? category.description.th
        : "มู่ลี่ ม่านม้วน ระบบกันแดดภายนอก ฉากกั้นห้อง PVC รางม่าน ระบบมอเตอร์ รางโชว์ และงานพิมพ์ลายสั่งทำ จาก WP ALL",
      path: category ? `/products?category=${category.id}` : "/products",
      image: category?.image ?? "/products/wood-blinds.webp",
    });
  },
  pendingComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <BrandGridSkeleton count={6} />
    </div>
  ),
  errorComponent: ({ reset }) => <BrandPageError onRetry={reset} />,
  component: ProductsPage,
});

function FilterGroup<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
}: {
  label: Bi;
  options: readonly T[];
  labels: Record<T, Bi>;
  value: T | undefined;
  onChange: (next: T | undefined) => void;
}) {
  const pick = useBi();

  return (
    <details open className="group/filter border-b border-border py-5">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <span>
          {pick(label)}
          {value ? (
            <span className="ml-2 inline-block size-1.5 rounded-full bg-accent align-middle" />
          ) : null}
        </span>
        <ChevronDown
          className="size-4 text-muted-foreground transition-transform group-open/filter:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? undefined : option)}
              className={cn(
                "inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:min-h-9",
                selected
                  ? "bg-foreground text-background"
                  : "bg-surface text-foreground/80 hover:bg-paper hover:text-foreground",
              )}
            >
              {pick(labels[option])}
            </button>
          );
        })}
      </div>
    </details>
  );
}

function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <li key={product.slug}>
          <ProductCard product={product} eager={index < 3} />
        </li>
      ))}
    </ul>
  );
}

function ProductsPage() {
  const { t } = useT();
  const pick = useBi();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setSearch = (patch: Partial<ProductsSearch>) => {
    void navigate({
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });
  };

  const results = useMemo(
    () =>
      CATALOG_PRODUCTS.filter(
        (product) =>
          (!search.category || product.category === search.category) &&
          (!search.sub || product.subcategory === search.sub) &&
          (!search.room || product.rooms.includes(search.room)) &&
          (!search.control || product.controls.includes(search.control)) &&
          (!search.material || product.materials.includes(search.material)),
      ),
    [search.category, search.sub, search.room, search.control, search.material],
  );

  const activeCategory = search.category
    ? getProductCategory(search.category)
    : null;
  const subcategories = activeCategory
    ? subcategoriesOf(activeCategory.id)
    : [];
  const refinementCount = [search.room, search.control, search.material].filter(
    Boolean,
  ).length;
  const showGrouped = !activeCategory && refinementCount === 0;

  const clearRefinements = () =>
    setSearch({ room: undefined, control: undefined, material: undefined });

  const tabs: {
    id: ProductCategoryId | undefined;
    label: string;
    index: string;
  }[] = [
    { id: undefined, label: pick({ th: "ทั้งหมด", en: "All" }), index: "00" },
    ...PRODUCT_CATEGORIES.map((category) => ({
      id: category.id,
      label: pick(category.name),
      index: category.index,
    })),
  ];

  return (
    <>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="brand-kicker text-primary">
                {activeCategory
                  ? `${activeCategory.index} — ${activeCategory.name.en}`
                  : t("nav.products")}
              </p>
              <h1
                className={cn(
                  "mt-4 font-medium tracking-tight text-foreground",
                  activeCategory
                    ? "brand-display"
                    : "text-[clamp(3.5rem,12vw,9.5rem)] leading-[0.92]",
                )}
              >
                {activeCategory ? pick(activeCategory.name) : "Products"}
              </h1>
            </div>
            <p className="max-w-sm text-base leading-7 text-muted-foreground text-pretty lg:pb-3 lg:text-right">
              {activeCategory
                ? pick(activeCategory.description)
                : pick({
                    th: "ผลิตภัณฑ์ทั้งหมดของ WP ALL ผลิตในโรงงานของเราเอง และสั่งทำตามขนาดหน้างานทุกชิ้น",
                    en: "Every WP ALL product is made in our own factory, to the measurements of your space.",
                  })}
            </p>
          </div>

          <nav
            aria-label={pick({ th: "หมวดสินค้า", en: "Product categories" })}
            className="no-scrollbar -mx-4 mt-12 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
          >
            <ul className="flex min-w-max gap-1">
              {tabs.map((tab) => {
                const selected = search.category === tab.id;
                return (
                  <li key={tab.index}>
                    <button
                      type="button"
                      aria-current={selected ? "page" : undefined}
                      onClick={() =>
                        setSearch({ category: tab.id, sub: undefined })
                      }
                      className={cn(
                        "relative inline-flex min-h-12 items-baseline gap-2 px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        selected
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <span className="brand-index text-[0.6875rem] text-muted-foreground">
                        {tab.index}
                      </span>
                      {tab.label}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 bottom-0 h-0.5 bg-foreground transition-opacity",
                          selected ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </section>

      {subcategories.length > 1 ? (
        <div className="border-b border-border bg-surface/60">
          <nav
            aria-label={pick({ th: "หมวดย่อย", en: "Subcategories" })}
            className="no-scrollbar mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
          >
            <ul className="flex min-w-max gap-2">
              {[
                { id: undefined, name: { th: "ทั้งหมด", en: "All" } },
                ...subcategories,
              ].map((sub) => {
                const selected = search.sub === sub.id;
                return (
                  <li key={sub.id ?? "all"}>
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setSearch({ sub: sub.id })}
                      className={cn(
                        "inline-flex min-h-11 items-center rounded-full px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                        selected
                          ? "bg-foreground text-background"
                          : "text-foreground/75 hover:bg-background hover:text-foreground",
                      )}
                    >
                      {pick(sub.name)}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      ) : null}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[14rem_1fr] lg:gap-14 lg:px-8 lg:py-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="flex items-center justify-between lg:hidden">
            <Button
              variant="outline"
              className="h-11 rounded-full"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="mr-2 size-4" aria-hidden />
              {pick({ th: "ตัวกรอง", en: "Filters" })}
              {refinementCount ? ` (${refinementCount})` : ""}
            </Button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {pick({
                th: `${results.length} รายการ`,
                en: `${results.length} ${results.length === 1 ? "product" : "products"}`,
              })}
            </p>
          </div>

          <div
            className={cn(
              "mt-4 lg:mt-0 lg:block",
              filtersOpen ? "block" : "hidden",
            )}
          >
            <p className="brand-kicker hidden pb-2 text-muted-foreground lg:block">
              {pick({ th: "ตัวกรอง", en: "Filter" })}
            </p>
            <div className="border-t border-border">
              <FilterGroup
                label={{ th: "พื้นที่ใช้งาน", en: "Space" }}
                options={PRODUCT_ROOMS}
                labels={PRODUCT_ROOM_LABELS}
                value={search.room}
                onChange={(room) => setSearch({ room })}
              />
              <FilterGroup
                label={{ th: "การควบคุม", en: "Control" }}
                options={PRODUCT_CONTROLS}
                labels={PRODUCT_CONTROL_LABELS}
                value={search.control}
                onChange={(control) => setSearch({ control })}
              />
              <FilterGroup
                label={{ th: "วัสดุ", en: "Material" }}
                options={PRODUCT_MATERIALS}
                labels={PRODUCT_MATERIAL_LABELS}
                value={search.material}
                onChange={(material) => setSearch({ material })}
              />
            </div>
            {refinementCount ? (
              <Button
                variant="ghost"
                className="mt-3 min-h-11 px-0 text-foreground hover:bg-transparent hover:underline"
                onClick={clearRefinements}
              >
                <X className="mr-1 size-4" aria-hidden />
                {pick({ th: "ล้างตัวกรอง", en: "Clear filters" })}
              </Button>
            ) : null}
          </div>
        </aside>

        <div>
          <p
            className="hidden text-sm text-muted-foreground lg:block"
            aria-live="polite"
          >
            {pick({
              th: `แสดง ${results.length} รายการ`,
              en: `Showing ${results.length} ${results.length === 1 ? "product" : "products"}`,
            })}
          </p>

          {results.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-sm bg-surface px-6 py-20 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">
                {pick({
                  th: "ไม่พบสินค้าที่ตรงกับตัวกรอง",
                  en: "No products match these filters",
                })}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {pick({
                  th: "ลองล้างตัวกรองบางส่วน หรือเล่าความต้องการให้ทีมงานฟัง เราช่วยแนะนำสินค้าที่เหมาะให้ได้",
                  en: "Try removing a filter, or tell our team what you need and we'll suggest the right product.",
                })}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="h-11 rounded-full"
                  onClick={clearRefinements}
                >
                  {pick({ th: "ล้างตัวกรอง", en: "Clear filters" })}
                </Button>
                <ContactLineButton size="default" />
              </div>
            </div>
          ) : showGrouped ? (
            <div className="mt-6 space-y-24">
              {PRODUCT_CATEGORIES.map((category) => {
                const products = results.filter(
                  (product) => product.category === category.id,
                );
                if (!products.length) return null;
                return (
                  <section
                    key={category.id}
                    aria-labelledby={`cat-${category.id}`}
                  >
                    <div className="flex flex-col gap-4 border-t border-foreground pt-6 sm:flex-row sm:items-end sm:justify-between">
                      <div className="flex items-baseline gap-5">
                        <span className="brand-index text-muted-foreground">
                          {category.index}
                        </span>
                        <div>
                          <h2
                            id={`cat-${category.id}`}
                            className="text-2xl font-medium tracking-tight lg:text-3xl"
                          >
                            {pick(category.name)}
                          </h2>
                          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                            {pick(category.description)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch({ category: category.id, sub: undefined });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-medium text-foreground"
                      >
                        {t("site.cta.viewAll")}
                        <ArrowRight
                          className="size-4 transition-transform group-hover:translate-x-1"
                          aria-hidden
                        />
                      </button>
                    </div>
                    <div className="mt-10">
                      <ProductGrid products={products} />
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="mt-6">
              <ProductGrid products={results} />
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
          <div className="flex items-start gap-5">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-background">
              <BookOpen className="size-6 text-foreground" aria-hidden />
            </span>
            <div>
              <p className="brand-kicker text-muted-foreground">
                Online catalogue
              </p>
              <h2 className="mt-2 text-2xl font-medium tracking-tight lg:text-3xl">
                {pick({
                  th: "แคตตาล็อกออนไลน์",
                  en: "Browse the catalogues",
                })}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                {pick({
                  th: "เปิดดูแคตตาล็อกฉบับเต็มได้ทุกอุปกรณ์ ทั้งรุ่น สี และสเปกของสินค้าทุกหมวด",
                  en: "Full catalogues with every model, colour and spec — readable on any device.",
                })}
              </p>
            </div>
          </div>
          <Button variant="outline" className="h-12 rounded-full px-7" asChild>
            <Link to="/catalogs">
              {pick({ th: "เปิดแคตตาล็อก", en: "Open catalogues" })}
              <ArrowRight className="ml-2 size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <ContactCtaBand />
    </>
  );
}
