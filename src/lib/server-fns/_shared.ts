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
  selectedOptions: z.record(z.string(), z.string()).optional(),
});

export const productOptionChoiceSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  priceDelta: z.number().optional(),
  imageUrl: z.string().optional(),
});

export const productOptionGroupSchema = z.object({
  groupKey: z.string().min(1),
  groupLabel: z.string().min(1),
  required: z.boolean().optional(),
  choices: z.array(productOptionChoiceSchema).min(1),
});

export const cartItemSchema = cartCtxSchema.extend({
  itemId: z.string().uuid(),
  qty: z.number().optional(),
});

export const updateCartItemOptionsSchema = cartCtxSchema.extend({
  itemId: z.string().uuid(),
  selectedOptions: z.record(z.string(), z.string()),
});

export const quotationBuyerSchema = z
  .object({
    customerName: z.string().min(1),
    customerPhone: z.string().min(1),
    customerEmail: z.string().email().optional().or(z.literal("")),
    customerType: z.enum(["individual", "juristic"]).default("individual"),
    taxId: z.string().optional(),
    companyName: z.string().optional(),
    companyBranch: z.string().optional(),
    line1: z.string().min(1),
    district: z.string().optional(),
    province: z.string().optional(),
    postalCode: z.string().optional(),
    note: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.customerType === "juristic") {
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณากรอกชื่อบริษัท",
          path: ["companyName"],
        });
      }
      if (!data.taxId?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "กรุณากรอกเลขผู้เสียภาษี",
          path: ["taxId"],
        });
      }
    }
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
  paymentMethod: z.enum(["bank_transfer", "wallet", "credit"]).optional(),
  affiliateCode: z.string().optional(),
  itemIds: z.array(z.string().uuid()).optional(),
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
  optionGroups: z.array(productOptionGroupSchema).optional(),
});

export async function getAdminClient() {
  const { supabaseAdmin } =
    await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export function cartContext(userId: string | null, sessionId?: string) {
  return { userId: userId ?? undefined, sessionId: sessionId ?? undefined };
}
