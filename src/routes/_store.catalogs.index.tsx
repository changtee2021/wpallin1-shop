import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { CatalogCategoryHero } from "@/components/storefront/catalog-category-hero";
import { MarketingCatalogGrid } from "@/components/storefront/marketing-catalog-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchPublicMarketingCatalogs } from "@/lib/api.functions";
import { useT } from "@/i18n";
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <BookOpen className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">
              {t("catalogs.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t("catalogs.subtitle")}
            </p>
          </div>
        </div>
        <div className="relative mt-6 max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("catalogs.searchPlaceholder")}
            className="h-11 rounded-full bg-background pl-10 shadow-sm"
          />
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

      {featured.length > 0 ? (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">
            {t("catalogs.featured")}
          </h2>
          <MarketingCatalogGrid catalogs={featured} />
        </section>
      ) : null}

      <MarketingCatalogGrid catalogs={featured.length ? regular : filtered} />
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
