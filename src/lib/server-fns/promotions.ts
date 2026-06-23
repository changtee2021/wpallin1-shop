import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  getPromptPayId,
  listAdminCoupons,
  listAdminPromotions,
  saveAdminCoupon,
  saveAdminPromotion,
  updatePromptPayId,
} from "@/services/promotion-admin.service";

export const fetchAdminCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminCoupons(supabase);
  });

export const saveAdminCouponFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        code: z.string().min(1),
        description: z.string().optional(),
        discountType: z.enum(["fixed", "percent"]),
        discountValue: z.number().min(0),
        minOrderAmount: z.number().min(0).optional(),
        maxUses: z.number().int().positive().nullable().optional(),
        startsAt: z.string().nullable().optional(),
        endsAt: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await saveAdminCoupon(supabase, data);
    return { ok: true };
  });

export const fetchAdminPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminPromotions(supabase);
  });

export const saveAdminPromotionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        slug: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        bannerUrl: z.string().optional(),
        startsAt: z.string().nullable().optional(),
        endsAt: z.string().nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await saveAdminPromotion(supabase, data);
    return { ok: true };
  });

export const fetchPromptPayId = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = await getAdminClient();
    return { promptPayId: await getPromptPayId(supabase) };
  },
);

export const updatePromptPayIdFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ promptPayId: z.string().min(9) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await updatePromptPayId(supabase, data.promptPayId);
    return { ok: true };
  });
