export type DealerApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export const DEALER_BUSINESS_TYPES = [
  { value: "curtain_shop", label: "ร้านผ้าม่าน / ตกแต่งภายใน" },
  { value: "contractor", label: "ผู้รับเหม / ช่างติดตั้ง" },
  { value: "architect", label: "สำนักงานออกแบบ / สถาปนิก" },
  { value: "wholesale", label: "ขายส่ง / ค้าปลีก" },
  { value: "online", label: "ขายออนไลน์" },
  { value: "other", label: "อื่น ๆ" },
] as const;

export function dealerApplicationStatusLabel(status: string): string {
  const map: Record<DealerApplicationStatus, string> = {
    pending: "รออนุมัติ",
    approved: "อนุมัติแล้ว",
    rejected: "ไม่ผ่าน",
    suspended: "ระงับ",
  };
  return map[status as DealerApplicationStatus] ?? status;
}

export function dealerBusinessTypeLabel(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  return DEALER_BUSINESS_TYPES.find((t) => t.value === value)?.label ?? value;
}
