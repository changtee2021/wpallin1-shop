import type { SupabaseClient } from "@supabase/supabase-js";

import type { BankAccountDto } from "@/types/api/orders";

export type AdminSettingsDto = {
  bankAccounts: BankAccountDto[];
  shippingFee: number;
};

export type AdminDashboardDto = {
  todaySales: number;
  pendingSlipVerification: number;
  openQuotations: number;
  pendingDealerApps: number;
};

export async function getSettings(
  supabase: SupabaseClient,
): Promise<AdminSettingsDto> {
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["payment.bank_accounts", "shipping.default_fee"]);

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const bankAccounts = Array.isArray(map.get("payment.bank_accounts"))
    ? (map.get("payment.bank_accounts") as BankAccountDto[])
    : [];
  const feeVal = map.get("shipping.default_fee");
  const shippingFee = typeof feeVal === "number" ? feeVal : Number(feeVal ?? 0);

  return { bankAccounts, shippingFee };
}

export async function updateSettings(
  supabase: SupabaseClient,
  input: AdminSettingsDto,
): Promise<void> {
  await supabase
    .from("settings")
    .update({ value: input.bankAccounts, updated_at: new Date().toISOString() })
    .eq("key", "payment.bank_accounts");

  await supabase
    .from("settings")
    .update({
      value: input.shippingFee,
      updated_at: new Date().toISOString(),
    })
    .eq("key", "shipping.default_fee");
}

export async function getAdminDashboardStats(
  supabase: SupabaseClient,
): Promise<AdminDashboardDto> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [salesRes, pendingRes, quotesRes, dealerRes] = await Promise.all([
    supabase
      .from("orders")
      .select("grand_total")
      .gte("created_at", todayStart.toISOString())
      .in("payment_status", ["paid", "awaiting_verification"]),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "awaiting_payment_verification"),
    supabase
      .from("quotations")
      .select("id", { count: "exact", head: true })
      .in("status", ["draft", "sent"]),
    supabase
      .from("dealer_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  const todaySales = (salesRes.data ?? []).reduce(
    (s, o) => s + Number(o.grand_total),
    0,
  );

  return {
    todaySales,
    pendingSlipVerification: pendingRes.count ?? 0,
    openQuotations: quotesRes.count ?? 0,
    pendingDealerApps: dealerRes.count ?? 0,
  };
}
