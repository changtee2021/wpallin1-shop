export type ShippingAddressInput = {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
};

export function validateShippingAddress(
  input: ShippingAddressInput,
): string | null {
  if (!input.recipientName.trim()) return "กรุณากรอกชื่อผู้รับ";
  if (!input.phone.trim()) return "กรุณากรอกเบอร์โทร";
  if (!input.line1.trim()) return "กรุณากรอกที่อยู่";
  return null;
}

export function toAddressJson(input: ShippingAddressInput) {
  return {
    recipient_name: input.recipientName.trim(),
    phone: input.phone.trim(),
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    district: input.district?.trim() || null,
    province: input.province?.trim() || null,
    postal_code: input.postalCode?.trim() || null,
    country: "TH",
  };
}
