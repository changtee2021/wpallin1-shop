export function validateCartQty(
  qty: number,
  moq: number,
  stock: number,
  orderStep = 1,
): string | null {
  if (qty <= 0) return "จำนวนไม่ถูกต้อง";
  if (qty < moq) return `สั่งขั้นต่ำ ${moq} ชิ้น`;
  if (orderStep > 1 && qty % orderStep !== 0) {
    return `สั่งได้ทีละ ${orderStep} ชิ้น`;
  }
  if (stock > 0 && qty > stock) return `สต็อกเหลือ ${stock} ชิ้น`;
  return null;
}
