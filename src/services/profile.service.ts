import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  AccountProfileDto,
  AddressDto,
  SessionProfileDto,
  TaxInvoiceProfileDto,
  UpdateAccountProfileInput,
} from "@/types/api/profile";

export async function getSessionProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
): Promise<SessionProfileDto> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, member_tier, account_status")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  return {
    userId,
    email,
    fullName: profile?.full_name ?? null,
    roles: (roles ?? []).map((r) => r.role as string),
    memberTier: profile?.member_tier ?? null,
    accountStatus: profile?.account_status ?? null,
  };
}

export async function getAccountProfile(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
): Promise<AccountProfileDto> {
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "email, full_name, phone, locale, member_tier, account_status, order_count, total_spent, customer_type, national_id, company_tax_id, company_branch, profile_completed",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);

  return {
    userId,
    email: profile?.email ?? email,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    locale: profile?.locale ?? "th",
    memberTier: profile?.member_tier ?? null,
    accountStatus: profile?.account_status ?? null,
    customerType:
      (profile?.customer_type as "individual" | "juristic") ?? "individual",
    nationalId: profile?.national_id ?? null,
    companyTaxId: profile?.company_tax_id ?? null,
    companyBranch: profile?.company_branch ?? null,
    profileCompleted: profile?.profile_completed ?? false,
    orderCount: profile?.order_count ?? 0,
    totalSpent: Number(profile?.total_spent ?? 0),
    roles: (roles ?? []).map((r) => r.role as string),
  };
}

export async function updateAccountProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateAccountProfileInput,
): Promise<void> {
  const customerType = input.customerType ?? "individual";
  const profileCompleted =
    input.fullName.trim().length > 0 &&
    (customerType === "individual"
      ? Boolean(input.nationalId?.trim())
      : Boolean(input.companyTaxId?.trim()));

  const { error } = await supabase.from("profiles").upsert(
    {
      id: userId,
      full_name: input.fullName.trim(),
      phone: input.phone?.trim() || null,
      locale: input.locale ?? "th",
      customer_type: customerType,
      national_id:
        customerType === "individual" ? input.nationalId?.trim() || null : null,
      company_tax_id:
        customerType === "juristic" ? input.companyTaxId?.trim() || null : null,
      company_branch:
        customerType === "juristic"
          ? input.companyBranch?.trim() || null
          : null,
      profile_completed: profileCompleted,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) throw new Error(error.message);
}

export async function listUserRoles(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => row.role as string);
}

export async function listAddresses(
  supabase: SupabaseClient,
  userId: string,
): Promise<AddressDto[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select(
      "id, label, recipient_name, phone, line1, line2, district, province, postal_code, country, is_default",
    )
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    district: row.district,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  }));
}

export type SaveAddressInput = {
  id?: string;
  label?: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
};

export async function saveAddress(
  supabase: SupabaseClient,
  userId: string,
  input: SaveAddressInput,
): Promise<AddressDto> {
  if (input.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const payload = {
    user_id: userId,
    label: input.label?.trim() || null,
    recipient_name: input.recipientName.trim(),
    phone: input.phone.trim(),
    line1: input.line1.trim(),
    line2: input.line2?.trim() || null,
    district: input.district?.trim() || null,
    province: input.province?.trim() || null,
    postal_code: input.postalCode?.trim() || null,
    country: input.country?.trim() || "TH",
    is_default: input.isDefault ?? false,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("addresses")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", userId)
      .select(
        "id, label, recipient_name, phone, line1, line2, district, province, postal_code, country, is_default",
      )
      .single();
    if (error) throw new Error(error.message);
    return mapAddress(data);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert(payload)
    .select(
      "id, label, recipient_name, phone, line1, line2, district, province, postal_code, country, is_default",
    )
    .single();
  if (error) throw new Error(error.message);
  return mapAddress(data);
}

export async function deleteAddress(
  supabase: SupabaseClient,
  userId: string,
  addressId: string,
): Promise<void> {
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function listTaxInvoiceProfiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<TaxInvoiceProfileDto[]> {
  const { data, error } = await supabase
    .from("tax_invoice_profiles")
    .select(
      "id, company_name, tax_id, branch_code, address, email, phone, is_default",
    )
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    companyName: row.company_name,
    taxId: row.tax_id,
    branchCode: row.branch_code,
    address: row.address,
    email: row.email,
    phone: row.phone,
    isDefault: row.is_default,
  }));
}

export type SaveTaxInvoiceInput = {
  id?: string;
  companyName: string;
  taxId: string;
  branchCode?: string;
  address: string;
  email?: string;
  phone?: string;
  isDefault?: boolean;
};

export async function saveTaxInvoiceProfile(
  supabase: SupabaseClient,
  userId: string,
  input: SaveTaxInvoiceInput,
): Promise<TaxInvoiceProfileDto> {
  if (input.isDefault) {
    await supabase
      .from("tax_invoice_profiles")
      .update({ is_default: false })
      .eq("user_id", userId);
  }

  const payload = {
    user_id: userId,
    company_name: input.companyName.trim(),
    tax_id: input.taxId.trim(),
    branch_code: input.branchCode?.trim() || null,
    address: input.address.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    is_default: input.isDefault ?? false,
    updated_at: new Date().toISOString(),
  };

  if (input.id) {
    const { data, error } = await supabase
      .from("tax_invoice_profiles")
      .update(payload)
      .eq("id", input.id)
      .eq("user_id", userId)
      .select(
        "id, company_name, tax_id, branch_code, address, email, phone, is_default",
      )
      .single();
    if (error) throw new Error(error.message);
    return mapTaxInvoice(data);
  }

  const { data, error } = await supabase
    .from("tax_invoice_profiles")
    .insert(payload)
    .select(
      "id, company_name, tax_id, branch_code, address, email, phone, is_default",
    )
    .single();
  if (error) throw new Error(error.message);
  return mapTaxInvoice(data);
}

export async function getAdminMemberProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AccountProfileDto | null> {
  const { data: authUser } = await supabase.auth.admin.getUserById(userId);
  return getAccountProfile(supabase, userId, authUser?.user?.email ?? null);
}

export async function deleteTaxInvoiceProfile(
  supabase: SupabaseClient,
  userId: string,
  profileId: string,
): Promise<void> {
  const { error } = await supabase
    .from("tax_invoice_profiles")
    .delete()
    .eq("id", profileId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function ensureWalletAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data } = await supabase
    .from("wallet_accounts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return;

  await supabase.from("wallet_accounts").insert({
    user_id: userId,
    available_balance: 0,
    pending_balance: 0,
    currency: "THB",
  });
}

function mapAddress(row: {
  id: string;
  label: string | null;
  recipient_name: string | null;
  phone: string | null;
  line1: string;
  line2: string | null;
  district: string | null;
  province: string | null;
  postal_code: string | null;
  country: string;
  is_default: boolean;
}): AddressDto {
  return {
    id: row.id,
    label: row.label,
    recipientName: row.recipient_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    district: row.district,
    province: row.province,
    postalCode: row.postal_code,
    country: row.country,
    isDefault: row.is_default,
  };
}

function mapTaxInvoice(row: {
  id: string;
  company_name: string;
  tax_id: string;
  branch_code: string | null;
  address: string;
  email: string | null;
  phone: string | null;
  is_default: boolean;
}): TaxInvoiceProfileDto {
  return {
    id: row.id,
    companyName: row.company_name,
    taxId: row.tax_id,
    branchCode: row.branch_code,
    address: row.address,
    email: row.email,
    phone: row.phone,
    isDefault: row.is_default,
  };
}
