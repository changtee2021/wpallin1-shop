import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { optionalSupabaseAuth } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { cartContext } from "@/lib/server-fns/_shared";
import {
  acceptOrderLinkToCart,
  createOrderLink,
  getOrderLinkByToken,
} from "@/services/order-link.service";

const orderLinkItemSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(1),
  productName: z.string().min(1),
  qty: z.number().positive(),
  unitPrice: z.number().min(0),
});

export const createShareableOrderLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z.array(orderLinkItemSchema).min(1),
        customerNote: z.string().max(500).optional(),
        expiresInDays: z.number().int().min(1).max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return createOrderLink(supabase, context.userId, data);
  });

export const fetchPublicOrderLink = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(8) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const link = await getOrderLinkByToken(supabase, data.token, true);
    if (!link) throw new Error("ไม่พบลิงก์สั่ง");
    return link;
  });

export const acceptPublicOrderLink = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(8),
        sessionId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (!context.userId && !data.sessionId) {
      throw new Error("กรุณาเข้าสู่ระบบหรือเปิดลิงก์ในเบราว์เซอร์เดิม");
    }
    const supabase = await getAdminClient();
    return acceptOrderLinkToCart(
      supabase,
      data.token,
      cartContext(context.userId, data.sessionId),
    );
  });
