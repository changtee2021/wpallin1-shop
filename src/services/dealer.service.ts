import type { SupabaseClient } from "@supabase/supabase-js";

import type { DealerApplicationStatus } from "@/lib/dealer.constants";

export type DealerApplicationInput = {
  companyName: string;
  taxId?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessType?: string;
  address?: string;
};

export type DealerApplicationDto = {
  id: string;
  userId: string;
  companyName: string;
  taxId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  businessType: string | null;
  address: string | null;
  status: DealerApplicationStatus;
  source: "web" | "line" | "sales";
  provinceCode: string | null;
  dealerCode: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

const APPLICATION_SELECT =
  "id, user_id, company_name, tax_id, contact_name, contact_phone, contact_email, business_type, address, status, source, province_code, review_note, reviewed_at, created_at";

function mapApplicationRow(row: Record<string, unknown>): DealerApplicationDto {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    companyName: row.company_name as string,
    taxId: (row.tax_id as string | null) ?? null,
    contactName: (row.contact_name as string | null) ?? null,
    contactPhone: (row.contact_phone as string | null) ?? null,
    contactEmail: (row.contact_email as string | null) ?? null,
    businessType: (row.business_type as string | null) ?? null,
    address: (row.address as string | null) ?? null,
    status: row.status as DealerApplicationStatus,
    source: (row.source as DealerApplicationDto["source"]) ?? "web",
    provinceCode: (row.province_code as string | null) ?? null,
    dealerCode: null,
    reviewNote: (row.review_note as string | null) ?? null,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    createdAt: row.created_at as string,
  };
}

async function userHasDealerRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  return (data ?? []).some((row) => row.role === "dealer");
}

export async function getMyDealerApplication(
  supabase: SupabaseClient,
  userId: string,
): Promise<DealerApplicationDto | null> {
  const { data, error } = await supabase
    .from("dealer_applications")
    .select(APPLICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapApplicationRow(data) : null;
}

export async function submitDealerApplication(
  supabase: SupabaseClient,
  userId: string,
  input: DealerApplicationInput,
): Promise<{ id: string }> {
  if (await userHasDealerRole(supabase, userId)) {
    throw new Error("คุณเป็นตัวแทนอยู่แล้ว — เข้าใช้งานพอร์ทัลตัวแทนได้");
  }

  const { data: existing } = await supabase
    .from("dealer_applications")
    .select("id, status")
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) throw new Error("มีใบสมัครรออนุมัติอยู่แล้ว");

  const { data: inserted, error } = await supabase
    .from("dealer_applications")
    .insert({
      user_id: userId,
      company_name: input.companyName,
      tax_id: input.taxId ?? null,
      contact_name: input.contactName,
      contact_phone: input.contactPhone,
      contact_email: input.contactEmail,
      business_type: input.businessType ?? null,
      address: input.address ?? null,
      status: "pending",
    })
    .select("id, company_name")
    .single();

  if (error) throw new Error(error.message);

  const { notifyStaff, notifyUserEvent } =
    await import("@/services/notification.service");

  await Promise.all([
    notifyStaff(supabase, "dealer_app_pending", {
      companyName: input.companyName,
      applicationId: inserted.id,
    }),
    notifyUserEvent(supabase, userId, "dealer_app_submitted", {
      companyName: input.companyName,
    }),
  ]);

  return { id: inserted.id as string };
}

export async function listDealerApplications(
  supabase: SupabaseClient,
  status?: string,
): Promise<DealerApplicationDto[]> {
  let query = supabase
    .from("dealer_applications")
    .select(APPLICATION_SELECT)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const apps = (data ?? []).map((row) => mapApplicationRow(row));
  const userIds = [...new Set(apps.map((app) => app.userId))];
  if (userIds.length === 0) return apps;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, dealer_code")
    .in("id", userIds);
  const codes = new Map(
    (profiles ?? []).map((p) => [
      p.id as string,
      p.dealer_code as string | null,
    ]),
  );
  return apps.map((app) => ({
    ...app,
    dealerCode: codes.get(app.userId) ?? null,
  }));
}

export async function approveDealerApplication(
  supabase: SupabaseClient,
  applicationId: string,
  adminUserId: string,
  provinceCode: string,
): Promise<{ dealerCode: string }> {
  const { data: app, error } = await supabase
    .from("dealer_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!app) throw new Error("ไม่พบใบสมัคร");
  if (app.status !== "pending") {
    throw new Error("ใบสมัครนี้ดำเนินการแล้ว");
  }

  const { error: updateErr } = await supabase
    .from("dealer_applications")
    .update({
      status: "approved",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      province_code: provinceCode,
    })
    .eq("id", applicationId);

  if (updateErr) throw new Error(updateErr.message);

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("sales_rep_id")
    .eq("id", app.user_id)
    .maybeSingle();

  const { error: profileErr } = await supabase
    .from("profiles")
    .update({
      account_status: "approved",
      member_tier: "silver_dealer",
      sales_rep_id: currentProfile?.sales_rep_id ?? adminUserId,
    })
    .eq("id", app.user_id);

  if (profileErr) throw new Error(profileErr.message);

  const { error: roleErr } = await supabase
    .from("user_roles")
    .upsert(
      { user_id: app.user_id, role: "dealer", granted_by: adminUserId },
      { onConflict: "user_id,role" },
    );

  if (roleErr) throw new Error(roleErr.message);

  const { issueDealerCode } = await import("@/services/dealer-account.service");
  const dealerCode = await issueDealerCode(supabase, app.user_id, provinceCode);

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(supabase, app.user_id, "dealer_approved", {
    companyName: app.company_name,
  });

  return { dealerCode };
}

export async function rejectDealerApplication(
  supabase: SupabaseClient,
  applicationId: string,
  adminUserId: string,
  note?: string,
): Promise<void> {
  const { data: app, error: fetchErr } = await supabase
    .from("dealer_applications")
    .select("user_id, status, company_name")
    .eq("id", applicationId)
    .maybeSingle();

  if (fetchErr) throw new Error(fetchErr.message);
  if (!app) throw new Error("ไม่พบใบสมัคร");
  if (app.status !== "pending") {
    throw new Error("ใบสมัครนี้ดำเนินการแล้ว");
  }

  const reviewNote = note?.trim() || "ไม่ผ่านเกณฑ์";

  const { error } = await supabase
    .from("dealer_applications")
    .update({
      status: "rejected",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      review_note: reviewNote,
    })
    .eq("id", applicationId);

  if (error) throw new Error(error.message);

  if (app.user_id) {
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, app.user_id, "dealer_rejected", {
      companyName: app.company_name,
      reviewNote,
    });
  }
}
