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
    <div className="mt-4 space-y-4">
      {groups.map((group) => (
        <div key={group.groupKey}>
          <Label className="text-sm">
            {group.groupLabel}
            {group.required && <span className="text-destructive"> *</span>}
          </Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {group.choices.map((choice) => {
              const selected = value[group.groupKey] === choice.key;
              return (
                <Button
                  key={choice.key}
                  type="button"
                  variant={selected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-auto min-h-9 whitespace-normal",
                    selected && "bg-primary",
                  )}
                  onClick={() =>
                    onChange({ ...value, [group.groupKey]: choice.key })
                  }
                >
                  {choice.label}
                  {choice.priceDelta > 0 && (
                    <span className="ml-1 text-xs opacity-80">
                      +{formatPrice(choice.priceDelta)}
                    </span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
