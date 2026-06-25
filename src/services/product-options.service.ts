import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AdminOptionGroupInput,
  ProductOptionGroupDto,
} from "@/domain/product-options";

type OptionRow = {
  option_group: string;
  option_key: string;
  option_label: string;
  option_value: string | null;
  price_delta: number;
  is_required: boolean;
  sort_order: number;
  metadata: Record<string, unknown> | null;
};

function groupRows(rows: OptionRow[]): ProductOptionGroupDto[] {
  const map = new Map<string, ProductOptionGroupDto>();

  for (const row of rows) {
    const meta = row.metadata ?? {};
    const groupLabel =
      typeof meta.group_label === "string" && meta.group_label.trim()
        ? meta.group_label
        : row.option_group;

    let group = map.get(row.option_group);
    if (!group) {
      group = {
        groupKey: row.option_group,
        groupLabel,
        required: row.is_required,
        choices: [],
      };
      map.set(row.option_group, group);
    }

    group.required = group.required || row.is_required;
    group.choices.push({
      key: row.option_key,
      label: row.option_label,
      priceDelta: Number(row.price_delta),
      imageUrl:
        typeof meta.image_url === "string"
          ? meta.image_url
          : typeof meta.imageUrl === "string"
            ? meta.imageUrl
            : undefined,
    });
  }

  return [...map.values()];
}

export async function listProductOptionGroups(
  supabase: SupabaseClient,
  productId: string,
): Promise<ProductOptionGroupDto[]> {
  const { data, error } = await supabase
    .from("product_options")
    .select(
      "option_group, option_key, option_label, option_value, price_delta, is_required, sort_order, metadata",
    )
    .eq("product_id", productId)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return groupRows((data ?? []) as OptionRow[]);
}

export async function syncProductOptionGroups(
  supabase: SupabaseClient,
  productId: string,
  groups: AdminOptionGroupInput[],
): Promise<void> {
  const { error: delErr } = await supabase
    .from("product_options")
    .delete()
    .eq("product_id", productId);
  if (delErr) throw new Error(delErr.message);

  const rows: Array<Record<string, unknown>> = [];
  let sortOrder = 0;

  for (const group of groups) {
    const groupKey = group.groupKey.trim();
    if (!groupKey) continue;

    for (const choice of group.choices) {
      const key = choice.key.trim();
      const label = choice.label.trim();
      if (!key || !label) continue;

      const existingMeta =
        typeof group.groupLabel === "string"
          ? { group_label: group.groupLabel.trim() || groupKey }
          : { group_label: groupKey };
      const metadata: Record<string, unknown> = { ...existingMeta };
      if (choice.imageUrl?.trim()) {
        metadata.image_url = choice.imageUrl.trim();
      }

      rows.push({
        product_id: productId,
        option_group: groupKey,
        option_key: key,
        option_label: label,
        option_value: label,
        price_delta: choice.priceDelta ?? 0,
        is_required: group.required ?? false,
        sort_order: sortOrder++,
        metadata,
      });
    }
  }

  if (!rows.length) return;

  const { error } = await supabase.from("product_options").insert(rows);
  if (error) throw new Error(error.message);
}
