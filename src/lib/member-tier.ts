export function tierLabel(tier: string | null): string {
  const map: Record<string, string> = {
    retail: "สมาชิกทั่วไป",
    silver_dealer: "ตัวแทน Silver",
    gold_dealer: "ตัวแทน Gold",
    platinum_dealer: "ตัวแทน Platinum",
  };
  return tier ? (map[tier] ?? tier) : "—";
}

export type MemberTierKey =
  | "retail"
  | "silver_dealer"
  | "gold_dealer"
  | "platinum_dealer";

export function isDealerMemberTier(tier: string | null): boolean {
  return (
    tier === "silver_dealer" ||
    tier === "gold_dealer" ||
    tier === "platinum_dealer"
  );
}

export function showDealerHub(tier: string | null, roles: string[]): boolean {
  return isDealerMemberTier(tier) || roles.includes("dealer");
}

export function showCreditPanel(hasCreditAccount: boolean): boolean {
  return hasCreditAccount;
}

export function showDocumentsTab(): boolean {
  return true;
}

export function customerTypeLabel(type: "individual" | "juristic"): string {
  return type === "juristic" ? "นิติบุคคล" : "บุคคลธรรมดา";
}
