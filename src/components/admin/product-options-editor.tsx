import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AdminOptionGroupInput,
  OPTION_GROUP_PRESETS,
  slugifyOptionKey,
} from "@/domain/product-options";

type Props = {
  groups: AdminOptionGroupInput[];
  onChange: (groups: AdminOptionGroupInput[]) => void;
};

export function ProductOptionsEditor({ groups, onChange }: Props) {
  function updateGroup(index: number, patch: Partial<AdminOptionGroupInput>) {
    onChange(groups.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function removeGroup(index: number) {
    onChange(groups.filter((_, i) => i !== index));
  }

  function addEmptyGroup() {
    onChange([
      ...groups,
      {
        groupKey: "",
        groupLabel: "",
        required: true,
        choices: [{ key: "", label: "", priceDelta: 0 }],
      },
    ]);
  }

  function addPreset(preset: (typeof OPTION_GROUP_PRESETS)[number]) {
    if (groups.some((g) => g.groupKey === preset.groupKey)) return;
    onChange([
      ...groups,
      {
        groupKey: preset.groupKey,
        groupLabel: preset.groupLabel,
        required: true,
        choices: preset.choices.map((c) => ({ ...c })),
      },
    ]);
  }

  function addChoice(groupIndex: number) {
    const group = groups[groupIndex];
    if (!group) return;
    updateGroup(groupIndex, {
      choices: [...group.choices, { key: "", label: "", priceDelta: 0 }],
    });
  }

  function updateChoice(
    groupIndex: number,
    choiceIndex: number,
    patch: Partial<AdminOptionGroupInput["choices"][number]>,
  ) {
    const group = groups[groupIndex];
    if (!group) return;
    updateGroup(groupIndex, {
      choices: group.choices.map((c, i) =>
        i === choiceIndex ? { ...c, ...patch } : c,
      ),
    });
  }

  function removeChoice(groupIndex: number, choiceIndex: number) {
    const group = groups[groupIndex];
    if (!group || group.choices.length <= 1) return;
    updateGroup(groupIndex, {
      choices: group.choices.filter((_, i) => i !== choiceIndex),
    });
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label className="text-base">ตัวเลือกสินค้า</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            สี ขนาด วัสดุ ฯลฯ — ลูกค้าเลือกก่อนใส่ตะกร้า
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addEmptyGroup}>
          <Plus className="mr-1 size-4" />
          เพิ่มกลุ่มตัวเลือก
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPTION_GROUP_PRESETS.map((preset) => (
          <Button
            key={preset.groupKey}
            type="button"
            variant="secondary"
            size="sm"
            disabled={groups.some((g) => g.groupKey === preset.groupKey)}
            onClick={() => addPreset(preset)}
          >
            + {preset.groupLabel}
          </Button>
        ))}
      </div>

      {!groups.length && (
        <p className="text-sm text-muted-foreground">
          ยังไม่มีตัวเลือก — กด &quot;เพิ่มกลุ่มตัวเลือก&quot; หรือเลือก preset ด้านบน
        </p>
      )}

      {groups.map((group, groupIndex) => (
        <div
          key={`${group.groupKey}-${groupIndex}`}
          className="space-y-3 rounded-md border bg-muted/20 p-3"
        >
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[120px] flex-1">
              <Label>ชื่อกลุ่ม (แสดงหน้าร้าน)</Label>
              <Input
                placeholder="เช่น สี"
                value={group.groupLabel}
                onChange={(e) => {
                  const groupLabel = e.target.value;
                  updateGroup(groupIndex, {
                    groupLabel,
                    groupKey:
                      group.groupKey ||
                      slugifyOptionKey(groupLabel) ||
                      group.groupKey,
                  });
                }}
              />
            </div>
            <div className="min-w-[120px] flex-1">
              <Label>รหัสกลุ่ม (ภายใน)</Label>
              <Input
                placeholder="color"
                value={group.groupKey}
                onChange={(e) =>
                  updateGroup(groupIndex, {
                    groupKey: slugifyOptionKey(e.target.value),
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm">
              <Checkbox
                checked={group.required}
                onCheckedChange={(v) =>
                  updateGroup(groupIndex, { required: !!v })
                }
              />
              บังคับเลือก
            </label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive"
              onClick={() => removeGroup(groupIndex)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">ตัวเลือกย่อย</Label>
            {group.choices.map((choice, choiceIndex) => (
              <div
                key={`${choice.key}-${choiceIndex}`}
                className="flex flex-wrap items-end gap-2"
              >
                <Input
                  className="min-w-[140px] flex-1"
                  placeholder="ชื่อ เช่น ทราย"
                  value={choice.label}
                  onChange={(e) => {
                    const label = e.target.value;
                    updateChoice(groupIndex, choiceIndex, {
                      label,
                      key: choice.key || slugifyOptionKey(label),
                    });
                  }}
                />
                <Input
                  className="w-28"
                  type="number"
                  step="0.01"
                  placeholder="+ราคา"
                  value={choice.priceDelta}
                  onChange={(e) =>
                    updateChoice(groupIndex, choiceIndex, {
                      priceDelta: Number(e.target.value),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={group.choices.length <= 1}
                  onClick={() => removeChoice(groupIndex, choiceIndex)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addChoice(groupIndex)}
            >
              <Plus className="mr-1 size-4" />
              เพิ่มตัวเลือก
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
