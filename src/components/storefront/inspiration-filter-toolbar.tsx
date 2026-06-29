import { Search, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";
import {
  countInspirationFilters,
  type InspirationFilters,
} from "@/lib/inspiration-search";

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters: InspirationFilters;
  onOpenFilters: () => void;
};

export function InspirationFilterToolbar({
  searchQuery,
  onSearchChange,
  filters,
  onOpenFilters,
}: Props) {
  const { t } = useT();
  const activeCount = countInspirationFilters(filters);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("inspiration.search.placeholder")}
          className="h-11 border-border bg-white pl-10"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 shrink-0 gap-2 border-border px-4"
        onClick={onOpenFilters}
      >
        <SlidersHorizontal className="size-4" />
        {t("inspiration.filter.button")}
        {activeCount > 0 ? (
          <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
            {activeCount}
          </Badge>
        ) : null}
      </Button>
    </div>
  );
}
