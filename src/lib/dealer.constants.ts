export type DealerApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export const DEALER_BUSINESS_TYPES = [
  { value: "retail", label: "ร้านค้าปลีก", labelEn: "Retail" },
  { value: "curtain_shop", label: "ร้านผ้าม่าน / ตกแต่งภายใน", labelEn: "Curtain shop" },
  { value: "wholesale", label: "ขายส่ง / ค้าปลีก", labelEn: "Wholesale" },
  { value: "project", label: "งานโครงการ", labelEn: "Project" },
  { value: "hybrid", label: "ไฮบริด (ปลีก + ส่ง)", labelEn: "Hybrid" },
  { value: "service", label: "งานบริการ / ติดตั้ง", labelEn: "Service" },
  { value: "contractor", label: "ผู้รับเหม / EPC / Turnkey", labelEn: "EPC / Turnkey contractor" },
  { value: "interior_designer", label: "นักออกแบบภายใน", labelEn: "Interior designer" },
  { value: "architect", label: "สำนักงานออกแบบ / สถาปนิก", labelEn: "Architecture" },
  { value: "online", label: "ร้านออนไลน์", labelEn: "Online store" },
  { value: "modern_trade", label: "โมเดิร์นเทรด", labelEn: "Modern trade" },
  { value: "seamstress", label: "ช่างเย็บม่าน", labelEn: "Curtain seamstress" },
  { value: "freelance_technician", label: "ช่างอิสระ", labelEn: "Freelance technician" },
  { value: "other", label: "อื่น ๆ", labelEn: "Other" },
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
  locale: "th" | "en" = "th",
): string {
  if (!value) return "—";
  const row = DEALER_BUSINESS_TYPES.find((t) => t.value === value);
  if (!row) return value;
  return locale === "en" ? row.labelEn : row.label;
}
