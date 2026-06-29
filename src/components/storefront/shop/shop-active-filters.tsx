import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import {
  buildActiveFilterChips,
  clearAllFilters,
  type ShopSearchState,
} from "@/lib/shop-search";
import type { SearchIntent } from "@/domain/search-intent";

type ShopActiveFiltersProps = {
  search: ShopSearchState;
  categoryNames: Record<string, string>;
  smartIntent?: SearchIntent | null;
  smartSource?: "llm" | "fallback" | null;
  onChange: (patch: Partial<ShopSearchState>) => void;
};

export function ShopActiveFilters({
  search,
  categoryNames,
  smartIntent,
  smartSource,
  onChange,
}: ShopActiveFiltersProps) {
  const { t } = useT();
  const chips = buildActiveFilterChips(search, categoryNames);

  if (!chips.length && !smartIntent?.explanationTh) return null;

  return (
    <div className="mb-4 space-y-2">
      {smartIntent?.explanationTh ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {t("shop.smartSearch.explanation")}
          </span>
          <span className="font-medium text-foreground">
            {smartIntent.explanationTh}
          </span>
          {smartSource ? (
            <Badge variant="outline" className="text-[10px]">
              {smartSource === "llm"
                ? t("shop.smartSearch.aiBadge")
                : t("shop.smartSearch.fallbackBadge")}
            </Badge>
          ) : null}
        </div>
      ) : null}
      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Badge
              key={chip.key}
              variant="secondary"
              className="gap-1 pr-1 font-normal"
            >
              {chip.label}
              <button
                type="button"
                className="rounded-full p-0.5 hover:bg-muted"
                aria-label={`ลบ ${chip.label}`}
                onClick={() => onChange({ ...chip.onRemove(), page: 1 })}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground"
            onClick={() => onChange(clearAllFilters())}
          >
            {t("shop.filters.clearAll")}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
