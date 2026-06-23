import { z } from "zod";

export const productListSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  featured: z.boolean().optional(),
  sortBy: z.enum(["name", "retail_price", "created_at"]).optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const cartCtxSchema = z.object({
  sessionId: z.string().uuid().optional(),
});

export const addToCartSchema = cartCtxSchema.extend({
  productId: z.string().uuid(),
  qty: z.number().positive().optional(),
});

export const cartItemSchema = cartCtxSchema.extend({
  itemId: z.string().uuid(),
  qty: z.number().optional(),
});

export const checkoutSchema = z.object({
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  note: z.string().optional(),
  paymentMethod: z.enum(["bank_transfer", "wallet"]).optional(),
  affiliateCode: z.string().optional(),
});

export const adminProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  description: z.string().optional(),
  retailPrice: z.number().min(0),
  dealerPrice: z.number().min(0).optional(),
  stockQty: z.number().min(0).optional(),
  minOrderQty: z.number().int().min(1).optional(),
  imageUrl: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function getAdminClient() {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function cartContext(userId: string | null, sessionId?: string) {
  return { userId: userId ?? undefined, sessionId: sessionId ?? undefined };
}
