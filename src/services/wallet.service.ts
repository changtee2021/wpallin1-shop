import type { SupabaseClient } from "@supabase/supabase-js";

export type WalletSummaryDto = {
  availableBalance: number;
  pendingBalance: number;
  currency: string;
};

export type WalletTransactionDto = {
  id: string;
  type: string;
  direction: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
};

export async function getWalletSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<WalletSummaryDto> {
  const { data, error } = await supabase
    .from("wallet_accounts")
    .select("available_balance, pending_balance, currency")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return {
    availableBalance: Number(data?.available_balance ?? 0),
    pendingBalance: Number(data?.pending_balance ?? 0),
    currency: data?.currency ?? "THB",
  };
}

export async function listWalletTransactions(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<WalletTransactionDto[]> {
  const { data: account } = await supabase
    .from("wallet_accounts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!account) return [];

  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, tx_type, direction, amount, status, description, created_at")
    .eq("wallet_account_id", account.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.tx_type,
    direction: row.direction,
    amount: Number(row.amount),
    status: row.status,
    description: row.description,
    createdAt: row.created_at,
  }));
}

function throwWalletRpcError(error: { message: string }): never {
  const msg = error.message;
  if (msg.includes("insufficient_balance")) {
    throw new Error("ยอดเงินในกระเป๋าไม่พอ");
  }
  if (msg.includes("wallet_not_found")) {
    throw new Error("ไม่พบกระเป๋าเงิน");
  }
  if (msg.includes("already_processed")) {
    throw new Error("คำขอนี้ดำเนินการแล้ว");
  }
  if (msg.includes("self_approval")) {
    throw new Error("อนุมัติคำขอของตัวเองไม่ได้");
  }
  if (msg.includes("invalid_amount")) {
    throw new Error("จำนวนเงินไม่ถูกต้อง");
  }
  if (msg.includes("not_found")) {
    throw new Error("ไม่พบคำขอเติมเงิน");
  }
  throw new Error("ทำรายการกระเป๋าเงินไม่สำเร็จ");
}

export async function debitWalletForOrder(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  amount: number,
): Promise<void> {
  const { error } = await supabase.rpc("wallet_debit_for_order", {
    p_user_id: userId,
    p_order_id: orderId,
    p_amount: amount,
  });
  if (error) throwWalletRpcError(error);
}

export async function payWithWallet(
  supabase: SupabaseClient,
  userId: string,
  orderId: string,
  paymentId: string,
  amount: number,
): Promise<void> {
  await debitWalletForOrder(supabase, userId, orderId, amount);

  const { error: payErr } = await supabase
    .from("payments")
    .update({
      method: "wallet",
      status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", paymentId);
  if (payErr) throw new Error(payErr.message);

  const { error: orderErr } = await supabase
    .from("orders")
    .update({ status: "paid", payment_status: "paid" })
    .eq("id", orderId);
  if (orderErr) throw new Error(orderErr.message);
}

export type WalletTopupRequestDto = {
  id: string;
  userId: string;
  userEmail: string | null;
  userName: string | null;
  amount: number;
  status: string;
  slipFileUrl: string | null;
  slipSignedUrl: string | null;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

const SLIP_BUCKET = "wpall-retail-payment-slips";

async function ensureWalletAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ id: string }> {
  const { data } = await supabase
    .from("wallet_accounts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await supabase
    .from("wallet_accounts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function createTopupRequest(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
): Promise<string> {
  if (amount < 100) throw new Error("ยอดเติมขั้นต่ำ 100 บาท");

  const account = await ensureWalletAccount(supabase, userId);

  const { data, error } = await supabase
    .from("wallet_topup_requests")
    .insert({
      user_id: userId,
      wallet_account_id: account.id,
      amount,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  const { notifyStaff } = await import("@/services/notification.service");
  await notifyStaff(supabase, "topup_pending");

  return data.id;
}

export async function uploadTopupSlip(
  supabase: SupabaseClient,
  userId: string,
  requestId: string,
  file: File,
): Promise<void> {
  const { data: req, error: reqErr } = await supabase
    .from("wallet_topup_requests")
    .select("id, user_id, status")
    .eq("id", requestId)
    .eq("user_id", userId)
    .maybeSingle();

  if (reqErr) throw new Error(reqErr.message);
  if (!req) throw new Error("ไม่พบคำขอเติมเงิน");
  if (req.status !== "pending")
    throw new Error("คำขอนี้ไม่สามารถอัปโหลดสลิปได้");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `topup/${userId}/${requestId}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadErr) throw new Error(uploadErr.message);

  const { error } = await supabase
    .from("wallet_topup_requests")
    .update({
      slip_file_url: `storage://${path}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) throw new Error(error.message);
}

async function signedSlipUrl(
  supabase: SupabaseClient,
  storagePath: string | null,
): Promise<string | null> {
  if (!storagePath) return null;
  const path = storagePath.startsWith("storage://")
    ? storagePath.replace("storage://", "")
    : storagePath;
  const { data, error } = await supabase.storage
    .from(SLIP_BUCKET)
    .createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}

export async function listUserTopupRequests(
  supabase: SupabaseClient,
  userId: string,
): Promise<WalletTopupRequestDto[]> {
  const { data, error } = await supabase
    .from("wallet_topup_requests")
    .select(
      "id, user_id, amount, status, slip_file_url, admin_note, created_at, reviewed_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);

  return Promise.all(
    (data ?? []).map(async (row) => ({
      id: row.id,
      userId: row.user_id,
      userEmail: null,
      userName: null,
      amount: Number(row.amount),
      status: row.status,
      slipFileUrl: row.slip_file_url,
      slipSignedUrl: await signedSlipUrl(supabase, row.slip_file_url),
      adminNote: row.admin_note,
      createdAt: row.created_at,
      reviewedAt: row.reviewed_at,
    })),
  );
}

export async function listAdminTopupRequests(
  supabase: SupabaseClient,
  status?: string,
): Promise<WalletTopupRequestDto[]> {
  let query = supabase
    .from("wallet_topup_requests")
    .select(
      "id, user_id, amount, status, slip_file_url, admin_note, created_at, reviewed_at, profiles!wallet_topup_requests_user_id_fkey(email, full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    const { data: fallback, error: fbErr } = await supabase
      .from("wallet_topup_requests")
      .select(
        "id, user_id, amount, status, slip_file_url, admin_note, created_at, reviewed_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (fbErr) throw new Error(fbErr.message);

    const userIds = [...new Set((fallback ?? []).map((r) => r.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .in("id", userIds);
    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    return Promise.all(
      (fallback ?? []).map(async (row) => {
        const p = profileMap.get(row.user_id);
        return {
          id: row.id,
          userId: row.user_id,
          userEmail: p?.email ?? null,
          userName: p?.full_name ?? null,
          amount: Number(row.amount),
          status: row.status,
          slipFileUrl: row.slip_file_url,
          slipSignedUrl: await signedSlipUrl(supabase, row.slip_file_url),
          adminNote: row.admin_note,
          createdAt: row.created_at,
          reviewedAt: row.reviewed_at,
        };
      }),
    );
  }

  return Promise.all(
    (data ?? []).map(async (row) => {
      const profile = row.profiles as
        { email: string | null; full_name: string | null } | null | undefined;
      return {
        id: row.id,
        userId: row.user_id,
        userEmail: profile?.email ?? null,
        userName: profile?.full_name ?? null,
        amount: Number(row.amount),
        status: row.status,
        slipFileUrl: row.slip_file_url,
        slipSignedUrl: await signedSlipUrl(supabase, row.slip_file_url),
        adminNote: row.admin_note,
        createdAt: row.created_at,
        reviewedAt: row.reviewed_at,
      };
    }),
  );
}

export async function approveTopupRequest(
  supabase: SupabaseClient,
  adminUserId: string,
  requestId: string,
): Promise<void> {
  const { data, error } = await supabase.rpc("wallet_approve_topup", {
    p_request_id: requestId,
    p_admin_id: adminUserId,
  });
  if (error) throwWalletRpcError(error);

  const userId = typeof data === "string" ? data : null;
  if (!userId) return;

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(supabase, userId, "wallet_topup_approved");
}

export async function rejectTopupRequest(
  supabase: SupabaseClient,
  adminUserId: string,
  requestId: string,
  note?: string,
): Promise<void> {
  const { data: req } = await supabase
    .from("wallet_topup_requests")
    .select("user_id")
    .eq("id", requestId)
    .maybeSingle();

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("wallet_topup_requests")
    .update({
      status: "rejected",
      admin_note: note?.trim() || null,
      reviewed_by: adminUserId,
      reviewed_at: now,
      updated_at: now,
    })
    .eq("id", requestId)
    .eq("status", "pending");

  if (error) throw new Error(error.message);

  if (req?.user_id) {
    const { notifyUserEvent } = await import("@/services/notification.service");
    await notifyUserEvent(supabase, req.user_id, "wallet_topup_rejected");
  }
}

export async function adminAdjustWallet(
  supabase: SupabaseClient,
  adminUserId: string,
  userId: string,
  amount: number,
  direction: "credit" | "debit",
  note?: string,
): Promise<void> {
  if (amount <= 0) throw new Error("จำนวนเงินไม่ถูกต้อง");

  await ensureWalletAccount(supabase, userId);
  const { error } = await supabase.rpc("wallet_admin_adjust", {
    p_user_id: userId,
    p_admin_id: adminUserId,
    p_amount: amount,
    p_direction: direction,
    p_note: note ?? "",
  });
  if (error) {
    if (error.message.includes("insufficient_balance")) {
      throw new Error("ยอดเงินไม่พอสำหรับหัก");
    }
    throwWalletRpcError(error);
  }
}
