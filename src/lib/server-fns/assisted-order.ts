import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireStaff } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { placeOrderOnBehalf } from "@/services/checkout.service";
import { listAddresses } from "@/services/profile.service";

export const placeAssistedOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        customerUserId: z.string().uuid(),
        items: z.array(
          z.object({
            productId: z.string().uuid().nullable(),
            productName: z.string(),
            sku: z.string().nullable().optional(),
            qty: z.number().positive(),
            unitPrice: z.number().optional(),
          }),
        ),
        recipientName: z.string().min(1),
        phone: z.string().min(1),
        line1: z.string().min(1),
        line2: z.string().optional(),
        district: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        note: z.string().optional(),
        internalNote: z.string().optional(),
        paymentMethod: z.enum(["bank_transfer", "wallet", "pay_later"]),
        discount: z.number().min(0).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    return placeOrderOnBehalf(supabase, {
      ...data,
      staffUserId: context.userId,
    });
  });

export const fetchCustomerAddressesForStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ customerUserId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireStaff(context.userId);
    const supabase = await getAdminClient();
    return listAddresses(supabase, data.customerUserId);
  });
