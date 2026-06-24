import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type {
  ProductOptionGroupDto,
  SelectedProductOptions,
} from "@/domain/product-options";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  groups: ProductOptionGroupDto[];
  value: SelectedProductOptions;
  onChange: (next: SelectedProductOptions) => void;
};

export function ProductOptionSelectors({ groups, value, onChange }: Props) {
  if (!groups.length) return null;

  return (
    <div className="mt-5 rounded-2xl border bg-card p-4 shadow-sm">
      <div className="mb-4">
        <p className="text-sm font-semibold">เลือกตัวเลือกสินค้า</p>
        <p className="text-xs text-muted-foreground">
          ราคาและรายละเอียดจะอัปเดตตามตัวเลือกที่เลือก
        </p>
      </div>
      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.groupKey}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <Label className="text-sm font-medium">
                {group.groupLabel}
                {group.required && <span className="text-destructive"> *</span>}
              </Label>
              <span className="text-xs text-muted-foreground">
                {group.choices.length} ตัวเลือก
              </span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.choices.map((choice) => {
                const selected = value[group.groupKey] === choice.key;
                return (
                  <Button
                    key={choice.key}
                    type="button"
                    variant="outline"
                    className={cn(
                      "h-auto min-h-14 justify-between whitespace-normal rounded-xl px-3 py-3 text-left transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/30 hover:bg-primary/15"
                        : "bg-background hover:border-primary/50 hover:bg-primary/5",
                    )}
                    onClick={() =>
                      onChange({ ...value, [group.groupKey]: choice.key })
                    }
                  >
                    <span className="min-w-0">
                      <span className="block font-medium">{choice.label}</span>
                      <span className="block text-xs text-muted-foreground">
                        {choice.priceDelta > 0
                          ? `เพิ่ม ${formatPrice(choice.priceDelta)}`
                          : "ราคาเดิม"}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "size-4 rounded-full border",
                        selected
                          ? "border-primary bg-primary shadow-inner"
                          : "border-muted-foreground/40",
                      )}
                    />
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
