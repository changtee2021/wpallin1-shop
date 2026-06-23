export function calcLineTotal(qty: number, unitPrice: number): number {
  return Math.round(qty * unitPrice * 100) / 100;
}

export function calcCartSubtotal(
  items: Array<{ qty: number; unitPrice: number }>,
): number {
  return items.reduce(
    (sum, item) => sum + calcLineTotal(item.qty, item.unitPrice),
    0,
  );
}

export function calcOrderTotals(
  subtotal: number,
  shippingFee = 0,
  discount = 0,
) {
  const safeSubtotal = Math.max(0, subtotal);
  const safeDiscount = Math.min(Math.max(0, discount), safeSubtotal);
  const safeShipping = Math.max(0, shippingFee);
  const grandTotal = Math.max(0, safeSubtotal - safeDiscount + safeShipping);
  return {
    subtotal: safeSubtotal,
    discount: safeDiscount,
    shippingFee: safeShipping,
    taxAmount: 0,
    grandTotal,
  };
}

const FULLNESS: Record<string, number> = {
  pleated: 2,
  eyelet: 2.2,
  wave: 2.5,
};

export function calcCustomCurtainPrice(input: {
  productType: string;
  widthCm: number;
  heightCm: number;
  pricePerMeter: number;
  typePriceDelta?: number;
  railPriceDelta?: number;
  installationPriceDelta?: number;
}): import("@/domain/configurator").ConfiguratorPriceBreakdown {
  const fullness = FULLNESS[input.productType] ?? 2;
  const widthM = input.widthCm / 100;
  const heightM = input.heightCm / 100;
  const fabricMeters = widthM * fullness;
  const fabricCost = Math.round(fabricMeters * input.pricePerMeter * 100) / 100;
  const typeCost = input.typePriceDelta ?? 0;
  const railCost = input.railPriceDelta ?? 0;
  const installationCost = input.installationPriceDelta ?? 0;
  const optionsCost = typeCost + railCost;
  let subtotal = fabricCost + optionsCost + installationCost;
  if (subtotal < 1500) subtotal = 1500;
  return {
    fabricCost,
    optionsCost,
    installationCost,
    subtotal,
    total: subtotal,
  };
}
