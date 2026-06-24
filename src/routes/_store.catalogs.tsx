import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { CatalogCategoryHero } from "@/components/storefront/catalog-category-hero";
import { MarketingCatalogGrid } from "@/components/storefront/marketing-catalog-grid";
import { Button } from "@/components/ui/button";
import { fetchPublicMarketingCatalogs } from "@/lib/api.functions";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/catalogs")({
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
  component: CatalogsPage,
});

function CatalogsPage() {
  const { t } = useT();
  const { catalogs, categories } = Route.useLoaderData();
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    if (activeCategory === "all") return catalogs;
    return catalogs.filter((item) => item.categoryId === activeCategory);
  }, [activeCategory, catalogs]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const catalog of catalogs) {
      if (!catalog.categoryId) continue;
      counts[catalog.categoryId] = (counts[catalog.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [catalogs]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <BookOpen className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t("catalogs.title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("catalogs.subtitle")}
            </p>
          </div>
        </div>
      </div>

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

      <MarketingCatalogGrid catalogs={filtered} />
    </div>
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
