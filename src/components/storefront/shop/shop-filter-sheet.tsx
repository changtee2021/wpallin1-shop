import { ShopFilterPanel } from "@/components/storefront/shop/shop-filter-panel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useT } from "@/i18n";
import type { ShopSearchState } from "@/lib/shop-search";
import type { CategoryDto } from "@/types/api/categories";
import type { ShopFilterFacets } from "@/types/api/products";

type ShopFilterSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  search: ShopSearchState;
  categories: CategoryDto[];
  facets: ShopFilterFacets;
  onChange: (patch: Partial<ShopSearchState>) => void;
};

export function ShopFilterSheet({
  open,
  onOpenChange,
  search,
  categories,
  facets,
  onChange,
}: ShopFilterSheetProps) {
  const { t } = useT();

  function handleChange(patch: Partial<ShopSearchState>) {
    onChange(patch);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="flex w-full flex-col sm:max-w-sm">
        <SheetHeader>
          <SheetTitle>{t("shop.filters")}</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex-1 overflow-y-auto pr-1">
          <ShopFilterPanel
            search={search}
            categories={categories}
            facets={facets}
            onChange={handleChange}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
