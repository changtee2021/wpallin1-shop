export type DealerProvince = { code: string; name: string };

/** Province part of a dealer code (WPD-<code>-0001). Staff can also type any 2–4 letter code. */
export const DEALER_PROVINCES: DealerProvince[] = [
  { code: "BKK", name: "กรุงเทพมหานคร" },
  { code: "NBI", name: "นนทบุรี" },
  { code: "PTE", name: "ปทุมธานี" },
  { code: "SPK", name: "สมุทรปราการ" },
  { code: "SKN", name: "สมุทรสาคร" },
  { code: "NPT", name: "นครปฐม" },
  { code: "AYA", name: "พระนครศรีอยุธยา" },
  { code: "CBI", name: "ชลบุรี" },
  { code: "RYG", name: "ระยอง" },
  { code: "CNX", name: "เชียงใหม่" },
  { code: "CEI", name: "เชียงราย" },
  { code: "PLK", name: "พิษณุโลก" },
  { code: "NSN", name: "นครสวรรค์" },
  { code: "NMA", name: "นครราชสีมา" },
  { code: "KKN", name: "ขอนแก่น" },
  { code: "UDN", name: "อุดรธานี" },
  { code: "UBN", name: "อุบลราชธานี" },
  { code: "HKT", name: "ภูเก็ต" },
  { code: "SNI", name: "สุราษฎร์ธานี" },
  { code: "SKA", name: "สงขลา" },
];

export const DEALER_PROVINCE_CODE_PATTERN = /^[A-Z]{2,4}$/;

export function normalizeProvinceCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function dealerProvinceName(code: string | null | undefined): string {
  if (!code) return "";
  return DEALER_PROVINCES.find((p) => p.code === code)?.name ?? code;
}

export const DEALER_CODE_PATTERN = /^WPD-[A-Z]{2,4}-\d{4,}$/;

export function normalizeDealerCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function looksLikeDealerCode(raw: string): boolean {
  return DEALER_CODE_PATTERN.test(normalizeDealerCode(raw));
}
