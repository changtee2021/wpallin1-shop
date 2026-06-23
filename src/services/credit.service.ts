import type { SupabaseClient } from "@supabase/supabase-js";

import { hasApprovedKyc } from "@/services/documents.service";

export type CreditAccountDto = {
  id: string;
  userId: string;
  creditLimit: number;
  creditTermDays: number;
  minOrderAmount: number;
  outstandingBalance: number;
  availableCredit: number;
  status: string;
  note: string | null;
  approvedAt: string | null;
};

export type CreditInvoiceDto = {
  id: string;
  orderId: string;
  orderNumber: string | null;
  amount: number;
  paidAmount: number;
  remaining: number;
  issuedAt: string;
  dueDate: string;
  status: string;
  daysOverdue: number;
};

export type CreditSummaryDto = {
  account: CreditAccountDto | null;
  invoices: CreditInvoiceDto[];
  pendingCreditOrders: PendingCreditOrderDto[];
};

export type PendingCreditOrderDto = {
  orderId: string;
  orderNumber: string;
  userId: string;
  customerName: string | null;
  grandTotal: number;
  createdAt: string;
  creditStatus: string;
};

function mapAccount(row: {
  id: string;
  user_id: string;
  credit_limit: number;
  credit_term_days: number;
  min_order_amount: number;
  outstanding_balance: number;
  status: string;
  note: string | null;
  approved_at: string | null;
}): CreditAccountDto {
  const creditLimit = Number(row.credit_limit);
  const outstanding = Number(row.outstanding_balance);
  return {
    id: row.id,
    userId: row.user_id,
    creditLimit,
    creditTermDays: row.credit_term_days,
    minOrderAmount: Number(row.min_order_amount),
    outstandingBalance: outstanding,
    availableCredit: Math.max(0, creditLimit - outstanding),
    status: row.status,
    note: row.note,
    approvedAt: row.approved_at,
  };
}

export async function isCreditEnabled(
  supabase: SupabaseClient,
): Promise<boolean> {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "credit.enabled")
    .maybeSingle();
  return data?.value === true;
}

export async function getCreditAccount(
  supabase: SupabaseClient,
  userId: string,
): Promise<CreditAccountDto | null> {
  const { data, error } = await supabase
    .from("credit_accounts")
    .select(
      "id, user_id, credit_limit, credit_term_days, min_order_amount, outstanding_balance, status, note, approved_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return mapAccount(data);
}

export async function upsertCreditAccount(
  supabase: SupabaseClient,
  userId: string,
  input: {
    creditLimit: number;
    creditTermDays: number;
    minOrderAmount: number;
    status?: "active" | "suspended" | "closed";
    note?: string;
  },
  approvedBy: string,
): Promise<CreditAccountDto> {
  const { data, error } = await supabase
    .from("credit_accounts")
    .upsert(
      {
        user_id: userId,
        credit_limit: input.creditLimit,
        credit_term_days: input.creditTermDays,
        min_order_amount: input.minOrderAmount,
        status: input.status ?? "active",
        note: input.note?.trim() || null,
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select(
      "id, user_id, credit_limit, credit_term_days, min_order_amount, outstanding_balance, status, note, approved_at",
    )
    .single();

  if (error) throw new Error(error.message);
  return mapAccount(data);
}

export async function validateCreditCheckout(
  supabase: SupabaseClient,
  userId: string,
  grandTotal: number,
): Promise<CreditAccountDto> {
  const enabled = await isCreditEnabled(supabase);
  if (!enabled) throw new Error("ระบบเครดิตยังไม่เปิดใช้งาน");

  const account = await getCreditAccount(supabase, userId);
  if (!account || account.status !== "active") {
    throw new Error("คุณยังไม่มีวงเงินเครดิต กรุณาติดต่อแอดมิน");
  }
  if (grandTotal < account.minOrderAmount) {
    throw new Error(
      `ยอดสั่งขั้นต่ำสำหรับเครดิต ${account.minOrderAmount.toLocaleString()} บาท`,
    );
  }
  if (grandTotal > account.availableCredit) {
    throw new Error("วงเงินเครดิตไม่เพียงพอ");
  }
  return account;
}

export async function listCreditInvoices(
  supabase: SupabaseClient,
  userId: string,
): Promise<CreditInvoiceDto[]> {
  const account = await getCreditAccount(supabase, userId);
  if (!account) return [];

  const { data, error } = await supabase
    .from("credit_invoices")
    .select(
      "id, order_id, amount, paid_amount, issued_at, due_date, status, orders(order_number)",
    )
    .eq("credit_account_id", account.id)
    .order("due_date", { ascending: true });

  if (error) throw new Error(error.message);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (data ?? []).map((row) => {
    const due = new Date(row.due_date);
    due.setHours(0, 0, 0, 0);
    const amount = Number(row.amount);
    const paidAmount = Number(row.paid_amount);
    const orders = row.orders as { order_number?: string } | null;
    return {
      id: row.id,
      orderId: row.order_id,
      orderNumber: orders?.order_number ?? null,
      amount,
      paidAmount,
      remaining: Math.max(0, amount - paidAmount),
      issuedAt: row.issued_at,
      dueDate: row.due_date,
      status: row.status,
      daysOverdue:
        due < today
          ? Math.ceil((today.getTime() - due.getTime()) / 86400000)
          : 0,
    };
  });
}

export async function getCreditSummary(
  supabase: SupabaseClient,
  userId: string,
): Promise<CreditSummaryDto> {
  const [account, invoices] = await Promise.all([
    getCreditAccount(supabase, userId),
    listCreditInvoices(supabase, userId),
  ]);
  return { account, invoices, pendingCreditOrders: [] };
}

export async function listPendingCreditOrders(
  supabase: SupabaseClient,
): Promise<PendingCreditOrderDto[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, user_id, customer_name, grand_total, created_at, metadata",
    )
    .eq("status", "pending_payment")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((row) => {
      const meta = row.metadata as Record<string, unknown> | null;
      return meta?.credit_status === "requested";
    })
    .map((row) => ({
      orderId: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      customerName: row.customer_name,
      grandTotal: Number(row.grand_total),
      createdAt: row.created_at,
      creditStatus: "requested",
    }));
}

export async function approveCreditOrder(
  supabase: SupabaseClient,
  orderId: string,
  adminId: string,
): Promise<void> {
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id, user_id, grand_total, metadata, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (orderErr) throw new Error(orderErr.message);
  if (!order) throw new Error("ไม่พบออเดอร์");

  const meta = (order.metadata as Record<string, unknown>) ?? {};
  if (meta.credit_status !== "requested") {
    throw new Error("ออเดอร์นี้ไม่ได้รออนุมัติเครดิต");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("customer_type")
    .eq("id", order.user_id)
    .maybeSingle();

  const customerType =
    (profile?.customer_type as "individual" | "juristic") ?? "individual";
  const kycOk = await hasApprovedKyc(supabase, order.user_id, customerType);
  if (!kycOk) throw new Error("เอกสาร KYC ยังไม่ครบหรือยังไม่ได้รับการอนุมัติ");

  const account = await validateCreditCheckout(
    supabase,
    order.user_id,
    Number(order.grand_total),
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + account.creditTermDays);
  const dueDateStr = dueDate.toISOString().slice(0, 10);

  const { error: invoiceErr } = await supabase.from("credit_invoices").insert({
    credit_account_id: account.id,
    order_id: order.id,
    amount: Number(order.grand_total),
    due_date: dueDateStr,
    status: "open",
  });
  if (invoiceErr) throw new Error(invoiceErr.message);

  const newOutstanding = account.outstandingBalance + Number(order.grand_total);
  const { error: acctErr } = await supabase
    .from("credit_accounts")
    .update({
      outstanding_balance: newOutstanding,
      updated_at: new Date().toISOString(),
    })
    .eq("id", account.id);
  if (acctErr) throw new Error(acctErr.message);

  const { error: updateErr } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: "unpaid",
      metadata: {
        ...meta,
        credit_status: "approved",
        credit_approved_by: adminId,
        credit_approved_at: new Date().toISOString(),
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);
  if (updateErr) throw new Error(updateErr.message);

  const { createProductionJob } =
    await import("@/services/admin-order.service");
  await createProductionJob(supabase, orderId);

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(supabase, order.user_id, "credit_order_approved", {
    orderId: order.id,
    orderNumber: order.order_number,
  });
}

export async function rejectCreditOrder(
  supabase: SupabaseClient,
  orderId: string,
  adminId: string,
  note?: string,
): Promise<void> {
  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, metadata, order_number")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) throw new Error("ไม่พบออเดอร์");

  const meta = (order.metadata as Record<string, unknown>) ?? {};
  const { error } = await supabase
    .from("orders")
    .update({
      metadata: {
        ...meta,
        credit_status: "rejected",
        credit_rejected_by: adminId,
        credit_rejected_at: new Date().toISOString(),
        credit_reject_note: note?.trim() || null,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(supabase, order.user_id, "credit_order_rejected", {
    orderId: order.id,
    orderNumber: order.order_number,
  });
}

export async function recordCreditPayment(
  supabase: SupabaseClient,
  invoiceId: string,
  amount: number,
  adminId: string,
): Promise<void> {
  const { data: invoice, error: invErr } = await supabase
    .from("credit_invoices")
    .select("id, credit_account_id, amount, paid_amount, status")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invErr) throw new Error(invErr.message);
  if (!invoice) throw new Error("ไม่พบใบวางบิล");

  const newPaid = Number(invoice.paid_amount) + amount;
  const total = Number(invoice.amount);
  if (newPaid > total) throw new Error("ยอดชำระเกินยอดบิล");

  const newStatus =
    newPaid >= total ? "paid" : newPaid > 0 ? "partially_paid" : invoice.status;

  const { error: updateInvErr } = await supabase
    .from("credit_invoices")
    .update({
      paid_amount: newPaid,
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", invoiceId);
  if (updateInvErr) throw new Error(updateInvErr.message);

  const { data: account } = await supabase
    .from("credit_accounts")
    .select("id, outstanding_balance")
    .eq("id", invoice.credit_account_id)
    .maybeSingle();

  if (account) {
    const newOutstanding = Math.max(
      0,
      Number(account.outstanding_balance) - amount,
    );
    await supabase
      .from("credit_accounts")
      .update({
        outstanding_balance: newOutstanding,
        updated_at: new Date().toISOString(),
      })
      .eq("id", account.id);
  }

  void adminId;
}

export async function listAdminCreditAccounts(
  supabase: SupabaseClient,
): Promise<
  Array<
    CreditAccountDto & {
      email: string | null;
      fullName: string | null;
    }
  >
> {
  const { data, error } = await supabase
    .from("credit_accounts")
    .select(
      "id, user_id, credit_limit, credit_term_days, min_order_amount, outstanding_balance, status, note, approved_at, profiles(email, full_name)",
    )
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const profiles = row.profiles as {
      email?: string;
      full_name?: string;
    } | null;
    return {
      ...mapAccount(row),
      email: profiles?.email ?? null,
      fullName: profiles?.full_name ?? null,
    };
  });
}
