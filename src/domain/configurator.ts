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
  productTypes: Array<{ key: string; label: string; priceDelta: number }>;
  fabrics: Array<{
    id: string;
    code: string;
    name: string;
    collectionName: string | null;
    colorHex: string | null;
    pricePerMeter: number;
  }>;
  railOptions: Array<{ key: string; label: string; priceDelta: number }>;
  installationOptions: Array<{
    key: string;
    label: string;
    priceDelta: number;
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
