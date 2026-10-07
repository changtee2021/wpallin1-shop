import type { SupabaseClient } from "@supabase/supabase-js";

import {
  DEALER_PROVINCE_CODE_PATTERN,
  normalizeDealerCode,
  normalizeProvinceCode,
} from "@/lib/dealer-provinces";

export type DealerAccountSource = "line" | "sales" | "web";

export type CreateDealerAccountInput = {
  companyName: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  provinceCode: string;
  businessType?: string;
  taxId?: string;
  branch?: string;
  address?: string;
  source: Exclude<DealerAccountSource, "web">;
};

export type DealerCredentials = {
  userId: string;
  dealerCode: string;
  tempPassword: string;
  companyName: string;
  contactName: string;
};

export type DealerSalesRep = {
  name: string;
  phone: string | null;
  email: string | null;
};

export type DealerAccountDto = {
  dealerCode: string | null;
  provinceCode: string | null;
  dealerSince: string | null;
  mustChangePassword: boolean;
  accountStatus: string;
  memberTier: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  companyName: string | null;
  companyTaxId: string | null;
  companyBranch: string | null;
  businessType: string | null;
  address: string | null;
  salesRep: DealerSalesRep | null;
};

const SYNTHETIC_EMAIL_DOMAIN = "dealer.wpallin1.com";
const PASSWORD_ALPHABET =
  "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

export function generateTempPassword(length = 10): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(
    bytes,
    (n) => PASSWORD_ALPHABET[n % PASSWORD_ALPHABET.length],
  ).join("");
}

function syntheticEmail(dealerCode: string): string {
  return `${dealerCode.toLowerCase()}@${SYNTHETIC_EMAIL_DOMAIN}`;
}

export function isSyntheticDealerEmail(email: string | null | undefined) {
  return Boolean(email?.endsWith(`@${SYNTHETIC_EMAIL_DOMAIN}`));
}

function assertProvinceCode(raw: string): string {
  const code = normalizeProvinceCode(raw);
  if (!DEALER_PROVINCE_CODE_PATTERN.test(code)) {
    throw new Error("รหัสจังหวัดต้องเป็นตัวอักษรอังกฤษ 2–4 ตัว เช่น BKK");
  }
  return code;
}

export async function issueDealerCode(
  admin: SupabaseClient,
  userId: string,
  provinceCode: string,
): Promise<string> {
  const { data, error } = await admin.rpc("issue_dealer_code", {
    _user_id: userId,
    _province_code: assertProvinceCode(provinceCode),
  });
  if (error) throw new Error(error.message);
  return data as string;
}

/** Sales opens the account over LINE: auth user, approved dealer profile, code and a one-time password. */
export async function createDealerAccount(
  admin: SupabaseClient,
  staffUserId: string,
  input: CreateDealerAccountInput,
): Promise<DealerCredentials> {
  const provinceCode = assertProvinceCode(input.provinceCode);
  const realEmail = input.contactEmail?.trim().toLowerCase() || null;
  const tempPassword = generateTempPassword();

  const { data: created, error: createErr } = await admin.auth.admin.createUser(
    {
      email:
        realEmail ?? `pending-${crypto.randomUUID()}@${SYNTHETIC_EMAIL_DOMAIN}`,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: input.contactName },
    },
  );
  if (createErr || !created.user) {
    const message = createErr?.message ?? "";
    if (/already|registered|exists/i.test(message)) {
      throw new Error(
        "อีเมลนี้มีบัญชีอยู่แล้ว ให้ลูกค้าเข้าสู่ระบบแล้วสมัครตัวแทน หรือเว้นอีเมลว่างไว้",
      );
    }
    throw new Error("สร้างบัญชีไม่สำเร็จ");
  }

  const userId = created.user.id;

  try {
    const { error: profileErr } = await admin.from("profiles").upsert(
      {
        id: userId,
        email: realEmail,
        full_name: input.contactName,
        phone: input.contactPhone,
        customer_type: "juristic",
        company_tax_id: input.taxId ?? null,
        company_branch: input.branch ?? null,
        account_status: "approved",
        member_tier: "silver_dealer",
        sales_rep_id: staffUserId,
        must_change_password: true,
      },
      { onConflict: "id" },
    );
    if (profileErr) throw new Error(profileErr.message);

    const { error: roleErr } = await admin
      .from("user_roles")
      .upsert(
        { user_id: userId, role: "dealer", granted_by: staffUserId },
        { onConflict: "user_id,role" },
      );
    if (roleErr) throw new Error(roleErr.message);

    const now = new Date().toISOString();
    const { error: appErr } = await admin.from("dealer_applications").insert({
      user_id: userId,
      company_name: input.companyName,
      tax_id: input.taxId ?? null,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      contact_email: realEmail,
      business_type: input.businessType ?? null,
      address: input.address ?? null,
      province_code: provinceCode,
      source: input.source,
      status: "approved",
      reviewed_by: staffUserId,
      reviewed_at: now,
    });
    if (appErr) throw new Error(appErr.message);

    const dealerCode = await issueDealerCode(admin, userId, provinceCode);

    if (!realEmail) {
      await admin.auth.admin.updateUserById(userId, {
        email: syntheticEmail(dealerCode),
        email_confirm: true,
      });
    }

    return {
      userId,
      dealerCode,
      tempPassword,
      companyName: input.companyName,
      contactName: input.contactName,
    };
  } catch (err) {
    await admin.auth.admin.deleteUser(userId).catch(() => undefined);
    throw err;
  }
}

/** New one-time password for a dealer who lost theirs; they must change it on next login. */
export async function resetDealerPassword(
  admin: SupabaseClient,
  userId: string,
): Promise<{ dealerCode: string; tempPassword: string }> {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("dealer_code")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile?.dealer_code) throw new Error("บัญชีนี้ยังไม่มีรหัสตัวแทน");

  const tempPassword = generateTempPassword();
  const { error: authErr } = await admin.auth.admin.updateUserById(userId, {
    password: tempPassword,
  });
  if (authErr) throw new Error("ตั้งรหัสผ่านใหม่ไม่สำเร็จ");

  const { error: flagErr } = await admin
    .from("profiles")
    .update({ must_change_password: true })
    .eq("id", userId);
  if (flagErr) throw new Error(flagErr.message);

  return { dealerCode: profile.dealer_code as string, tempPassword };
}

export async function findDealerLoginEmail(
  admin: SupabaseClient,
  rawCode: string,
): Promise<string | null> {
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .eq("dealer_code", normalizeDealerCode(rawCode))
    .maybeSingle();
  if (!profile?.id) return null;

  const { data } = await admin.auth.admin.getUserById(profile.id as string);
  return data.user?.email ?? null;
}

export async function clearMustChangePassword(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await admin
    .from("profiles")
    .update({ must_change_password: false })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function getDealerAccount(
  admin: SupabaseClient,
  userId: string,
): Promise<DealerAccountDto | null> {
  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      "email, full_name, phone, account_status, member_tier, company_tax_id, company_branch, dealer_code, dealer_province_code, dealer_since, sales_rep_id, must_change_password",
    )
    .eq("id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!profile) return null;

  const [{ data: app }, { data: rep }] = await Promise.all([
    admin
      .from("dealer_applications")
      .select("company_name, business_type, address")
      .eq("user_id", userId)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    profile.sales_rep_id
      ? admin
          .from("profiles")
          .select("full_name, phone, email")
          .eq("id", profile.sales_rep_id as string)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    dealerCode: (profile.dealer_code as string | null) ?? null,
    provinceCode: (profile.dealer_province_code as string | null) ?? null,
    dealerSince: (profile.dealer_since as string | null) ?? null,
    mustChangePassword: Boolean(profile.must_change_password),
    accountStatus: profile.account_status as string,
    memberTier: profile.member_tier as string,
    contactName: (profile.full_name as string | null) ?? null,
    phone: (profile.phone as string | null) ?? null,
    email: isSyntheticDealerEmail(profile.email as string | null)
      ? null
      : ((profile.email as string | null) ?? null),
    companyName: (app?.company_name as string | null) ?? null,
    companyTaxId: (profile.company_tax_id as string | null) ?? null,
    companyBranch: (profile.company_branch as string | null) ?? null,
    businessType: (app?.business_type as string | null) ?? null,
    address: (app?.address as string | null) ?? null,
    salesRep: rep
      ? {
          name: (rep.full_name as string | null) ?? "ทีมขาย WP ALL",
          phone: (rep.phone as string | null) ?? null,
          email: (rep.email as string | null) ?? null,
        }
      : null,
  };
}
