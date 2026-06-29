import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { InfiniteScrollSentinel } from "@/components/storefront/infinite-scroll-sentinel";
import { PageLoading } from "@/components/loading";
import { CategoryRail } from "@/components/storefront/category-rail";
import { ShopHeroSlider } from "@/components/storefront/shop/shop-hero-slider";
import { ProductFeed } from "@/components/storefront/product-feed";
import { ShopActiveFilters } from "@/components/storefront/shop/shop-active-filters";
import { ShopFilterSheet } from "@/components/storefront/shop/shop-filter-sheet";
import { ShopFilterSidebar } from "@/components/storefront/shop/shop-filter-sidebar";
import { ShopFilterToggle } from "@/components/storefront/shop/shop-filter-toggle";
import { SmartProductSearch } from "@/components/storefront/shop/smart-product-search";
import { Skeleton } from "@/components/ui/skeleton";
import type { SearchIntent } from "@/domain/search-intent";
import { useMemberProductPrices } from "@/hooks/use-member-product-prices";
import { useShopInfiniteProducts } from "@/hooks/use-shop-infinite-products";
import {
  fetchCategories,
  fetchShopHeroBanners,
  fetchPublicProducts,
  fetchShopFilterFacets,
  fetchSmartSearchProducts,
} from "@/lib/api.functions";
import {
  buildShopListOptions,
  countActiveFilters,
  type ShopSearchState,
} from "@/lib/shop-search";

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
  smartQuery: z.string().optional(),
  category: z.string().optional(),
  page: z.coerce.number().optional(),
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

export const Route = createFileRoute("/_store/shop")({
  validateSearch: shopSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const listOptions = buildShopListOptions(deps as ShopSearchState, 1);

    const [categories, facets, shopBanners] = await Promise.all([
      fetchCategories(),
      fetchShopFilterFacets(),
      fetchShopHeroBanners(),
    ]);

    if (deps.smartQuery?.trim()) {
      const smartResult = await fetchSmartSearchProducts({
        data: {
          query: deps.smartQuery.trim(),
          ...listOptions,
          search: undefined,
        },
      });
      return {
        products: {
          data: smartResult.data,
          meta: smartResult.meta,
        },
        categories,
        facets,
        shopBanners,
        smartIntent: smartResult.intent,
        smartSource: smartResult.source,
      };
    }

    const products = await fetchPublicProducts({ data: listOptions });
    return {
      products,
      categories,
      facets,
      shopBanners,
      smartIntent: null as SearchIntent | null,
      smartSource: null as "llm" | "fallback" | null,
    };
  },
  pendingComponent: () => <PageLoading variant="grid" />,
  component: ShopPage,
});

function ShopPage() {
  const search = Route.useSearch() as ShopSearchState;
  const {
    products,
    categories,
    facets,
    shopBanners,
    smartIntent,
    smartSource,
  } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const isPending = useRouterState({
    select: (s) => s.status === "pending",
  });
  const { items, total, hasMore, loadingMore, loadMore } =
    useShopInfiniteProducts(search, products);
  const memberPrices = useMemberProductPrices(items);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const categoryNames = Object.fromEntries(
    categories.map((c) => [c.slug, c.name]),
  );
  const activeCount = countActiveFilters(search);

  function applySearch(patch: Partial<ShopSearchState>) {
    const manualKeys = [
      "category",
      "minPrice",
      "maxPrice",
      "productType",
      "inStock",
      "featured",
      "style",
      "color",
      "material",
      "search",
    ] as const;
    const touchesManual = manualKeys.some((k) => k in patch);

    navigate({
      search: {
        ...search,
        ...patch,
        smartQuery:
          "smartQuery" in patch
            ? patch.smartQuery
            : touchesManual
              ? undefined
              : search.smartQuery,
        page: undefined,
      },
    });
  }

  function handleSmartSearch(query: string) {
    navigate({
      search: {
        smartQuery: query,
        search: undefined,
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        productType: undefined,
        inStock: undefined,
        featured: undefined,
        style: undefined,
        color: undefined,
        material: undefined,
        page: undefined,
        sortBy: search.sortBy,
        sortDir: search.sortDir,
      },
    });
  }

  return (
    <>
      {shopBanners.length > 0 ? <ShopHeroSlider banners={shopBanners} /> : null}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {categories.length > 0 ? (
          <div className="mb-6">
            <CategoryRail
              categories={categories}
              activeSlug={search.category}
              showAll
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <ShopFilterSidebar
            search={search}
            categories={categories}
            facets={facets}
            activeCount={activeCount}
            onChange={applySearch}
          />

          <div className="min-w-0 flex-1">
            {/* Mobile: ตัวกรอง + AI */}
            <div className="mb-3 lg:hidden">
              <div className="flex items-center gap-2">
                <ShopFilterToggle
                  open={mobileFiltersOpen}
                  activeCount={activeCount}
                  onToggle={() => setMobileFiltersOpen(true)}
                  variant="bar"
                  className="h-9 shrink-0 px-3"
                />
                <SmartProductSearch
                  defaultValue={search.smartQuery ?? ""}
                  isPending={isPending && Boolean(search.smartQuery)}
                  onSearch={handleSmartSearch}
                  compact
                  className="h-9 shrink-0"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                แสดง {items.length} จาก {total} รายการ
              </p>
            </div>

            {/* Desktop toolbar */}
            <div className="mb-4 hidden items-center justify-between gap-3 lg:flex">
              <SmartProductSearch
                defaultValue={search.smartQuery ?? ""}
                isPending={isPending && Boolean(search.smartQuery)}
                onSearch={handleSmartSearch}
              />
              <p className="text-sm text-muted-foreground">
                แสดง {items.length} จาก {total} รายการ
              </p>
            </div>

            <ShopActiveFilters
              search={search}
              categoryNames={categoryNames}
              smartIntent={smartIntent}
              smartSource={smartSource}
              onChange={applySearch}
            />

            <ProductFeed
              products={items}
              title="สินค้าทั้งหมด"
              memberPrices={memberPrices}
              emptyMessage={
                search.smartQuery
                  ? "ไม่พบสินค้าที่ตรงกับคำค้นหา — ลองปรับคำอธิบายหรือใช้ตัวกรอง"
                  : "ยังไม่มีสินค้า"
              }
            />

            {loadingMore ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="aspect-square w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : null}

            <InfiniteScrollSentinel
              onLoadMore={() => void loadMore()}
              disabled={!hasMore || loadingMore || isPending}
            />
          </div>
        </div>

        <ShopFilterSheet
          open={mobileFiltersOpen}
          onOpenChange={setMobileFiltersOpen}
          search={search}
          categories={categories}
          facets={facets}
          onChange={(patch) => {
            applySearch(patch);
          }}
        />
      </div>
    </>
  );
}
