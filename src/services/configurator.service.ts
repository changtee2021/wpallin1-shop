import type { SupabaseClient } from "@supabase/supabase-js";

import {
  type ConfiguratorCatalog,
  type ConfiguratorDraft,
  type ConfiguratorPriceBreakdown,
  validateDimensions,
} from "@/domain/configurator";
import { calcCustomCurtainPrice } from "@/domain/pricing";

const CUSTOM_PRODUCT_SLUG = "custom-curtain";

export async function listConfiguratorCatalog(
  supabase: SupabaseClient,
): Promise<ConfiguratorCatalog> {
  const { data: product } = await supabase
    .from("products")
    .select("id")
    .eq("slug", CUSTOM_PRODUCT_SLUG)
    .eq("is_active", true)
    .maybeSingle();

  if (!product) throw new Error("ไม่พบสินค้าสั่งทำ");

  const { data: options } = await supabase
    .from("product_options")
    .select("option_group, option_key, option_label, price_delta, sort_order")
    .eq("product_id", product.id)
    .order("sort_order");

  const { data: fabrics } = await supabase
    .from("fabrics")
    .select("id, code, name, price_per_meter, collection_id, color_id")
    .eq("is_active", true)
    .order("name");

  const collectionIds = [
    ...new Set((fabrics ?? []).map((f) => f.collection_id).filter(Boolean)),
  ];
  const colorIds = [
    ...new Set((fabrics ?? []).map((f) => f.color_id).filter(Boolean)),
  ];

  const { data: collections } = collectionIds.length
    ? await supabase
        .from("fabric_collections")
        .select("id, name")
        .in("id", collectionIds as string[])
    : { data: [] };

  const { data: colors } = colorIds.length
    ? await supabase
        .from("colors")
        .select("id, hex_value")
        .in("id", colorIds as string[])
    : { data: [] };

  const collMap = new Map((collections ?? []).map((c) => [c.id, c.name]));
  const colorMap = new Map((colors ?? []).map((c) => [c.id, c.hex_value]));

  const { data: formula } = await supabase
    .from("custom_price_formulas")
    .select("variables")
    .eq("product_id", product.id)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  const vars = (formula?.variables ?? {}) as Record<string, number>;
  const mapOpts = (group: string) =>
    (options ?? [])
      .filter((o) => o.option_group === group)
      .map((o) => ({
        key: o.option_key,
        label: o.option_label,
        priceDelta: Number(o.price_delta),
      }));

  return {
    customProductId: product.id,
    productTypes: mapOpts("product_type"),
    railOptions: mapOpts("rail"),
    installationOptions: mapOpts("installation"),
    fabrics: (fabrics ?? []).map((f) => ({
      id: f.id,
      code: f.code,
      name: f.name,
      collectionName: f.collection_id
        ? (collMap.get(f.collection_id) ?? null)
        : null,
      colorHex: f.color_id ? (colorMap.get(f.color_id) ?? null) : null,
      pricePerMeter: Number(f.price_per_meter),
    })),
    limits: {
      minWidthCm: vars.min_width_cm ?? 50,
      maxWidthCm: vars.max_width_cm ?? 600,
      minHeightCm: vars.min_height_cm ?? 50,
      maxHeightCm: vars.max_height_cm ?? 350,
    },
  };
}

export async function calculateConfiguratorPrice(
  supabase: SupabaseClient,
  draft: ConfiguratorDraft,
): Promise<ConfiguratorPriceBreakdown> {
  const catalog = await listConfiguratorCatalog(supabase);
  const dimErr = validateDimensions(draft, catalog.limits);
  if (dimErr) throw new Error(dimErr);
  if (!draft.productType || !draft.fabricId) {
    throw new Error("กรุณาเลือกประเภทและผ้า");
  }

  const fabric = catalog.fabrics.find((f) => f.id === draft.fabricId);
  if (!fabric) throw new Error("ไม่พบผ้า");

  const typeOpt = catalog.productTypes.find((o) => o.key === draft.productType);
  const railOpt = catalog.railOptions.find(
    (o) => o.key === draft.railOptionKey,
  );
  const installOpt = catalog.installationOptions.find(
    (o) => o.key === draft.installationOptionKey,
  );

  return calcCustomCurtainPrice({
    productType: draft.productType,
    widthCm: draft.widthCm,
    heightCm: draft.heightCm,
    pricePerMeter: fabric.pricePerMeter,
    typePriceDelta: typeOpt?.priceDelta,
    railPriceDelta: railOpt?.priceDelta,
    installationPriceDelta: installOpt?.priceDelta,
  });
}

export async function saveConfiguration(
  supabase: SupabaseClient,
  userId: string | null,
  draft: ConfiguratorDraft,
): Promise<{ configurationId: string; price: number }> {
  const catalog = await listConfiguratorCatalog(supabase);
  const price = await calculateConfiguratorPrice(supabase, draft);

  const { data, error } = await supabase
    .from("custom_configurations")
    .insert({
      user_id: userId,
      product_id: catalog.customProductId,
      config_json: draft,
      computed_price: price.total,
      status: "saved",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { configurationId: data.id, price: price.total };
}

export async function addConfigurationToCart(
  supabase: SupabaseClient,
  ctx: { userId?: string | null; sessionId?: string | null },
  configurationId: string,
): Promise<import("@/types/api/cart").CartDto> {
  const { getCart, resolveCartForContext } =
    await import("@/services/cart.service");

  const { data: config } = await supabase
    .from("custom_configurations")
    .select("id, product_id, config_json, computed_price")
    .eq("id", configurationId)
    .maybeSingle();

  if (!config) throw new Error("ไม่พบการกำหนดค่า");

  const cart = await resolveCartForContext(supabase, ctx);
  const draft = config.config_json as ConfiguratorDraft;
  const unitPrice = Number(config.computed_price);
  const fabric = await supabase
    .from("fabrics")
    .select("name")
    .eq("id", draft.fabricId ?? "")
    .maybeSingle();

  const productName = `ผ้าม่านสั่งทำ — ${fabric.data?.name ?? draft.productType}`;

  const { error } = await supabase.from("cart_items").insert({
    cart_id: cart.id,
    product_id: config.product_id,
    configuration_id: configurationId,
    product_name: productName,
    sku: "CUSTOM",
    qty: 1,
    unit_price: unitPrice,
    line_total: unitPrice,
    config_snapshot: draft,
  });
  if (error) throw new Error(error.message);

  const { recalcCartTotals } = await import("@/services/cart.service");
  await recalcCartTotals(supabase, cart.id);
  return getCart(supabase, ctx);
}
