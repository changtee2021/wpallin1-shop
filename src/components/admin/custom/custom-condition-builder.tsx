import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CONDITION_KEYS,
  CONDITION_LABELS,
  moveItem,
  type ConditionKey,
  type ConditionRow,
} from "./custom-utils";

type Props = {
  rows: ConditionRow[];
  onChange: (rows: ConditionRow[]) => void;
  conditionOptions: (
    key: ConditionKey,
  ) => Array<{ value: string; label: string }>;
};

export function CustomConditionBuilder({
  rows,
  onChange,
  conditionOptions,
}: Props) {
  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Label>เงื่อนไข</Label>
          <p className="text-xs text-muted-foreground">
            เลือกว่าตัวเลือกไหนจับคู่กับตัวเลือกไหน
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            onChange([
              ...rows,
              { id: crypto.randomUUID(), key: "product_type", value: "" },
            ])
          }
        >
          <Plus className="mr-2 size-4" />
          เพิ่มเงื่อนไข
        </Button>
      </div>
      {rows.map((row, index) => (
        <div
          key={row.id}
          className="grid gap-2 rounded-lg border bg-background p-3 md:grid-cols-[140px_1fr_auto]"
        >
          <Select
            value={row.key}
            onValueChange={(value) =>
              onChange(
                rows.map((r) =>
                  r.id === row.id
                    ? {
                        ...r,
                        key: value as ConditionKey,
                        value: value !== r.key ? "" : r.value,
                      }
                    : r,
                ),
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITION_KEYS.map((key) => (
                <SelectItem key={key} value={key}>
                  {CONDITION_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={row.value || "__none__"}
            onValueChange={(value) =>
              onChange(
                rows.map((r) =>
                  r.id === row.id
                    ? { ...r, value: value === "__none__" ? "" : value }
                    : r,
                ),
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="เลือกค่า" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— เลือกค่า —</SelectItem>
              {conditionOptions(row.key).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === 0}
              onClick={() => onChange(moveItem(rows, index, -1))}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={index === rows.length - 1}
              onClick={() => onChange(moveItem(rows, index, 1))}
            >
              <ArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
