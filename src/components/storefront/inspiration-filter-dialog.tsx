import { Check, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n";
import {
  collectInspirationRoomTypes,
  collectInspirationTags,
  countInspirationFilters,
  EMPTY_INSPIRATION_FILTERS,
  filterInspirationRooms,
  toggleFilterValue,
  type InspirationFilters,
} from "@/lib/inspiration-search";
import { cn } from "@/lib/utils";
import type { InspirationRoomDto } from "@/types/api/inspiration";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: InspirationRoomDto[];
  searchQuery: string;
  filters: InspirationFilters;
  onApply: (filters: InspirationFilters) => void;
};

export function InspirationFilterDialog({
  open,
  onOpenChange,
  rooms,
  searchQuery,
  filters,
  onApply,
}: Props) {
  const { t } = useT();
  const [draft, setDraft] = useState<InspirationFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const roomTypes = useMemo(() => collectInspirationRoomTypes(rooms), [rooms]);
  const moodTags = useMemo(
    () => collectInspirationTags(rooms, "moodTags"),
    [rooms],
  );
  const styleTags = useMemo(
    () => collectInspirationTags(rooms, "styleTags"),
    [rooms],
  );

  const previewCount = useMemo(
    () => filterInspirationRooms(rooms, searchQuery, draft).length,
    [rooms, searchQuery, draft],
  );

  function applyAndClose() {
    onApply(draft);
    onOpenChange(false);
  }

  function clearDraft() {
    setDraft(EMPTY_INSPIRATION_FILTERS);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4" />
            {t("inspiration.filter.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {roomTypes.length > 0 ? (
            <FilterSection
              title={t("inspiration.filter.room")}
              options={roomTypes}
              selected={draft.roomTypes}
              onToggle={(value) =>
                setDraft((current) => ({
                  ...current,
                  roomTypes: toggleFilterValue(current.roomTypes, value),
                }))
              }
            />
          ) : null}

          {moodTags.length > 0 ? (
            <FilterSection
              title={t("inspiration.filter.mood")}
              options={moodTags}
              selected={draft.moods}
              onToggle={(value) =>
                setDraft((current) => ({
                  ...current,
                  moods: toggleFilterValue(current.moods, value),
                }))
              }
            />
          ) : null}

          {styleTags.length > 0 ? (
            <FilterSection
              title={t("inspiration.filter.style")}
              options={styleTags}
              selected={draft.styles}
              onToggle={(value) =>
                setDraft((current) => ({
                  ...current,
                  styles: toggleFilterValue(current.styles, value),
                }))
              }
            />
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-t bg-background px-5 py-4">
          {countInspirationFilters(draft) > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearDraft}
            >
              {t("inspiration.filter.clear")}
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            className="ml-auto min-w-[10rem] bg-primary hover:bg-primary/90"
            onClick={applyAndClose}
          >
            {t("inspiration.filter.showResults").replace(
              "{count}",
              String(previewCount),
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <section className="border-b border-border/60 pb-5 last:border-0 last:pb-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:border-primary/40",
              )}
            >
              {active ? <Check className="size-3.5 shrink-0" /> : null}
              {option}
            </button>
          );
        })}
      </div>
    </section>
  );
}
