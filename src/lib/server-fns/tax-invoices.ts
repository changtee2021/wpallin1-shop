import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  getAdminOrderTaxInvoice,
  getOrderTaxInvoice,
  getTaxInvoiceDownloadUrl,
  listUserTaxInvoiceOverview,
} from "@/services/tax-invoice.service";

export const fetchUserTaxInvoiceOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return listUserTaxInvoiceOverview(supabase, context.userId);
  });

export const fetchOrderTaxInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    return getOrderTaxInvoice(supabase, context.userId, data.orderId);
  });

export const fetchTaxInvoiceDownloadUrl = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ invoiceId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const supabase = await getAdminClient();
    const url = await getTaxInvoiceDownloadUrl(
      supabase,
      data.invoiceId,
      context.userId,
    );
    return { url };
  });

export const fetchAdminOrderTaxInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getAdminOrderTaxInvoice(supabase, data.orderId);
  });
