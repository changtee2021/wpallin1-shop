import type { SupabaseClient } from "@supabase/supabase-js";

export type AffiliateAccountDto = {
  id: string;
  referralCode: string;
  status: string;
  commissionRate: number;
  totalClicks: number;
  totalConversions: number;
  totalCommission: number;
  payoutBalance: number;
  createdAt: string;
};

export type AffiliateLinkDto = {
  id: string;
  slug: string;
  label: string | null;
  targetUrl: string;
  clickCount: number;
  isActive: boolean;
};

export type AffiliateConversionDto = {
  id: string;
  orderId: string | null;
  commissionAmount: number;
  status: string;
  createdAt: string;
};

export type AffiliatePayoutDto = {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
};

export type AffiliateDashboardDto = {
  account: AffiliateAccountDto | null;
  referralUrl: string | null;
  links: AffiliateLinkDto[];
  conversions: AffiliateConversionDto[];
  payouts: AffiliatePayoutDto[];
};

function mapAccount(row: Record<string, unknown>): AffiliateAccountDto {
  return {
    id: String(row.id),
    referralCode: String(row.referral_code),
    status: String(row.status),
    commissionRate: Number(row.commission_rate),
    totalClicks: Number(row.total_clicks),
    totalConversions: Number(row.total_conversions),
    totalCommission: Number(row.total_commission),
    payoutBalance: Number(row.payout_balance),
    createdAt: String(row.created_at),
  };
}

async function ensureReferralCode(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("affiliate_code, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.affiliate_code) {
    return String(profile.affiliate_code).toUpperCase();
  }

  const base =
    profile?.display_name?.replace(/\W/g, "").slice(0, 6).toUpperCase() ||
    userId.slice(0, 6).toUpperCase();
  const code = `${base}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  await supabase
    .from("profiles")
    .update({ affiliate_code: code })
    .eq("id", userId);

  return code;
}

export async function getAffiliateDashboard(
  supabase: SupabaseClient,
  userId: string,
  publicBaseUrl: string,
): Promise<AffiliateDashboardDto> {
  const { data: accountRow } = await supabase
    .from("affiliate_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!accountRow) {
    return {
      account: null,
      referralUrl: null,
      links: [],
      conversions: [],
      payouts: [],
    };
  }

  const account = mapAccount(accountRow);
  const referralUrl = `${publicBaseUrl.replace(/\/$/, "")}/?ref=${account.referralCode}`;

  const [linksRes, conversionsRes, payoutsRes] = await Promise.all([
    supabase
      .from("affiliate_links")
      .select("id, slug, label, target_url, click_count, is_active")
      .eq("affiliate_account_id", account.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("affiliate_conversions")
      .select("id, order_id, commission_amount, status, created_at")
      .eq("affiliate_account_id", account.id)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("payout_requests")
      .select("id, amount, status, created_at")
      .eq("affiliate_account_id", account.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return {
    account,
    referralUrl,
    links: (linksRes.data ?? []).map((row) => ({
      id: String(row.id),
      slug: String(row.slug),
      label: row.label ? String(row.label) : null,
      targetUrl: String(row.target_url),
      clickCount: Number(row.click_count),
      isActive: Boolean(row.is_active),
    })),
    conversions: (conversionsRes.data ?? []).map((row) => ({
      id: String(row.id),
      orderId: row.order_id ? String(row.order_id) : null,
      commissionAmount: Number(row.commission_amount),
      status: String(row.status),
      createdAt: String(row.created_at),
    })),
    payouts: (payoutsRes.data ?? []).map((row) => ({
      id: String(row.id),
      amount: Number(row.amount),
      status: String(row.status),
      createdAt: String(row.created_at),
    })),
  };
}

export async function registerAffiliateAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<AffiliateAccountDto> {
  const existing = await supabase
    .from("affiliate_accounts")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing.data) return mapAccount(existing.data);

  const referralCode = await ensureReferralCode(supabase, userId);
  const { data, error } = await supabase
    .from("affiliate_accounts")
    .insert({
      user_id: userId,
      referral_code: referralCode,
      status: "approved",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return mapAccount(data);
}

export async function createAffiliateLink(
  supabase: SupabaseClient,
  userId: string,
  input: { slug: string; targetUrl: string; label?: string },
): Promise<void> {
  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) throw new Error("ยังไม่ได้สมัคร Affiliate");

  const { error } = await supabase.from("affiliate_links").insert({
    affiliate_account_id: account.id,
    slug: input.slug.trim().toLowerCase(),
    target_url: input.targetUrl.trim(),
    label: input.label?.trim() ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function requestAffiliatePayout(
  supabase: SupabaseClient,
  userId: string,
  input: { amount: number; bank: string; accountNo: string; accountName: string },
): Promise<void> {
  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id, payout_balance")
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) throw new Error("ไม่พบบัญชี Affiliate");
  if (input.amount <= 0) throw new Error("จำนวนเงินไม่ถูกต้อง");
  if (input.amount > Number(account.payout_balance)) {
    throw new Error("ยอดถอนเกินกระเป๋า");
  }

  const { error } = await supabase.from("payout_requests").insert({
    affiliate_account_id: account.id,
    amount: input.amount,
    bank_info: {
      bank: input.bank,
      account_no: input.accountNo,
      account_name: input.accountName,
    },
  });

  if (error) throw new Error(error.message);
}

export async function recordAffiliateConversion(
  supabase: SupabaseClient,
  affiliateCode: string,
  orderId: string,
  orderTotal: number,
): Promise<void> {
  const code = affiliateCode.trim().toUpperCase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("affiliate_code", code)
    .maybeSingle();

  if (!profile) return;

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id")
    .eq("user_id", profile.id)
    .maybeSingle();

  let accountId = account?.id;
  if (!accountId) {
    const { data: created } = await supabase
      .from("affiliate_accounts")
      .insert({
        user_id: profile.id,
        referral_code: code,
        status: "approved",
      })
      .select("id")
      .single();
    accountId = created?.id;
  }
  if (!accountId) return;

  await supabase.from("affiliate_conversions").insert({
    affiliate_account_id: accountId,
    order_id: orderId,
    event_type: "order",
    commission_amount: Math.round(orderTotal * 0.03 * 100) / 100,
    status: "pending",
  });
}
