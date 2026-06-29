import type { AdminOptionGroupInput } from "@/domain/product-options";
import type {
  AdminFabricRow,
  ColorOption,
  FabricCollectionOption,
} from "@/services/admin-custom.service";

export type ConditionKey =
  | "product_type"
  | "fabric_id"
  | "fabric_collection_id"
  | "color_id"
  | "rail"
  | "installation";

export type ConditionRow = { id: string; key: ConditionKey; value: string };

export type ProductFormState = {
  name: string;
  slug: string;
  categoryId: string;
  isActive: boolean;
};

export type PreviewRuleFormState = {
  id?: string;
  name: string;
  priority: number;
  conditions: ConditionRow[];
  assetId: string;
  previewImageUrl: string;
  isActive: boolean;
};

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  product_type: "ประเภทม่าน",
  fabric_id: "ผ้า",
  fabric_collection_id: "คอลเลกชันผ้า",
  color_id: "สี",
  rail: "ราง",
  installation: "ติดตั้ง",
};

export const CONDITION_KEYS = Object.keys(CONDITION_LABELS) as ConditionKey[];

export const defaultConditions = (): ConditionRow[] => [
  { id: crypto.randomUUID(), key: "product_type", value: "" },
];

export const emptyPreviewRuleForm = (): PreviewRuleFormState => ({
  name: "",
  priority: 100,
  conditions: defaultConditions(),
  assetId: "",
  previewImageUrl: "",
  isActive: true,
});

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function conditionRowsToRecord(
  rows: ConditionRow[],
): Record<string, string> {
  return Object.fromEntries(
    rows
      .filter((row) => row.key && row.value)
      .map((row) => [row.key, row.value]),
  );
}

export function recordToConditionRows(
  record: Record<string, string>,
): ConditionRow[] {
  const rows = Object.entries(record)
    .filter(
      ([key, value]) => CONDITION_KEYS.includes(key as ConditionKey) && value,
    )
    .map(([key, value]) => ({
      id: crypto.randomUUID(),
      key: key as ConditionKey,
      value,
    }));
  return rows.length ? rows : defaultConditions();
}

export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function buildConditionOptions(
  key: ConditionKey,
  optionGroups: AdminOptionGroupInput[],
  fabrics: AdminFabricRow[],
  collections: FabricCollectionOption[],
  colors: ColorOption[],
) {
  const productTypeChoices =
    optionGroups.find((g) => g.groupKey === "product_type")?.choices ?? [];
  const railChoices =
    optionGroups.find((g) => g.groupKey === "rail")?.choices ?? [];
  const installationChoices =
    optionGroups.find((g) => g.groupKey === "installation")?.choices ?? [];

  switch (key) {
    case "product_type":
      return productTypeChoices.map((c) => ({
        value: c.key,
        label: c.label,
      }));
    case "fabric_id":
      return fabrics.map((f) => ({
        value: f.id,
        label: `${f.code} — ${f.name}`,
      }));
    case "fabric_collection_id":
      return collections.map((c) => ({ value: c.id, label: c.name }));
    case "color_id":
      return colors.map((c) => ({ value: c.id, label: c.name }));
    case "rail":
      return railChoices.map((c) => ({ value: c.key, label: c.label }));
    case "installation":
      return installationChoices.map((c) => ({
        value: c.key,
        label: c.label,
      }));
    default:
      return [];
  }
}
