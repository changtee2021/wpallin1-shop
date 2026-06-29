import { useMemo, useState } from "react";

import { InspirationFilterDialog } from "@/components/storefront/inspiration-filter-dialog";
import { InspirationFilterToolbar } from "@/components/storefront/inspiration-filter-toolbar";
import { InspirationMaterialCategoryNav } from "@/components/storefront/inspiration-material-category-nav";
import { InspirationRoomCard } from "@/components/storefront/inspiration-room-card";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/i18n";
import {
  countInspirationFilters,
  EMPTY_INSPIRATION_FILTERS,
  filterInspirationRooms,
  type InspirationFilters,
} from "@/lib/inspiration-search";
import type { InspirationRoomDto } from "@/types/api/inspiration";
import type { CategoryDto } from "@/types/api/categories";

type Props = {
  rooms: InspirationRoomDto[];
  categories: CategoryDto[];
};

export function InspirationMasonryGrid({ rooms, categories }: Props) {
  const { t } = useT();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<InspirationFilters>(
    EMPTY_INSPIRATION_FILTERS,
  );
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = useMemo(
    () => filterInspirationRooms(rooms, searchQuery, filters),
    [rooms, searchQuery, filters],
  );

  const activeFilterCount = countInspirationFilters(filters);

  if (!rooms.length) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-sm text-muted-foreground">
        {t("inspiration.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <InspirationFilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filters={filters}
        onOpenFilters={() => setFilterOpen(true)}
      />

      <InspirationFilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        rooms={rooms}
        searchQuery={searchQuery}
        filters={filters}
        onApply={setFilters}
      />

      <InspirationMaterialCategoryNav categories={categories} />

      {(searchQuery.trim() || activeFilterCount > 0) && (
        <ActiveFilterChips
          searchQuery={searchQuery}
          filters={filters}
          onClearSearch={() => setSearchQuery("")}
          onRemoveRoom={(value) =>
            setFilters((current) => ({
              ...current,
              roomTypes: current.roomTypes.filter((item) => item !== value),
            }))
          }
          onRemoveMood={(value) =>
            setFilters((current) => ({
              ...current,
              moods: current.moods.filter((item) => item !== value),
            }))
          }
          onRemoveStyle={(value) =>
            setFilters((current) => ({
              ...current,
              styles: current.styles.filter((item) => item !== value),
            }))
          }
          onClearAll={() => {
            setSearchQuery("");
            setFilters(EMPTY_INSPIRATION_FILTERS);
          }}
        />
      )}

      <p className="text-right text-xs text-muted-foreground">
        {t("inspiration.grid.count").replace(
          "{count}",
          String(filtered.length),
        )}
      </p>

      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
        {filtered.map((room, index) => (
          <InspirationRoomCard
            key={room.id}
            room={room}
            imageAspect={index % 3 === 0 ? "tall" : "default"}
          />
        ))}
      </div>

      {!filtered.length ? (
        <p className="text-center text-sm text-muted-foreground">
          {t("inspiration.filter.noMatch")}
        </p>
      ) : null}
    </div>
  );
}

function ActiveFilterChips({
  searchQuery,
  filters,
  onClearSearch,
  onRemoveRoom,
  onRemoveMood,
  onRemoveStyle,
  onClearAll,
}: {
  searchQuery: string;
  filters: InspirationFilters;
  onClearSearch: () => void;
  onRemoveRoom: (value: string) => void;
  onRemoveMood: (value: string) => void;
  onRemoveStyle: (value: string) => void;
  onClearAll: () => void;
}) {
  const { t } = useT();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {searchQuery.trim() ? (
        <RemovableChip
          label={`"${searchQuery.trim()}"`}
          onRemove={onClearSearch}
        />
      ) : null}
      {filters.roomTypes.map((tag) => (
        <RemovableChip
          key={`room-${tag}`}
          label={tag}
          onRemove={() => onRemoveRoom(tag)}
        />
      ))}
      {filters.moods.map((tag) => (
        <RemovableChip
          key={`mood-${tag}`}
          label={tag}
          onRemove={() => onRemoveMood(tag)}
        />
      ))}
      {filters.styles.map((tag) => (
        <RemovableChip
          key={`style-${tag}`}
          label={tag}
          onRemove={() => onRemoveStyle(tag)}
        />
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        {t("inspiration.filter.clear")}
      </button>
    </div>
  );
}

function RemovableChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1 font-normal">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full px-1 text-muted-foreground hover:text-foreground"
        aria-label="Remove"
      >
        ×
      </button>
    </Badge>
  );
}
