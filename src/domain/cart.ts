export function validateCartQty(
  qty: number,
  moq: number,
  stock: number,
): string | null {
  if (qty < moq) return `สั่งขั้นต่ำ ${moq} ชิ้น`;
  if (stock > 0 && qty > stock) return `สต็อกเหลือ ${stock} ชิ้น`;
  if (qty <= 0) return "จำนวนไม่ถูกต้อง";
  return null;
}
