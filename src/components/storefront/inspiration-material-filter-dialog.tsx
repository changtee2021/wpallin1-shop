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
  ALL_INSPIRATION_MATERIAL_TYPES,
  countInspirationMaterialFilters,
  filterInspirationMaterials,
  toggleMaterialTypeFilter,
} from "@/lib/inspiration-material-search";
import { cn } from "@/lib/utils";
import type {
  InspirationMaterialDto,
  InspirationMaterialType,
} from "@/types/api/inspiration";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  materials: InspirationMaterialDto[];
  searchQuery: string;
  activeTypes: InspirationMaterialType[];
  onApply: (types: InspirationMaterialType[]) => void;
};

export function InspirationMaterialFilterDialog({
  open,
  onOpenChange,
  materials,
  searchQuery,
  activeTypes,
  onApply,
}: Props) {
  const { t } = useT();
  const [draft, setDraft] = useState<InspirationMaterialType[]>(activeTypes);

  useEffect(() => {
    if (open) setDraft(activeTypes);
  }, [open, activeTypes]);

  const previewCount = useMemo(
    () => filterInspirationMaterials(materials, searchQuery, draft).length,
    [materials, searchQuery, draft],
  );

  function applyAndClose() {
    onApply(draft);
    onOpenChange(false);
  }

  function clearDraft() {
    setDraft([]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] max-w-md flex-col gap-0 overflow-hidden p-0 sm:rounded-2xl">
        <DialogHeader className="border-b px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-base">
            <SlidersHorizontal className="size-4" />
            {t("inspiration.materials.filter.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {t("inspiration.materials.filter.type")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {ALL_INSPIRATION_MATERIAL_TYPES.map((type) => {
                const active = draft.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setDraft((current) =>
                        toggleMaterialTypeFilter(current, type),
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-primary/40",
                    )}
                  >
                    {active ? <Check className="size-3.5 shrink-0" /> : null}
                    {t(`inspiration.materials.type.${type}`)}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <div className="flex items-center gap-2 border-t bg-background px-5 py-4">
          {countInspirationMaterialFilters(draft) > 0 ? (
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
