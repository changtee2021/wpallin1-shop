import { useMemo, useState } from "react";

import { InspirationMaterialCard } from "@/components/storefront/inspiration-material-card";
import { InspirationMaterialCategoryNav } from "@/components/storefront/inspiration-material-category-nav";
import { InspirationMaterialFilterDialog } from "@/components/storefront/inspiration-material-filter-dialog";
import { InspirationMaterialFilterToolbar } from "@/components/storefront/inspiration-material-filter-toolbar";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import { filterInspirationMaterials } from "@/lib/inspiration-material-search";
import type {
  InspirationMaterialDto,
  InspirationMaterialType,
} from "@/types/api/inspiration";
import type { CategoryDto } from "@/types/api/categories";

type Props = {
  materials: InspirationMaterialDto[];
  categories: CategoryDto[];
};

export function InspirationMaterialMasonryGrid({
  materials,
  categories,
}: Props) {
  const { t } = useT();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<InspirationMaterialType[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => filterInspirationMaterials(materials, searchQuery, activeTypes),
    [materials, searchQuery, activeTypes],
  );

  if (!materials.length) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        {t("inspiration.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InspirationMaterialFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTypes={activeTypes}
        onOpenFilters={() => setFilterOpen(true)}
      />

      <InspirationMaterialFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        materials={materials}
        searchQuery={searchQuery}
        activeTypes={activeTypes}
        onApply={setActiveTypes}
      />

      <InspirationMaterialCategoryNav categories={categories} />

      {activeTypes.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {activeTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {t(`inspiration.materials.type.${type}`)}
              <button
                type="button"
                onClick={() =>
                  setActiveTypes((current) =>
                    current.filter((item) => item !== type),
                  )
                }
                className="rounded-full px-1 text-muted-foreground hover:text-foreground"
                aria-label="Remove"
              >
                ×
              </button>
            </Badge>
          ))}
          <button
            type="button"
            onClick={() => setActiveTypes([])}
            className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {t("inspiration.filter.clear")}
          </button>
        </div>
      ) : null}

      <p className="text-right text-xs text-muted-foreground">
        {t("inspiration.materials.grid.count").replace(
          "{count}",
          String(filtered.length),
        )}
      </p>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
        {filtered.map((material) => (
          <InspirationMaterialCard key={material.slug} material={material} />
        ))}
      </div>

      {!filtered.length ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("inspiration.materials.filter.noMatch")}
        </p>
      ) : null}
    </div>
  );
}
