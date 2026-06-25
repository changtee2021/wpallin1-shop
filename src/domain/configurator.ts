import { getConfiguratorFallbackImage } from "@/lib/configurator-product-showcase";

export type ConfiguratorProductType = "pleated" | "eyelet" | "wave";

export type ConfiguratorDraft = {
  productType: ConfiguratorProductType | null;
  fabricId: string | null;
  widthCm: number;
  heightCm: number;
  railOptionKey: string | null;
  installationOptionKey: string | null;
};

export type ConfiguratorCatalog = {
  productTypes: Array<{
    key: string;
    label: string;
    priceDelta: number;
    imageUrl: string | null;
    description: string | null;
    startingPrice: number | null;
    showcaseSlug: string | null;
  }>;
  fabrics: Array<{
    id: string;
    code: string;
    name: string;
    collectionId: string | null;
    collectionName: string | null;
    colorId: string | null;
    colorHex: string | null;
    swatchUrl: string | null;
    pricePerMeter: number;
  }>;
  railOptions: Array<{
    key: string;
    label: string;
    priceDelta: number;
    imageUrl: string | null;
  }>;
  installationOptions: Array<{
    key: string;
    label: string;
    priceDelta: number;
    imageUrl: string | null;
  }>;
  previewRules: Array<{
    id: string;
    priority: number;
    conditions: Record<string, string>;
    imageUrl: string;
  }>;
  customProductId: string;
  limits: {
    minWidthCm: number;
    maxWidthCm: number;
    minHeightCm: number;
    maxHeightCm: number;
  };
};

export type ConfiguratorPriceBreakdown = {
  fabricCost: number;
  optionsCost: number;
  installationCost: number;
  subtotal: number;
  total: number;
};

export const CONFIGURATOR_STEPS = [
  "product_type",
  "fabric",
  "dimensions",
  "rails",
  "installation",
  "summary",
] as const;

export type ConfiguratorStep = (typeof CONFIGURATOR_STEPS)[number];

export type ConfiguratorPreviewState = {
  imageUrl: string | null;
  fabricSwatchUrl: string | null;
  fabricColorHex: string | null;
  fabricName: string | null;
  productTypeLabel: string | null;
  railLabel: string | null;
  installationLabel: string | null;
  widthCm: number;
  heightCm: number;
};

function getDraftConditionValue(
  key: string,
  draft: ConfiguratorDraft,
  fabric: ConfiguratorCatalog["fabrics"][number] | undefined,
): string | null {
  switch (key) {
    case "product_type":
      return draft.productType;
    case "fabric_id":
      return draft.fabricId;
    case "fabric_collection_id":
      return fabric?.collectionId ?? null;
    case "color_id":
      return fabric?.colorId ?? null;
    case "rail":
      return draft.railOptionKey;
    case "installation":
      return draft.installationOptionKey;
    default:
      return null;
  }
}

function resolvePreviewRuleImage(
  draft: ConfiguratorDraft,
  catalog: ConfiguratorCatalog,
  fabric: ConfiguratorCatalog["fabrics"][number] | undefined,
): string | null {
  let best: { imageUrl: string; score: number; priority: number } | null = null;

  for (const rule of catalog.previewRules) {
    const entries = Object.entries(rule.conditions);
    if (entries.length === 0) continue;
    const matches = entries.every(([key, expected]) => {
      const actual = getDraftConditionValue(key, draft, fabric);
      return actual === expected;
    });
    if (!matches) continue;

    const score = entries.length;
    if (
      !best ||
      score > best.score ||
      (score === best.score && rule.priority < best.priority)
    ) {
      best = { imageUrl: rule.imageUrl, score, priority: rule.priority };
    }
  }

  return best?.imageUrl ?? null;
}

export function resolveConfiguratorPreview(
  draft: ConfiguratorDraft,
  catalog: ConfiguratorCatalog,
): ConfiguratorPreviewState {
  const productType = catalog.productTypes.find(
    (o) => o.key === draft.productType,
  );
  const fabric = catalog.fabrics.find((f) => f.id === draft.fabricId);
  const rail = catalog.railOptions.find((o) => o.key === draft.railOptionKey);
  const installation = catalog.installationOptions.find(
    (o) => o.key === draft.installationOptionKey,
  );

  let imageUrl = resolvePreviewRuleImage(draft, catalog, fabric);
  if (!imageUrl && rail?.imageUrl) {
    imageUrl = rail.imageUrl;
  } else if (!imageUrl && productType?.imageUrl) {
    imageUrl = productType.imageUrl;
  } else if (!imageUrl && draft.productType) {
    imageUrl = getConfiguratorFallbackImage(draft.productType);
  }

  return {
    imageUrl,
    fabricSwatchUrl: fabric?.swatchUrl ?? null,
    fabricColorHex: fabric?.colorHex ?? null,
    fabricName: fabric?.name ?? null,
    productTypeLabel: productType?.label ?? null,
    railLabel: rail?.label ?? null,
    installationLabel: installation?.label ?? null,
    widthCm: draft.widthCm,
    heightCm: draft.heightCm,
  };
}

export function validateDimensions(
  draft: ConfiguratorDraft,
  limits: ConfiguratorCatalog["limits"],
): string | null {
  if (draft.widthCm < limits.minWidthCm || draft.widthCm > limits.maxWidthCm) {
    return `ความกว้าง ${limits.minWidthCm}-${limits.maxWidthCm} ซม.`;
  }
  if (
    draft.heightCm < limits.minHeightCm ||
    draft.heightCm > limits.maxHeightCm
  ) {
    return `ความสูง ${limits.minHeightCm}-${limits.maxHeightCm} ซม.`;
  }
  return null;
}

export function canProceedStep(
  step: ConfiguratorStep,
  draft: ConfiguratorDraft,
): boolean {
  switch (step) {
    case "product_type":
      return !!draft.productType;
    case "fabric":
      return !!draft.fabricId;
    case "dimensions":
      return draft.widthCm > 0 && draft.heightCm > 0;
    case "rails":
      return !!draft.railOptionKey;
    case "installation":
      return !!draft.installationOptionKey;
    case "summary":
      return true;
    default:
      return false;
  }
}
