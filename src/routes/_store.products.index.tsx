import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  SearchX,
} from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

import { ContactLineButton } from "@/components/brand/contact-cta";
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
  PRODUCT_SUBCATEGORY_IDS,
  getProductCategory,
  subcategoriesOf,
  type CatalogProduct,
  type ProductCategoryId,
  type ProductSubcategoryId,
} from "@/data/products-catalog";
import { useT } from "@/i18n";
import { useBi, type Bi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const productsSearchSchema = z.object({
  category: z.enum(PRODUCT_CATEGORY_IDS).optional().catch(undefined),
  sub: z.enum(PRODUCT_SUBCATEGORY_IDS).optional().catch(undefined),
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

function ProductGrid({ products }: { products: CatalogProduct[] }) {
  return (
    <ul className="grid gap-x-6 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => (
        <li
          key={product.slug}
          className="scroll-rise"
          style={{ ["--i" as string]: index % 3 }}
        >
          <ProductCard product={product} eager={index < 3} />
        </li>
      ))}
    </ul>
  );
}

type ProductGroup = {
  id: string;
  name: Bi;
  description: Bi;
  category: ProductCategoryId;
  /** Subcategories shown in this row; omitted = the whole category. */
  subcategories?: ProductSubcategoryId[];
  /** Sub filter applied by "View all" (only when the row maps to exactly one). */
  sub?: ProductSubcategoryId;
};

/** What each group is about, in concept terms (shown beside the product row). */
const GROUP_CONCEPTS: Record<string, Bi> = {
  "blinds-venetian": {
    th: "บังแสงอย่างละเอียดด้วยใบมู่ลี่ ปรับองศาแสงได้ตามเวลาของวัน เลือกความอบอุ่นของไม้จริง หรือความเบาและเรียวของอลูมิเนียม",
    en: "Fine control of light with adjustable slats. Choose the warmth of real wood or the slim, light feel of aluminium.",
  },
  "blinds-roller": {
    th: "ผืนผ้าเรียบง่ายสำหรับหน้าต่างทั่วไปจนถึงบานกว้าง ม้วนเก็บได้เรียบร้อย หรือเลื่อนปรับแสงตามแนวตั้ง",
    en: "Clean fabric panels for everyday windows and wide openings, rolled away neatly or tilted and drawn along vertical vanes.",
  },
  outdoor: {
    th: "ลดแดดและความร้อนก่อนถึงตัวอาคาร สำหรับพื้นที่นอกชายคา เช่น ระเบียง เพอร์โกล่า และหลังคากระจก",
    en: "Cut sun and heat before it reaches the building, for terraces, pergolas and glass roofs.",
  },
  partitions: {
    th: "แบ่งพื้นที่ใช้สอยโดยไม่ต้องก่อผนัง พับเก็บได้เมื่ออยากได้พื้นที่โล่ง เลือกสไตล์ใบฉากให้เข้ากับห้อง",
    en: "Divide a space without building a wall, folding away when you want it open. Pick the panel style that suits the room.",
  },
  tracks: {
    th: "โครงสร้างที่ทำให้ม่านเลื่อนเรียบและห้อยเป็นทรงสวยตามหัวม่านที่เลือก ตั้งแต่ม่านบ้านจนถึงโรงพยาบาลและงานโครงการ",
    en: "The structure that lets a curtain glide smoothly and hang in the heading you chose, from homes to hospitals and projects.",
  },
  motorization: {
    th: "ม่านที่เปิด-ปิดเองอย่างเงียบและนุ่ม ควบคุมจากรีโมท สวิตช์ หรือมือถือ ซ่อนมอเตอร์ไว้หลังรางให้ภาพรวมเรียบร้อย",
    en: "Curtains that open and close themselves, quietly and smoothly, from a remote, a wall switch or your phone, with the motor hidden behind the track.",
  },
  rods: {
    th: "ส่วนตกแต่งที่มองเห็นได้ ทำให้ม่านดูสมบูรณ์ด้วยรางโชว์หลายสีและหลายผิว หัวราง ขาจับ และอุปกรณ์เสริม",
    en: "The visible finishing touch: decorative rods in many finishes, with finials, brackets and hardware.",
  },
  "custom-print": {
    th: "เปลี่ยนภาพหรือลวดลายของลูกค้าให้เป็นผ้าม่าน ม่านญี่ปุ่น และม่านม้วนเฉพาะงาน เหมาะกับงานแบรนด์และงานนิทรรศการ",
    en: "Turn a customer's artwork or photo into one-off fabric, noren and roller blinds, for brands, exhibitions and statement interiors.",
  },
};

/** Overview rows: one per category, except Interior Blinds which is split in two. */
const PRODUCT_GROUPS: ProductGroup[] = PRODUCT_CATEGORIES.flatMap(
  (category): ProductGroup[] =>
    category.id === "blinds"
      ? [
          {
            id: "blinds-venetian",
            name: {
              th: "มู่ลี่ไม้และมู่ลี่อลูมิเนียม",
              en: "Wood & Aluminium Blinds",
            },
            description: {
              th: "มู่ลี่ไม้และมู่ลี่อลูมิเนียม ผลิตตามขนาดหน้างาน",
              en: "Wood and aluminium venetian blinds, made to measure.",
            },
            category: "blinds",
            subcategories: ["venetian"],
            sub: "venetian",
          },
          {
            id: "blinds-roller",
            name: {
              th: "ม่านม้วนและม่านปรับแสง",
              en: "Roller & Vertical Blinds",
            },
            description: {
              th: "ม่านม้วนและม่านปรับแสง ผลิตตามขนาดหน้างาน",
              en: "Roller and vertical blinds, made to measure.",
            },
            category: "blinds",
            subcategories: ["roller", "vertical"],
          },
        ]
      : [
          {
            id: category.id,
            name: category.name,
            description: category.description,
            category: category.id,
          },
        ],
);

function ProductsPage() {
  const { t } = useT();
  const pick = useBi();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
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
          (!search.sub || product.subcategory === search.sub),
      ),
    [search.category, search.sub],
  );

  const activeCategory = search.category
    ? getProductCategory(search.category)
    : null;
  const subcategories = activeCategory
    ? subcategoriesOf(activeCategory.id)
    : [];
  const showGrouped = !activeCategory;

  return (
    <>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />

      <section className="border-b border-border">
        <div
          key={activeCategory?.id ?? "all"}
          className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8 lg:pt-16 lg:pb-14"
        >
          {activeCategory ? (
            <button
              type="button"
              onClick={() => setSearch({ category: undefined, sub: undefined })}
              className="hero-blur-in mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ArrowLeft className="size-4" aria-hidden />
              {pick({ th: "สินค้าทั้งหมด", en: "All products" })}
            </button>
          ) : null}
          <p className="hero-blur-in brand-kicker flex items-center gap-3 text-primary">
            <span aria-hidden className="h-px w-8 bg-accent" />
            {activeCategory
              ? `${activeCategory.index} — ${pick({ th: "หมวดสินค้า", en: "Category" })}`
              : "Made to measure"}
          </p>
          <h1
            className={cn(
              "scroll-fade-away mt-5 font-medium tracking-tight text-foreground",
              activeCategory
                ? "brand-display"
                : "text-[clamp(3.5rem,12vw,9.5rem)] leading-[0.92]",
            )}
          >
            {(activeCategory ? activeCategory.name.en : "Products")
              .split(" ")
              .map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="hero-word inline-block pr-[0.22em] last:pr-0"
                  style={{ ["--i" as string]: index }}
                >
                  {word}
                </span>
              ))}
          </h1>
          {activeCategory ? (
            <p
              className="hero-blur-in mt-2 text-lg text-muted-foreground"
              style={{ ["--delay" as string]: "350ms" }}
            >
              {activeCategory.name.th}
            </p>
          ) : null}
          <p
            className="hero-blur-in mt-6 max-w-2xl text-base leading-7 text-muted-foreground text-pretty lg:mt-8 lg:text-lg lg:leading-8"
            style={{ ["--delay" as string]: "450ms" }}
          >
            {activeCategory
              ? pick(activeCategory.description)
              : pick({
                  th: "ผลิตภัณฑ์ทุกชิ้นของ WP ALL สั่งทำตามขนาดหน้างาน ด้วยมาตรฐานเดียวกันทุกรายการ",
                  en: "Every WP ALL product is made to the measurements of your space, to one consistent standard.",
                })}
          </p>
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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div>
          {showGrouped ? null : (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {pick({
                th: `แสดง ${results.length} รายการ`,
                en: `Showing ${results.length} ${results.length === 1 ? "product" : "products"}`,
              })}
            </p>
          )}

          {results.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-sm bg-surface px-6 py-20 text-center">
              <SearchX className="size-8 text-muted-foreground" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">
                {pick({
                  th: "ไม่พบสินค้าในหมวดนี้",
                  en: "No products in this category",
                })}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                {pick({
                  th: "ลองดูสินค้าทั้งหมด หรือเล่าความต้องการให้ทีมงานฟัง เราช่วยแนะนำสินค้าที่เหมาะให้ได้",
                  en: "Try viewing all products, or tell our team what you need and we'll suggest the right product.",
                })}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="h-11 rounded-full"
                  onClick={() =>
                    setSearch({ category: undefined, sub: undefined })
                  }
                >
                  {pick({ th: "ดูสินค้าทั้งหมด", en: "View all products" })}
                </Button>
                <ContactLineButton size="default" />
              </div>
            </div>
          ) : showGrouped ? (
            <div className="divide-y divide-border">
              {PRODUCT_GROUPS.map((group, groupIndex) => {
                const products = results.filter(
                  (product) =>
                    product.category === group.category &&
                    (!group.subcategories ||
                      group.subcategories.includes(product.subcategory)),
                );
                if (!products.length) return null;
                return (
                  <section
                    key={group.id}
                    aria-labelledby={`group-${group.id}`}
                    className="grid gap-8 py-12 first:pt-0 lg:grid-cols-[15rem_1fr] lg:gap-10"
                  >
                    <div className="scroll-rise flex flex-col items-start">
                      <h2
                        id={`group-${group.id}`}
                        className="text-3xl leading-tight font-medium tracking-tight text-balance"
                      >
                        {group.name.en}
                      </h2>
                      <p className="mt-1 text-base text-muted-foreground">
                        {group.name.th}
                      </p>
                      <p className="mt-4 text-sm leading-7 text-muted-foreground text-pretty">
                        {pick(GROUP_CONCEPTS[group.id] ?? group.description)}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSearch({
                            category: group.category,
                            sub: group.sub,
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="group mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:mt-auto lg:pt-8"
                      >
                        <span className="flex size-11 items-center justify-center rounded-full border border-foreground/30 transition-colors group-hover:bg-foreground group-hover:text-background">
                          <ArrowUpRight className="size-4" aria-hidden />
                        </span>
                        {t("site.cta.viewAll")}
                      </button>
                    </div>
                    <ul className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
                      {products.slice(0, 3).map((product, index) => (
                        <li
                          key={product.slug}
                          className="scroll-rise"
                          style={{ ["--i" as string]: index + 1 }}
                        >
                          <ProductCard
                            product={product}
                            eager={groupIndex < 2}
                          />
                        </li>
                      ))}
                    </ul>
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
    </>
  );
}
