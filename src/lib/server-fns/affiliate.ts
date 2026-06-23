import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  createAffiliateLink,
  getAffiliateDashboard,
  registerAffiliateAccount,
  requestAffiliatePayout,
} from "@/services/affiliate.service";

export const fetchAffiliateDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    const base =
      process.env.VITE_APP_PUBLIC_URL ?? "https://wpallin1-shop.vercel.app";
    return getAffiliateDashboard(supabase, context.userId, base);
  });

export const registerAffiliate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    const account = await registerAffiliateAccount(supabase, context.userId);
    const base =
      process.env.VITE_APP_PUBLIC_URL ?? "https://wpallin1-shop.vercel.app";
    return getAffiliateDashboard(supabase, context.userId, base).then((d) => ({
      ...d,
      account,
    }));
  });

export const createAffiliateLinkFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1),
        targetUrl: z.string().url(),
        label: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    await createAffiliateLink(supabase, context.userId, data);
    return { ok: true };
  });

export const requestAffiliatePayoutFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        amount: z.number().positive(),
        bank: z.string().min(1),
        accountNo: z.string().min(1),
        accountName: z.string().min(1),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    await requestAffiliatePayout(supabase, context.userId, data);
    return { ok: true };
  });
