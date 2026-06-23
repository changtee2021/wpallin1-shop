import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  approveCreditOrder,
  getCreditAccount,
  getCreditSummary,
  listAdminCreditAccounts,
  listCreditInvoices,
  listPendingCreditOrders,
  recordCreditPayment,
  rejectCreditOrder,
  upsertCreditAccount,
  validateCreditCheckout,
  isCreditEnabled,
} from "@/services/credit.service";

export const fetchCreditEnabled = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const supabase = await getAdminClient();
    return isCreditEnabled(supabase);
  });

export const fetchCreditSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return getCreditSummary(supabase, context.userId);
  });

export const fetchCreditAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return getCreditAccount(supabase, context.userId);
  });

export const validateCreditCheckoutFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ grandTotal: z.number().positive() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    return validateCreditCheckout(supabase, context.userId, data.grandTotal);
  });

export const fetchAdminCreditAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminCreditAccounts(supabase);
  });

export const fetchAdminPendingCreditOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listPendingCreditOrders(supabase);
  });

export const fetchAdminCreditInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    if (data.userId) {
      return listCreditInvoices(supabase, data.userId);
    }
    const accounts = await listAdminCreditAccounts(supabase);
    const all = await Promise.all(
      accounts.map((a) => listCreditInvoices(supabase, a.userId)),
    );
    return all.flat();
  });

export const adminUpsertCreditAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        creditLimit: z.number().min(0),
        creditTermDays: z.number().int().min(1),
        minOrderAmount: z.number().min(0),
        status: z.enum(["active", "suspended", "closed"]).optional(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return upsertCreditAccount(supabase, data.userId, data, context.userId);
  });

export const adminApproveCreditOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await approveCreditOrder(supabase, data.orderId, context.userId);
    return { ok: true };
  });

export const adminRejectCreditOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await rejectCreditOrder(supabase, data.orderId, context.userId, data.note);
    return { ok: true };
  });

export const adminRecordCreditPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        invoiceId: z.string().uuid(),
        amount: z.number().positive(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await recordCreditPayment(
      supabase,
      data.invoiceId,
      data.amount,
      context.userId,
    );
    return { ok: true };
  });
