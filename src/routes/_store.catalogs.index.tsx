import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  BrandGridSkeleton,
  BrandPageError,
} from "@/components/brand/page-states";
import { CatalogCategoryHero } from "@/components/storefront/catalog-category-hero";
import { MarketingCatalogGrid } from "@/components/storefront/marketing-catalog-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPublicMarketingCatalogs } from "@/lib/api.functions";
import { useT } from "@/i18n";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/catalogs/")({
  loader: async () => {
    const catalogs = await fetchPublicMarketingCatalogs({ data: {} });
    const categories = Array.from(
      new Map(
        catalogs
          .filter((item) => item.categoryId && item.categoryName)
          .map((item) => [item.categoryId!, item.categoryName!]),
      ).entries(),
    ).map(([id, name]) => ({ id, name }));
    return { catalogs, categories };
  },
  head: () =>
    pageHead({
      title: "แคตตาล็อกสินค้า | WP ALL",
      description:
        "อ่านและดาวน์โหลดแคตตาล็อกม่าน มู่ลี่ ราง และระบบมอเตอร์ WP ALL ออนไลน์",
      path: "/catalogs",
    }),
  pendingComponent: () => (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <BrandGridSkeleton count={6} />
    </div>
  ),
  errorComponent: ({ reset }) => <BrandPageError onRetry={reset} />,
  component: CatalogsPage,
});

function CatalogsPage() {
  const { t } = useT();
  const { catalogs, categories } = Route.useLoaderData();
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = catalogs;
    if (activeCategory !== "all") {
      list = list.filter((item) => item.categoryId === activeCategory);
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.categoryName?.toLowerCase().includes(q) ||
        item.version?.toLowerCase().includes(q) ||
        item.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }, [activeCategory, catalogs, search]);

  const featured = useMemo(
    () => filtered.filter((item) => item.isFeatured),
    [filtered],
  );

  const regular = useMemo(
    () => filtered.filter((item) => !item.isFeatured),
    [filtered],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const catalog of catalogs) {
      if (!catalog.categoryId) continue;
      counts[catalog.categoryId] = (counts[catalog.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [catalogs]);

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          <SectionHeading
            as="h1"
            kicker="Catalogue"
            title={t("catalogs.title")}
            description={t("catalogs.subtitle")}
          />
          <div className="relative mt-8 max-w-xl">
            <Search
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("catalogs.searchPlaceholder")}
              aria-label={t("catalogs.searchPlaceholder")}
              className="h-12 rounded-full bg-background pl-11"
            />
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {activeCategory === "all" && categories.length > 0 ? (
          <CatalogCategoryHero
            categories={categories}
            counts={categoryCounts}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
            title={t("catalogs.categories.title")}
          />
        ) : null}

        <div className="mb-6 flex flex-wrap gap-2">
          <CategoryPill
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            {t("catalogs.all")} ({catalogs.length})
          </CategoryPill>
          {categories.map((category) => {
            const count = catalogs.filter(
              (item) => item.categoryId === category.id,
            ).length;
            return (
              <CategoryPill
                key={category.id}
                active={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name} ({count})
              </CategoryPill>
            );
          })}
        </div>

        {featured.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">
              {t("catalogs.featured")}
            </h2>
            <MarketingCatalogGrid catalogs={featured} />
          </section>
        ) : null}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-sm border border-dashed border-border py-16 text-center">
            <BookOpen className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {catalogs.length === 0
                ? t("catalogs.empty")
                : t("catalogs.noResults")}
            </p>
          </div>
        ) : (
          <MarketingCatalogGrid
            catalogs={featured.length ? regular : filtered}
          />
        )}
      </div>
    </>
  );
}

function CategoryPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      size="sm"
      variant={active ? "default" : "outline"}
      className={cn("rounded-full", active && "bg-primary")}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}
