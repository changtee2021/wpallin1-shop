import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin, requireStaff } from "@/lib/server-auth";
import { cartCtxSchema, getAdminClient } from "@/lib/server-fns/_shared";
import { resolveCartForContext } from "@/services/cart.service";
import {
  requestQuoteFromCart,
  listUserQuotations,
  listAdminQuotations,
  getQuotationDetail,
  updateQuotationStatus,
  respondToQuotation,
  convertQuotationToOrder,
} from "@/services/quotation.service";

export const requestQuotationFromCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    cartCtxSchema.extend({ note: z.string().optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const cart = await resolveCartForContext(supabase, {
      userId: context.userId,
      sessionId: data.sessionId,
    });
    const id = await requestQuoteFromCart(
      supabase,
      context.userId,
      cart.id,
      data.note,
    );
    return { quotationId: id };
  });

export const fetchUserQuotations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return listUserQuotations(supabase, context.userId);
  });

export const fetchAdminQuotations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ status: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminQuotations(supabase, data.status);
  });

export const fetchQuotationDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ quotationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return getQuotationDetail(supabase, data.quotationId);
  });

export const sendQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ quotationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    await updateQuotationStatus(supabase, data.quotationId, "sent");
    return { ok: true };
  });

export const respondQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ quotationId: z.string().uuid(), accept: z.boolean() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    await respondToQuotation(
      supabase,
      context.userId,
      data.quotationId,
      data.accept,
    );
    return { ok: true };
  });

export const convertQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ quotationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    return convertQuotationToOrder(supabase, data.quotationId, context.userId);
  });
