import {
  createFileRoute,
  useRouter,
  useRouterState,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { ArrowUpRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { DealerGateDialog } from "@/components/shop/dealer-gate-dialog";
import { ShopProductCard } from "@/components/shop/shop-product-card";
import { InfiniteScrollSentinel } from "@/components/storefront/infinite-scroll-sentinel";
import { ShopActiveFilters } from "@/components/storefront/shop/shop-active-filters";
import { ShopFilterPanel } from "@/components/storefront/shop/shop-filter-panel";
import { ShopFilterSheet } from "@/components/storefront/shop/shop-filter-sheet";
import { Button } from "@/components/ui/button";
import {
  ListEmptyState,
  ListErrorState,
  ListNoResultsState,
} from "@/components/ui/list-query-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useShopInfiniteProducts } from "@/hooks/use-shop-infinite-products";
import {
  fetchCategories,
  fetchPublicProducts,
  fetchShopFilterFacets,
} from "@/lib/api.functions";
import { pageHead } from "@/lib/seo";
import {
  buildShopListOptions,
  clearAllFilters,
  countActiveFilters,
  type ShopSearchState,
} from "@/lib/shop-search";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { CategoryDto } from "@/types/api/categories";
import type { ApiListResponse } from "@/types/api/common";
import type { ProductPublicDto, ShopFilterFacets } from "@/types/api/products";

const commaArray = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const arr = Array.isArray(val)
      ? val
      : val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    return arr.length ? arr : undefined;
  });

const optionalBool = z
  .union([z.boolean(), z.literal("true"), z.literal("false")])
  .optional()
  .transform((val) => (val === true || val === "true" ? true : undefined));

const shopSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  sortBy: z.enum(["created_at", "name", "retail_price"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  productType: z.enum(["standard", "custom"]).optional(),
  inStock: optionalBool,
  featured: optionalBool,
  style: commaArray,
  color: commaArray,
  material: commaArray,
});

export const Route = createFileRoute("/_store/shop/")({
  validateSearch: shopSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const listOptions = buildShopListOptions(deps as ShopSearchState, 1);
    const [products, categories, facets] = await Promise.all([
      fetchPublicProducts({ data: listOptions }) as Promise<
        ApiListResponse<ProductPublicDto>
      >,
      fetchCategories() as Promise<CategoryDto[]>,
      fetchShopFilterFacets() as Promise<ShopFilterFacets>,
    ]);
    return { products, categories, facets };
  },
  head: () =>
    pageHead({
      title: "WP ALL Shop — สั่งซื้อสินค้าสำหรับตัวแทนจำหน่าย",
      description:
        "ร้านค้าออนไลน์ WP ALL ผ้าม่าน ม่านม้วน รางม่าน และอุปกรณ์ ราคาโรงงานสำหรับตัวแทนจำหน่าย สั่งซ้ำง่าย ติดตามออเดอร์ได้",
      path: "/shop",
    }),
  pendingComponent: ShopGridSkeleton,
  errorComponent: ShopError,
  component: ShopPage,
});

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-sm" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function ShopGridSkeleton() {
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8 lg:pt-16 lg:pb-14">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-6 h-16 w-64 sm:h-24 sm:w-96" />
      </div>
      <div className="mx-auto max-w-7xl border-t border-border px-4 py-10 sm:px-6 lg:px-8">
        <ProductGridSkeleton />
      </div>
    </>
  );
}

function ShopError({ reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <ListErrorState
        message="โหลดสินค้าไม่สำเร็จ"
        onRetry={() => {
          void router.invalidate();
          reset();
        }}
      />
    </div>
  );
}

function CategoryNav({
  active,
  categories,
  onSelect,
}: {
  active?: string;
  categories: { slug: string; name: string; count: number }[];
  onSelect: (slug: string | undefined) => void;
}) {
  const items = [
    { slug: undefined, name: "ทั้งหมด", count: undefined },
    ...categories,
  ];

  return (
    <div className="border-b border-border bg-surface/60">
      <nav
        aria-label="หมวดสินค้า"
        className="no-scrollbar mx-auto max-w-7xl overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
      >
        <ul className="flex min-w-max gap-2">
          {items.map((category) => {
            const selected = active === category.slug;
            return (
              <li key={category.slug ?? "all"}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(selected ? undefined : category.slug)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    selected
                      ? "bg-foreground text-background"
                      : "text-foreground/75 hover:bg-background hover:text-foreground",
                  )}
                >
                  {category.name}
                  {category.count != null ? (
                    <span
                      className={cn(
                        "brand-index text-[0.6875rem]",
                        selected
                          ? "text-background/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {String(category.count).padStart(2, "0")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function ShopMasthead({
  title,
  subtitle,
  isDealer,
  onOpenGate,
}: {
  title: string;
  subtitle?: string;
  isDealer: boolean;
  onOpenGate: () => void;
}) {
  return (
    <section className="border-b border-border">
      <div
        key={title}
        className="mx-auto grid max-w-7xl gap-8 px-4 pt-12 pb-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16 lg:px-8 lg:pt-16 lg:pb-14"
      >
        <div className="min-w-0">
          <p className="hero-blur-in brand-kicker flex items-center gap-3 text-primary">
            <span aria-hidden className="h-px w-8 bg-accent" />
            Dealer shop
          </p>
          <h1 className="mt-5 text-[clamp(2.75rem,9vw,7rem)] leading-[0.95] font-medium tracking-tight text-balance text-foreground">
            {title.split(" ").map((word, index) => (
              <span
                key={`${word}-${index}`}
                className="hero-word inline-block pr-[0.22em] last:pr-0"
                style={{ ["--i" as string]: index }}
              >
                {word}
              </span>
            ))}
          </h1>
          {subtitle ? (
            <p
              className="hero-blur-in mt-3 text-lg text-muted-foreground"
              style={{ ["--delay" as string]: "300ms" }}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        <div
          className="hero-blur-in max-w-sm lg:pb-3 lg:text-right"
          style={{ ["--delay" as string]: "450ms" }}
        >
          <p className="text-base leading-7 text-pretty text-muted-foreground">
            {isDealer
              ? "ราคาที่เห็นเป็นราคาตัวแทนของบัญชีคุณ สั่งซื้อ สั่งซ้ำ และติดตามออเดอร์ได้ในที่เดียว"
              : "ดูสินค้าและราคาแนะนำได้ทุกคน สั่งซื้อและราคาตัวแทนสำหรับร้านค้าที่เปิดบัญชีกับ WP ALL"}
          </p>
          {isDealer ? null : (
            <button
              type="button"
              onClick={onOpenGate}
              className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline lg:justify-end"
            >
              เปิดบัญชีตัวแทน
              <ArrowUpRight className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ShopPage() {
  const search = Route.useSearch() as ShopSearchState;
  const { products, categories, facets } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const { isDealer } = useAuth();
  const { items, total, hasMore, loadingMore, loadMore } =
    useShopInfiniteProducts(search, products);
  const dealerPrices = useMemberProductPrices(items);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const categoryNames = Object.fromEntries(
    categories.map((c) => [c.slug, c.name]),
  );
  const activeCount = countActiveFilters(search);
  const title = search.category
    ? (categoryNames[search.category] ?? "สินค้า")
    : search.search
      ? `“${search.search}”`
      : "Shop";
  const subtitle = search.search
    ? "ผลการค้นหา"
    : search.category
      ? undefined
      : "สินค้าทั้งหมดของ WP ALL";

  function applySearch(patch: Partial<ShopSearchState>) {
    void navigate({
      search: (prev) => ({ ...prev, ...patch, page: undefined }),
    });
  }

  return (
    <>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />
      <ShopMasthead
        title={title}
        subtitle={subtitle}
        isDealer={isDealer}
        onOpenGate={() => setGateOpen(true)}
      />
      <CategoryNav
        active={search.category}
        categories={facets.categories}
        onSelect={(slug) => applySearch({ category: slug })}
      />
      <DealerGateDialog open={gateOpen} onOpenChange={setGateOpen} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="flex items-center justify-between gap-4">
          <p
            className="text-sm text-muted-foreground tabular-nums"
            aria-live="polite"
          >
            {total.toLocaleString()} รายการ
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 rounded-full px-4 lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <SlidersHorizontal className="mr-2 size-4" aria-hidden />
            ตัวกรอง
            {activeCount > 0 ? (
              <span className="ml-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background tabular-nums">
                {activeCount}
              </span>
            ) : null}
          </Button>
        </div>

        <div className="mt-6 flex gap-12">
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-36">
              <ShopFilterPanel
                search={search}
                categories={categories}
                facets={facets}
                onChange={applySearch}
              />
            </div>
          </aside>

          <div
            className={cn(
              "min-w-0 flex-1 transition-opacity",
              isPending && "opacity-60",
            )}
          >
            <ShopActiveFilters
              search={search}
              categoryNames={categoryNames}
              onChange={applySearch}
            />

            {items.length === 0 ? (
              activeCount > 0 ? (
                <ListNoResultsState
                  message="ไม่พบสินค้าที่ตรงกับการค้นหา — ลองคำอื่น หรือล้างตัวกรอง"
                  onClear={() => applySearch(clearAllFilters())}
                />
              ) : (
                <ListEmptyState
                  message="ยังไม่มีสินค้าในร้าน — สอบถามรายการสินค้ากับทีมขายได้ทาง LINE"
                  action={
                    <Button asChild variant="outline" className="rounded-full">
                      <a
                        href={siteConfig.lineUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        ทัก LINE {siteConfig.lineId}
                      </a>
                    </Button>
                  }
                />
              )
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 lg:gap-y-14 xl:grid-cols-4">
                {items.map((product) => (
                  <ShopProductCard
                    key={product.id}
                    product={product}
                    dealerPrice={dealerPrices[product.id]}
                  />
                ))}
              </div>
            )}

            {loadingMore ? (
              <div className="mt-8">
                <ProductGridSkeleton count={4} />
              </div>
            ) : null}

            <InfiniteScrollSentinel
              onLoadMore={() => void loadMore()}
              disabled={!hasMore || loadingMore || isPending}
            />
          </div>
        </div>

        <ShopFilterSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          search={search}
          categories={categories}
          facets={facets}
          onChange={applySearch}
        />
      </div>
    </>
  );
}
