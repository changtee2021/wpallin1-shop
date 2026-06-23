export function tierLabel(tier: string | null): string {
  const map: Record<string, string> = {
    retail: "สมาชิกทั่วไป",
    silver_dealer: "ตัวแทน Silver",
    gold_dealer: "ตัวแทน Gold",
    platinum_dealer: "ตัวแทน Platinum",
  };
  return tier ? (map[tier] ?? tier) : "—";
}
