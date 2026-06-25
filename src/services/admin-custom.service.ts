import type { SupabaseClient } from "@supabase/supabase-js";

import type { AdminOptionGroupInput } from "@/domain/product-options";
import {
  listProductOptionGroups,
  syncProductOptionGroups,
} from "@/services/product-options.service";

export const CUSTOM_PRODUCT_SLUG = "custom-curtain";

export type AdminCustomLimits = {
  minWidthCm: number;
  maxWidthCm: number;
  minHeightCm: number;
  maxHeightCm: number;
};

export type AdminCustomProductInput = {
  name: string;
  slug: string;
  categoryId?: string | null;
  isActive?: boolean;
};

export type AdminCustomProjectRow = {
  id: string;
  name: string;
  slug: string;
  categoryId: string | null;
  categoryName: string | null;
  isActive: boolean;
  ruleCount: number;
  updatedAt: string;
};

export type AdminCustomSettings = {
  productId: string;
  productName: string;
  productSlug: string;
  categoryId: string | null;
  isActive: boolean;
  formulaId: string | null;
  limits: AdminCustomLimits;
  optionGroups: AdminOptionGroupInput[];
};

export type AdminFabricRow = {
  id: string;
  code: string;
  name: string;
  collectionId: string | null;
  collectionName: string | null;
  colorId: string | null;
  colorName: string | null;
  colorHex: string | null;
  pricePerMeter: number;
  rollWidthCm: number;
  swatchUrl: string | null;
  isActive: boolean;
};

export type AdminFabricInput = {
  id?: string;
  code: string;
  name: string;
  collectionId?: string | null;
  colorId?: string | null;
  pricePerMeter: number;
  rollWidthCm?: number;
  swatchUrl?: string | null;
  isActive?: boolean;
};

export type FabricCollectionOption = {
  id: string;
  name: string;
};

export type ColorOption = {
  id: string;
  name: string;
  hexValue: string | null;
};

export type ConfiguratorAssetType = "preview" | "swatch" | "base" | "overlay";

export type AdminConfiguratorAsset = {
  id: string;
  productId: string;
  assetType: ConfiguratorAssetType;
  name: string;
  publicUrl: string;
  storagePath: string | null;
  altText: string | null;
};

export type AdminConfiguratorAssetInput = {
  id?: string;
  productId: string;
  assetType: ConfiguratorAssetType;
  name: string;
  publicUrl: string;
  storagePath?: string | null;
  altText?: string | null;
};

export type AdminConfiguratorPreviewRule = {
  id: string;
  productId: string;
  name: string;
  priority: number;
  conditions: Record<string, string>;
  assetId: string | null;
  assetUrl: string | null;
  fallbackImageUrl: string | null;
  isActive: boolean;
};

export type AdminConfiguratorPreviewRuleInput = {
  id?: string;
  productId: string;
  name: string;
  priority: number;
  conditions: Record<string, string>;
  assetId?: string | null;
  fallbackImageUrl?: string | null;
  isActive?: boolean;
};

export type AdminConfiguratorBomRule = {
  id: string;
  productId: string;
  name: string;
  priority: number;
  conditions: Record<string, string>;
  outputs: Record<string, unknown>;
  isActive: boolean;
};

export type AdminConfiguratorBomRuleInput = {
  id?: string;
  productId: string;
  name: string;
  priority: number;
  conditions: Record<string, string>;
  outputs: Record<string, unknown>;
  isActive?: boolean;
};

async function getCustomProduct(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_id, is_active")
    .eq("slug", CUSTOM_PRODUCT_SLUG)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่พบสินค้า custom-curtain");
  return data;
}

async function getCustomProductById(
  supabase: SupabaseClient,
  productId: string,
) {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_id, is_active")
    .eq("id", productId)
    .eq("product_type", "custom")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("ไม่พบสินค้า Custom");
  return data;
}

export async function listAdminCustomProjects(
  supabase: SupabaseClient,
): Promise<AdminCustomProjectRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, category_id, is_active, updated_at")
    .eq("product_type", "custom")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  const categoryIds = [
    ...new Set((data ?? []).map((p) => p.category_id).filter(Boolean)),
  ];
  const productIds = (data ?? []).map((p) => p.id);

  const [{ data: categories }, { data: rules }] = await Promise.all([
    categoryIds.length
      ? supabase
          .from("product_categories")
          .select("id, name")
          .in("id", categoryIds as string[])
      : Promise.resolve({ data: [] }),
    productIds.length
      ? supabase
          .from("configurator_preview_rules")
          .select("product_id")
          .in("product_id", productIds)
      : Promise.resolve({ data: [] }),
  ]);

  const categoryMap = new Map((categories ?? []).map((c) => [c.id, c.name]));
  const ruleCounts = new Map<string, number>();
  for (const rule of rules ?? []) {
    ruleCounts.set(rule.product_id, (ruleCounts.get(rule.product_id) ?? 0) + 1);
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    categoryId: product.category_id,
    categoryName: product.category_id
      ? (categoryMap.get(product.category_id) ?? null)
      : null,
    isActive: product.is_active,
    ruleCount: ruleCounts.get(product.id) ?? 0,
    updatedAt: product.updated_at,
  }));
}

export async function createAdminCustomProject(
  supabase: SupabaseClient,
  input: AdminCustomProductInput,
): Promise<string> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: input.name.trim(),
      slug: input.slug.trim(),
      sku: input.slug.trim().toUpperCase(),
      category_id: input.categoryId || null,
      product_type: "custom",
      retail_price: 0,
      dealer_price: 0,
      stock_qty: 9999,
      min_order_qty: 1,
      is_active: input.isActive ?? true,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  try {
    const defaultProduct = await getCustomProduct(supabase);
    const [defaultOptions, formulaResult] = await Promise.all([
      listProductOptionGroups(supabase, defaultProduct.id),
      supabase
        .from("custom_price_formulas")
        .select("formula, variables")
        .eq("product_id", defaultProduct.id)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
    ]);

    if (defaultOptions.length) {
      await syncProductOptionGroups(supabase, data.id, defaultOptions);
    }
    if (!formulaResult.error && formulaResult.data) {
      await supabase.from("custom_price_formulas").insert({
        product_id: data.id,
        name: "Default",
        formula: formulaResult.data.formula ?? { type: "curtain_v1" },
        variables: formulaResult.data.variables ?? {},
        is_active: true,
      });
    }
  } catch {
    // New custom projects still work without copied defaults; admins can add options later.
  }

  return data.id;
}

export async function saveAdminCustomProduct(
  supabase: SupabaseClient,
  productId: string,
  input: AdminCustomProductInput,
): Promise<void> {
  const { error } = await supabase
    .from("products")
    .update({
      name: input.name.trim(),
      slug: input.slug.trim(),
      category_id: input.categoryId || null,
      is_active: input.isActive ?? true,
      product_type: "custom",
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
  if (error) throw new Error(error.message);
}

export async function getAdminCustomSettings(
  supabase: SupabaseClient,
  productId?: string,
): Promise<AdminCustomSettings> {
  const product = productId
    ? await getCustomProductById(supabase, productId)
    : await getCustomProduct(supabase);
  const [optionGroups, formulaResult] = await Promise.all([
    listProductOptionGroups(supabase, product.id),
    supabase
      .from("custom_price_formulas")
      .select("id, variables")
      .eq("product_id", product.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (formulaResult.error) throw new Error(formulaResult.error.message);

  const vars = (formulaResult.data?.variables ?? {}) as Record<string, number>;

  return {
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    categoryId: product.category_id,
    isActive: product.is_active,
    formulaId: formulaResult.data?.id ?? null,
    limits: {
      minWidthCm: vars.min_width_cm ?? 50,
      maxWidthCm: vars.max_width_cm ?? 600,
      minHeightCm: vars.min_height_cm ?? 50,
      maxHeightCm: vars.max_height_cm ?? 350,
    },
    optionGroups,
  };
}

export async function saveAdminCustomOptions(
  supabase: SupabaseClient,
  productId: string,
  optionGroups: AdminOptionGroupInput[],
): Promise<void> {
  await syncProductOptionGroups(supabase, productId, optionGroups);
}

export async function saveAdminCustomLimits(
  supabase: SupabaseClient,
  productId: string,
  formulaId: string | null,
  limits: AdminCustomLimits,
): Promise<void> {
  const variables = {
    min_width_cm: limits.minWidthCm,
    max_width_cm: limits.maxWidthCm,
    min_height_cm: limits.minHeightCm,
    max_height_cm: limits.maxHeightCm,
  };

  if (formulaId) {
    const { error } = await supabase
      .from("custom_price_formulas")
      .update({
        variables,
        updated_at: new Date().toISOString(),
      })
      .eq("id", formulaId);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.from("custom_price_formulas").insert({
    product_id: productId,
    name: "Curtain default",
    formula: { type: "curtain_v1" },
    variables,
    is_active: true,
  });
  if (error) throw new Error(error.message);
}

export async function listAdminFabrics(
  supabase: SupabaseClient,
): Promise<AdminFabricRow[]> {
  const { data: fabrics, error } = await supabase
    .from("fabrics")
    .select(
      "id, code, name, collection_id, color_id, price_per_meter, roll_width_cm, swatch_url, is_active",
    )
    .order("name");
  if (error) throw new Error(error.message);

  const collectionIds = [
    ...new Set((fabrics ?? []).map((f) => f.collection_id).filter(Boolean)),
  ];
  const colorIds = [
    ...new Set((fabrics ?? []).map((f) => f.color_id).filter(Boolean)),
  ];

  const [{ data: collections }, { data: colors }] = await Promise.all([
    collectionIds.length
      ? supabase
          .from("fabric_collections")
          .select("id, name")
          .in("id", collectionIds as string[])
      : Promise.resolve({ data: [] }),
    colorIds.length
      ? supabase
          .from("colors")
          .select("id, name, hex_value")
          .in("id", colorIds as string[])
      : Promise.resolve({ data: [] }),
  ]);

  const collMap = new Map((collections ?? []).map((c) => [c.id, c.name]));
  const colorMap = new Map(
    (colors ?? []).map((c) => [
      c.id,
      { name: c.name, hex: c.hex_value as string | null },
    ]),
  );

  return (fabrics ?? []).map((f) => {
    const color = f.color_id ? colorMap.get(f.color_id) : null;
    return {
      id: f.id,
      code: f.code,
      name: f.name,
      collectionId: f.collection_id,
      collectionName: f.collection_id
        ? (collMap.get(f.collection_id) ?? null)
        : null,
      colorId: f.color_id,
      colorName: color?.name ?? null,
      colorHex: color?.hex ?? null,
      pricePerMeter: Number(f.price_per_meter),
      rollWidthCm: Number(f.roll_width_cm),
      swatchUrl: f.swatch_url,
      isActive: f.is_active,
    };
  });
}

export async function listFabricCollections(
  supabase: SupabaseClient,
): Promise<FabricCollectionOption[]> {
  const { data, error } = await supabase
    .from("fabric_collections")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({ id: c.id, name: c.name }));
}

export async function listColorOptions(
  supabase: SupabaseClient,
): Promise<ColorOption[]> {
  const { data, error } = await supabase
    .from("colors")
    .select("id, name, hex_value")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    hexValue: c.hex_value,
  }));
}

export async function saveAdminFabric(
  supabase: SupabaseClient,
  input: AdminFabricInput,
): Promise<string> {
  const row = {
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    collection_id: input.collectionId || null,
    color_id: input.colorId || null,
    price_per_meter: input.pricePerMeter,
    roll_width_cm: input.rollWidthCm ?? 280,
    swatch_url: input.swatchUrl?.trim() || null,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("fabrics")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase
    .from("fabrics")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function toggleAdminFabricActive(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("fabrics")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

const normalizeConditions = (conditions: Record<string, string>) =>
  Object.fromEntries(
    Object.entries(conditions)
      .map(([key, value]) => [key.trim(), value.trim()])
      .filter(([key, value]) => key && value),
  );

function parseRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => typeof v === "string" && v.trim())
      .map(([k, v]) => [k, String(v)]),
  );
}

export async function listAdminConfiguratorAssets(
  supabase: SupabaseClient,
  productId: string,
): Promise<AdminConfiguratorAsset[]> {
  const { data, error } = await supabase
    .from("configurator_assets")
    .select(
      "id, product_id, asset_type, name, public_url, storage_path, alt_text",
    )
    .eq("product_id", productId)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    assetType: (row.asset_type ?? "preview") as ConfiguratorAssetType,
    name: row.name,
    publicUrl: row.public_url,
    storagePath: row.storage_path,
    altText: row.alt_text,
  }));
}

export async function saveAdminConfiguratorAsset(
  supabase: SupabaseClient,
  input: AdminConfiguratorAssetInput,
): Promise<string> {
  const row = {
    product_id: input.productId,
    asset_type: input.assetType,
    name: input.name.trim(),
    public_url: input.publicUrl.trim(),
    storage_path: input.storagePath || null,
    alt_text: input.altText?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("configurator_assets")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase
    .from("configurator_assets")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function listAdminConfiguratorPreviewRules(
  supabase: SupabaseClient,
  productId: string,
): Promise<AdminConfiguratorPreviewRule[]> {
  const { data, error } = await supabase
    .from("configurator_preview_rules")
    .select(
      "id, product_id, name, priority, conditions, asset_id, fallback_image_url, is_active",
    )
    .eq("product_id", productId)
    .order("priority");
  if (error) throw new Error(error.message);

  const assetIds = [
    ...new Set((data ?? []).map((r) => r.asset_id).filter(Boolean)),
  ];
  const { data: assets } = assetIds.length
    ? await supabase
        .from("configurator_assets")
        .select("id, public_url")
        .in("id", assetIds as string[])
    : { data: [] };
  const assetMap = new Map((assets ?? []).map((a) => [a.id, a.public_url]));

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    name: row.name,
    priority: Number(row.priority),
    conditions: parseRecord(row.conditions),
    assetId: row.asset_id,
    assetUrl: row.asset_id ? (assetMap.get(row.asset_id) ?? null) : null,
    fallbackImageUrl: row.fallback_image_url,
    isActive: row.is_active,
  }));
}

export async function saveAdminConfiguratorPreviewRule(
  supabase: SupabaseClient,
  input: AdminConfiguratorPreviewRuleInput,
): Promise<string> {
  const row = {
    product_id: input.productId,
    name: input.name.trim(),
    priority: input.priority,
    conditions: normalizeConditions(input.conditions),
    asset_id: input.assetId || null,
    fallback_image_url: input.fallbackImageUrl?.trim() || null,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (!row.asset_id && !row.fallback_image_url) {
    throw new Error("กรุณาเลือก asset หรือใส่ URL รูป");
  }

  if (input.id) {
    const { error } = await supabase
      .from("configurator_preview_rules")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase
    .from("configurator_preview_rules")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function toggleAdminConfiguratorPreviewRule(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("configurator_preview_rules")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listAdminConfiguratorBomRules(
  supabase: SupabaseClient,
  productId: string,
): Promise<AdminConfiguratorBomRule[]> {
  const { data, error } = await supabase
    .from("configurator_bom_rules")
    .select("id, product_id, name, priority, conditions, outputs, is_active")
    .eq("product_id", productId)
    .order("priority");
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    productId: row.product_id,
    name: row.name,
    priority: Number(row.priority),
    conditions: parseRecord(row.conditions),
    outputs:
      row.outputs &&
      typeof row.outputs === "object" &&
      !Array.isArray(row.outputs)
        ? (row.outputs as Record<string, unknown>)
        : { items: [] },
    isActive: row.is_active,
  }));
}

export async function saveAdminConfiguratorBomRule(
  supabase: SupabaseClient,
  input: AdminConfiguratorBomRuleInput,
): Promise<string> {
  const row = {
    product_id: input.productId,
    name: input.name.trim(),
    priority: input.priority,
    conditions: normalizeConditions(input.conditions),
    outputs: input.outputs,
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { error } = await supabase
      .from("configurator_bom_rules")
      .update(row)
      .eq("id", input.id);
    if (error) throw new Error(error.message);
    return input.id;
  }

  const { data, error } = await supabase
    .from("configurator_bom_rules")
    .insert(row)
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function toggleAdminConfiguratorBomRule(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean,
): Promise<void> {
  const { error } = await supabase
    .from("configurator_bom_rules")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}
