import type { SupabaseClient } from "@supabase/supabase-js";

export type DealerApplicationInput = {
  companyName: string;
  taxId?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessType?: string;
  address?: string;
};

export async function submitDealerApplication(
  supabase: SupabaseClient,
  userId: string,
  input: DealerApplicationInput,
): Promise<void> {
  const { data: existing } = await supabase
    .from("dealer_applications")
    .select("id, status")
    .eq("user_id", userId)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) throw new Error("มีใบสมัครรออนุมัติอยู่แล้ว");

  const { error } = await supabase.from("dealer_applications").insert({
    user_id: userId,
    company_name: input.companyName,
    tax_id: input.taxId ?? null,
    contact_name: input.contactName,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail,
    business_type: input.businessType ?? null,
    address: input.address ?? null,
    status: "pending",
  });
  if (error) throw new Error(error.message);
}

export type DealerApplicationDto = {
  id: string;
  userId: string;
  companyName: string;
  contactName: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: string;
};

export async function listDealerApplications(
  supabase: SupabaseClient,
  status?: string,
): Promise<DealerApplicationDto[]> {
  let query = supabase
    .from("dealer_applications")
    .select(
      "id, user_id, company_name, contact_name, contact_email, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    contactName: row.contact_name,
    contactEmail: row.contact_email,
    status: row.status,
    createdAt: row.created_at,
  }));
}

export async function approveDealerApplication(
  supabase: SupabaseClient,
  applicationId: string,
  adminUserId: string,
): Promise<void> {
  const { data: app, error } = await supabase
    .from("dealer_applications")
    .select("*")
    .eq("id", applicationId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!app) throw new Error("ไม่พบใบสมัคร");

  await supabase
    .from("dealer_applications")
    .update({
      status: "approved",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  await supabase
    .from("profiles")
    .update({ account_status: "approved", member_tier: "silver_dealer" })
    .eq("id", app.user_id);

  await supabase
    .from("user_roles")
    .upsert(
      { user_id: app.user_id, role: "dealer", granted_by: adminUserId },
      { onConflict: "user_id,role" },
    );

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(supabase, app.user_id, "dealer_approved");
}

export async function rejectDealerApplication(
  supabase: SupabaseClient,
  applicationId: string,
  adminUserId: string,
  note?: string,
): Promise<void> {
  const { data: app } = await supabase
    .from("dealer_applications")
    .select("user_id")
    .eq("id", applicationId)
    .maybeSingle();

  const { error } = await supabase
    .from("dealer_applications")
    .update({
      status: "rejected",
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", applicationId);
  if (error) throw new Error(error.message);

  if (app?.user_id) {
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, app.user_id, "dealer_rejected");
  }
}
