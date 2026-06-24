export type ProductOptionChoiceDto = {
  key: string;
  label: string;
  priceDelta: number;
};

export type ProductOptionGroupDto = {
  groupKey: string;
  groupLabel: string;
  required: boolean;
  choices: ProductOptionChoiceDto[];
};

export type AdminOptionGroupInput = ProductOptionGroupDto;

export type SelectedProductOptions = Record<string, string>;

export const OPTION_GROUP_PRESETS: Array<{
  groupKey: string;
  groupLabel: string;
  choices: ProductOptionChoiceDto[];
}> = [
  {
    groupKey: "color",
    groupLabel: "สี",
    choices: [
      { key: "white", label: "ขาว", priceDelta: 0 },
      { key: "cream", label: "ครีม", priceDelta: 0 },
      { key: "gray", label: "เทา", priceDelta: 0 },
    ],
  },
  {
    groupKey: "size",
    groupLabel: "ขนาด",
    choices: [
      { key: "240", label: "240 ซม.", priceDelta: 0 },
      { key: "280", label: "280 ซม.", priceDelta: 0 },
      { key: "300", label: "300 ซม.", priceDelta: 0 },
    ],
  },
  {
    groupKey: "material",
    groupLabel: "วัสดุ",
    choices: [
      { key: "polyester", label: "Polyester", priceDelta: 0 },
      { key: "linen", label: "ลินิน", priceDelta: 0 },
    ],
  },
  {
    groupKey: "style",
    groupLabel: "สไตล์",
    choices: [
      { key: "wave", label: "Wave", priceDelta: 0 },
      { key: "pleated", label: "จีบ", priceDelta: 0 },
    ],
  },
  {
    groupKey: "finish",
    groupLabel: "พื้นผิว",
    choices: [
      { key: "matte", label: "ด้าน", priceDelta: 0 },
      { key: "satin", label: "ซาติน", priceDelta: 0 },
    ],
  },
];

export function slugifyOptionKey(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
}

export function buildOptionSnapshot(
  groups: ProductOptionGroupDto[],
  selected: SelectedProductOptions,
) {
  const optionLabels: Record<string, string> = {};
  const groupLabels: Record<string, string> = {};
  let priceDelta = 0;

  for (const group of groups) {
    groupLabels[group.groupKey] = group.groupLabel;
    const choiceKey = selected[group.groupKey];
    if (!choiceKey) continue;
    const choice = group.choices.find((c) => c.key === choiceKey);
    if (choice) {
      optionLabels[group.groupKey] = choice.label;
      priceDelta += choice.priceDelta;
    }
  }

  return {
    options: selected,
    optionLabels,
    groupLabels,
    priceDelta,
  };
}

export function validateSelectedOptions(
  groups: ProductOptionGroupDto[],
  selected: SelectedProductOptions,
): string | null {
  for (const group of groups) {
    if (!group.required) continue;
    if (!selected[group.groupKey]) {
      return `กรุณาเลือก${group.groupLabel}`;
    }
  }
  return null;
}

export function optionsSnapshotKey(snapshot: { options?: SelectedProductOptions }) {
  const options = snapshot.options ?? {};
  return JSON.stringify(
    Object.keys(options)
      .sort()
      .map((k) => [k, options[k]]),
  );
}
