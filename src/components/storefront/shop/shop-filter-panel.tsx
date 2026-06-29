import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Slider } from "@/components/ui/slider";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import {
  isShopSortActive,
  SHOP_SORT_OPTIONS,
  type ShopSearchState,
} from "@/lib/shop-search";
import type { CategoryDto } from "@/types/api/categories";
import type { ShopFilterFacets } from "@/types/api/products";

type ShopFilterPanelProps = {
  search: ShopSearchState;
  categories: CategoryDto[];
  facets: ShopFilterFacets;
  onChange: (patch: Partial<ShopSearchState>) => void;
  className?: string;
};

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="border-b border-border pb-4"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-primary">
        {title}
        <ChevronDown className="size-4 shrink-0 transition-transform [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pt-1">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function toggleArrayValue(list: string[] | undefined, value: string): string[] {
  const current = list ?? [];
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}

export function ShopFilterPanel({
  search,
  categories,
  facets,
  onChange,
  className,
}: ShopFilterPanelProps) {
  const { t } = useT();
  const priceMin = facets.priceRange.min;
  const priceMax = facets.priceRange.max;
  const [priceRange, setPriceRange] = useState([
    search.minPrice ?? priceMin,
    search.maxPrice ?? priceMax,
  ]);

  useEffect(() => {
    setPriceRange([search.minPrice ?? priceMin, search.maxPrice ?? priceMax]);
  }, [search.minPrice, search.maxPrice, priceMin, priceMax]);

  const categoryCounts = new Map(
    facets.categories.map((c) => [c.slug, c.count]),
  );

  return (
    <div className={cn("space-y-1", className)}>
      <FilterSection title={t("shop.sort")}>
        {SHOP_SORT_OPTIONS.map((opt) => {
          const active = isShopSortActive(search, opt.sortBy, opt.sortDir);
          return (
            <button
              key={`${opt.sortBy}:${opt.sortDir}`}
              type="button"
              className={cn(
                "flex w-full items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                active && "font-semibold text-primary",
              )}
              onClick={() =>
                onChange({
                  sortBy: opt.sortBy,
                  sortDir: opt.sortDir,
                  page: undefined,
                })
              }
            >
              {t(opt.labelKey)}
            </button>
          );
        })}
      </FilterSection>

      <FilterSection title={t("shop.filters.categories")}>
        <button
          type="button"
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
            !search.category && "font-semibold text-primary",
          )}
          onClick={() => onChange({ category: undefined, page: 1 })}
        >
          <span>{t("shop.filters.allProducts")}</span>
        </button>
        {categories.map((cat) => {
          const count = categoryCounts.get(cat.slug);
          const active = search.category === cat.slug;
          return (
            <button
              key={cat.id}
              type="button"
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                active && "font-semibold text-primary",
              )}
              onClick={() =>
                onChange({
                  category: active ? undefined : cat.slug,
                  page: 1,
                })
              }
            >
              <span>{cat.name}</span>
              {count != null ? (
                <span className="text-xs text-muted-foreground">({count})</span>
              ) : null}
            </button>
          );
        })}
      </FilterSection>

      <FilterSection title={t("shop.filters.price")}>
        <Slider
          min={priceMin}
          max={priceMax}
          step={Math.max(100, Math.floor((priceMax - priceMin) / 50))}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v)}
          onValueCommit={(v) =>
            onChange({
              minPrice: v[0] <= priceMin ? undefined : v[0],
              maxPrice: v[1] >= priceMax ? undefined : v[1],
              page: 1,
            })
          }
        />
        <p className="text-xs text-muted-foreground">
          {t("shop.filters.priceRange")
            .replace("{min}", priceRange[0].toLocaleString())
            .replace("{max}", priceRange[1].toLocaleString())}
        </p>
      </FilterSection>

      <FilterSection title={t("shop.filters.productType")} defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <Checkbox
            checked={search.productType === "standard"}
            onCheckedChange={(checked) =>
              onChange({
                productType: checked ? "standard" : undefined,
                page: 1,
              })
            }
          />
          <span className="text-sm">{t("shop.filters.standard")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <Checkbox
            checked={search.productType === "custom"}
            onCheckedChange={(checked) =>
              onChange({
                productType: checked ? "custom" : undefined,
                page: 1,
              })
            }
          />
          <span className="text-sm">{t("shop.madeToOrder")}</span>
        </label>
      </FilterSection>

      {facets.styles.length > 0 ? (
        <FilterSection title={t("shop.filters.style")} defaultOpen={false}>
          {facets.styles.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 py-1"
            >
              <Checkbox
                checked={search.style?.includes(opt.value) ?? false}
                onCheckedChange={() =>
                  onChange({
                    style: toggleArrayValue(search.style, opt.value),
                    page: 1,
                  })
                }
              />
              <span className="text-sm">
                {opt.value}{" "}
                <span className="text-muted-foreground">({opt.count})</span>
              </span>
            </label>
          ))}
        </FilterSection>
      ) : null}

      {facets.colors.length > 0 ? (
        <FilterSection title={t("shop.filters.color")} defaultOpen={false}>
          {facets.colors.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 py-1"
            >
              <Checkbox
                checked={search.color?.includes(opt.value) ?? false}
                onCheckedChange={() =>
                  onChange({
                    color: toggleArrayValue(search.color, opt.value),
                    page: 1,
                  })
                }
              />
              <span className="text-sm">
                {opt.value}{" "}
                <span className="text-muted-foreground">({opt.count})</span>
              </span>
            </label>
          ))}
        </FilterSection>
      ) : null}

      {facets.materials.length > 0 ? (
        <FilterSection title={t("shop.filters.material")} defaultOpen={false}>
          {facets.materials.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 py-1"
            >
              <Checkbox
                checked={search.material?.includes(opt.value) ?? false}
                onCheckedChange={() =>
                  onChange({
                    material: toggleArrayValue(search.material, opt.value),
                    page: 1,
                  })
                }
              />
              <span className="text-sm">
                {opt.value}{" "}
                <span className="text-muted-foreground">({opt.count})</span>
              </span>
            </label>
          ))}
        </FilterSection>
      ) : null}

      <FilterSection title={t("shop.filters.other")} defaultOpen={false}>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <Checkbox
            checked={search.inStock ?? false}
            onCheckedChange={(checked) =>
              onChange({ inStock: checked ? true : undefined, page: 1 })
            }
          />
          <span className="text-sm">{t("shop.filters.inStock")}</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1">
          <Checkbox
            checked={search.featured ?? false}
            onCheckedChange={(checked) =>
              onChange({ featured: checked ? true : undefined, page: 1 })
            }
          />
          <span className="text-sm">{t("shop.filters.featured")}</span>
        </label>
      </FilterSection>
    </div>
  );
}
