import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { requireAdmin, requireStaff } from "@/lib/server-auth";
import {
  cartCtxSchema,
  getAdminClient,
  quotationBuyerSchema,
} from "@/lib/server-fns/_shared";
import { resolveCartForContext } from "@/services/cart.service";
import {
  requestQuoteFromCart,
  listUserQuotations,
  listAdminQuotations,
  getQuotationDetail,
  getQuotationByPublicToken,
  updateQuotationStatus,
  respondToQuotation,
  respondToQuotationByToken,
  convertQuotationToOrder,
  updateQuotationTerms,
} from "@/services/quotation.service";

export const requestQuotationFromCart = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    cartCtxSchema
      .extend({
        itemIds: z.array(z.string().uuid()).optional(),
        buyer: quotationBuyerSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    try {
      await enforceRateLimit("quote-request", context.userId, {
        requests: 3,
        window: "1 m",
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        throw new Error("Too many quote requests. Please try again later.");
      }
      throw err;
    }

    const supabase = await getAdminClient();
    const cart = await resolveCartForContext(supabase, {
      userId: context.userId,
      sessionId: data.sessionId,
    });
    const id = await requestQuoteFromCart(
      supabase,
      context.userId,
      cart.id,
      data.buyer,
      data.itemIds,
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

export const fetchPublicQuotation = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(8) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const quote = await getQuotationByPublicToken(supabase, data.token);
    if (!quote) throw new Error("ไม่พบใบเสนอราคา");
    return quote;
  });

export const sendQuotation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ quotationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    const result = await updateQuotationStatus(
      supabase,
      data.quotationId,
      "sent",
    );
    return { ok: true, publicToken: result.publicToken };
  });

export const saveQuotationTerms = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        quotationId: z.string().uuid(),
        paymentTerms: z.string().optional(),
        deliveryTerms: z.string().optional(),
        customerNote: z.string().optional(),
        validUntil: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    await updateQuotationTerms(supabase, data.quotationId, data);
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

export const respondPublicQuotation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(8), accept: z.boolean() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    await respondToQuotationByToken(supabase, data.token, data.accept);
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
