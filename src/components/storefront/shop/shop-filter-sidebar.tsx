import { useEffect, useState } from "react";

import { ShopFilterPanel } from "@/components/storefront/shop/shop-filter-panel";
import {
  ShopFilterSidebarToggle,
  ShopFilterToggle,
} from "@/components/storefront/shop/shop-filter-toggle";
import { cn } from "@/lib/utils";
import type { ShopSearchState } from "@/lib/shop-search";
import type { CategoryDto } from "@/types/api/categories";
import type { ShopFilterFacets } from "@/types/api/products";

const STORAGE_KEY = "wpall-shop-filters-open";

type ShopFilterSidebarProps = {
  search: ShopSearchState;
  categories: CategoryDto[];
  facets: ShopFilterFacets;
  activeCount: number;
  onChange: (patch: Partial<ShopSearchState>) => void;
};

export function ShopFilterSidebar({
  search,
  categories,
  facets,
  activeCount,
  onChange,
}: ShopFilterSidebarProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored != null) setOpen(stored === "true");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <div className="relative hidden lg:flex lg:items-start lg:gap-0">
      {!open ? (
        <ShopFilterToggle
          open={open}
          activeCount={activeCount}
          onToggle={toggle}
          variant="collapsed-tab"
        />
      ) : null}
      <aside
        className={cn(
          "shrink-0 overflow-hidden transition-[width,opacity] duration-300",
          open ? "w-[280px] opacity-100" : "w-0 opacity-0",
        )}
      >
        <div className="w-[280px] rounded-lg border bg-card p-4 shadow-sm">
          <ShopFilterSidebarToggle open={open} onToggle={toggle} />
          <ShopFilterPanel
            search={search}
            categories={categories}
            facets={facets}
            onChange={onChange}
          />
        </div>
      </aside>
    </div>
  );
}

export { STORAGE_KEY as SHOP_FILTERS_STORAGE_KEY };
