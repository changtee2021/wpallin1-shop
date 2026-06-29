import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InlineRowsSkeleton } from "@/components/loading";
import { ProductOptionSelectors } from "@/components/storefront/product-option-selectors";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type ProductOptionGroupDto,
  type SelectedProductOptions,
} from "@/domain/product-options";
import { fetchProductOptionGroups } from "@/lib/api.functions";
import type { CartItemDto } from "@/types/api/cart";

type Props = {
  item: CartItemDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    itemId: string,
    selectedOptions: SelectedProductOptions,
  ) => Promise<void>;
};

export function CartItemOptionsSheet({
  item,
  open,
  onOpenChange,
  onSave,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroupDto[]>([]);
  const [selectedOptions, setSelectedOptions] =
    useState<SelectedProductOptions>({});

  useEffect(() => {
    if (!open || !item?.productId || !item.optionsEditable) {
      setOptionGroups([]);
      return;
    }

    setSelectedOptions(item.selectedOptions);
    setLoading(true);
    void fetchProductOptionGroups({ data: { productId: item.productId } })
      .then((groups) => {
        setOptionGroups(groups);
        if (groups.length && !Object.keys(item.selectedOptions).length) {
          const initial: SelectedProductOptions = {};
          for (const group of groups) {
            if (group.choices[0]) {
              initial[group.groupKey] = group.choices[0].key;
            }
          }
          setSelectedOptions(initial);
        }
      })
      .catch(() => {
        setOptionGroups([]);
        toast.error("โหลดตัวเลือกไม่สำเร็จ");
      })
      .finally(() => setLoading(false));
  }, [open, item]);

  if (!item) return null;

  async function handleSave() {
    if (!item) return;
    setSaving(true);
    try {
      await onSave(item.id, selectedOptions);
      toast.success("อัปเดตตัวเลือกแล้ว");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[90vh] overflow-y-auto rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle>แก้ไขตัวเลือก</SheetTitle>
          <SheetDescription className="line-clamp-2 text-left">
            {item.productName}
          </SheetDescription>
        </SheetHeader>

        <div className="py-2">
          {loading ? (
            <InlineRowsSkeleton rows={4} className="py-4" />
          ) : !optionGroups.length ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              สินค้านี้ไม่มีตัวเลือกให้แก้ไข
            </p>
          ) : (
            <ProductOptionSelectors
              groups={optionGroups}
              value={selectedOptions}
              onChange={setSelectedOptions}
            />
          )}
        </div>

        <SheetFooter className="gap-2 sm:flex-col">
          <Button
            className="w-full bg-accent hover:bg-accent/90"
            size="lg"
            disabled={saving || loading || !optionGroups.length}
            onClick={() => void handleSave()}
          >
            {saving ? "กำลังบันทึก..." : "ยืนยันตัวเลือก"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function CartItemOptionChip({
  item,
  onEdit,
}: {
  item: CartItemDto;
  onEdit: () => void;
}) {
  if (!item.optionSummary && !item.optionsEditable) return null;

  if (!item.optionsEditable) {
    return item.optionSummary ? (
      <div className="mt-2 rounded-lg bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground">
        {item.optionSummary}
      </div>
    ) : null;
  }

  return (
    <button
      type="button"
      className="mt-2 flex w-full items-center justify-between gap-2 rounded-lg bg-primary/5 px-2.5 py-2 text-left text-xs text-primary transition-colors hover:bg-primary/10"
      onClick={onEdit}
    >
      <span className="min-w-0 flex-1">
        {item.optionSummary ?? "เลือกตัวเลือกสินค้า"}
      </span>
      <span className="inline-flex shrink-0 items-center gap-0.5 font-medium">
        แก้ไข
        <ChevronRight className="size-3.5" />
      </span>
    </button>
  );
}
