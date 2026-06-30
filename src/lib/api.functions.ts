import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { optionalSupabaseAuth, requireAdmin } from "@/lib/server-auth";
import {
  addToCartSchema,
  adminProductSchema,
  cartContext,
  cartCtxSchema,
  cartItemSchema,
  updateCartItemOptionsSchema,
  checkoutSchema,
  getAdminClient,
  productListSchema,
} from "@/lib/server-fns/_shared";
import { getHealth } from "@/services/health.service";
import {
  listCategories,
  listPublicProducts,
  getProductBySlug,
  getShopFilterFacets,
} from "@/services/catalog.service";
import { smartSearchProducts } from "@/services/smart-search.service";
import {
  enforceRateLimit,
  getClientIp,
  RateLimitError,
  RateLimitUnavailableError,
} from "@/lib/rate-limit";
import { listProductOptionGroups } from "@/services/product-options.service";
import { getProductReviewSummary } from "@/services/review.service";
import {
  getCart,
  addToCart,
  updateCartItemQty,
  updateCartItemOptions,
  removeCartItem,
  mergeGuestCartToUser,
  resolveCartForContext,
} from "@/services/cart.service";
import { placeOrder } from "@/services/checkout.service";
import { listUserOrders, getOrderDetail } from "@/services/order.service";
import {
  listAdminOrders,
  getAdminOrderDetail,
  verifyPaymentSlip,
  rejectPaymentSlip,
  updateOrderStatus,
} from "@/services/admin-order.service";
import {
  getSettings,
  updateSettings,
  getAdminDashboardStats,
} from "@/services/settings.service";
import { submitFeedbackReport as submitFeedbackReportService } from "@/services/contact.service";
import {
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
} from "@/services/admin-catalog.service";
import {
  getSessionProfile,
  getAccountProfile,
  updateAccountProfile,
  submitBankAccountRequest,
  listAddresses,
  saveAddress,
  deleteAddress,
  listTaxInvoiceProfiles,
  saveTaxInvoiceProfile,
  deleteTaxInvoiceProfile,
  ensureWalletAccount,
} from "@/services/profile.service";
import {
  listConfiguratorCatalog,
  calculateConfiguratorPrice as calcConfigPrice,
  saveConfiguration,
  addConfigurationToCart,
} from "@/services/configurator.service";
import { applyCouponToCart } from "@/services/coupon.service";
import {
  getWalletSummary,
  listWalletTransactions,
  createTopupRequest,
  listUserTopupRequests,
  listAdminTopupRequests,
  approveTopupRequest,
  rejectTopupRequest,
  adminAdjustWallet,
} from "@/services/wallet.service";
import {
  listMemberTiers,
  updateMemberTier,
  getTierProgress,
  syncTierProductPrices,
  listAdminMembers,
  adminSetMemberTier,
} from "@/services/tier.service";
import {
  submitDealerApplication as submitDealerApplicationFn,
  listDealerApplications,
  approveDealerApplication,
  rejectDealerApplication,
  getMyDealerApplication,
} from "@/services/dealer.service";
import {
  listDealerProducts,
  getDealerDashboard,
} from "@/services/dealer-catalog.service";

export const fetchHealth = createServerFn({ method: "GET" }).handler(async () =>
  getHealth(),
);

export const fetchPublicProducts = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => productListSchema.parse(input ?? {}))
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listPublicProducts(supabase, data);
  });

export const fetchCategories = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = await getAdminClient();
    return listCategories(supabase);
  },
);

export const fetchShopFilterFacets = createServerFn({ method: "GET" }).handler(
  async () => {
    const supabase = await getAdminClient();
    return getShopFilterFacets(supabase);
  },
);

const smartSearchInputSchema = productListSchema.extend({
  query: z.string().min(1).max(500),
});

export const fetchSmartSearchProducts = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => smartSearchInputSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await enforceRateLimit("smart-search", data.query.slice(0, 64), {
      requests: 10,
      window: "1 m",
    });
    const supabase = await getAdminClient();
    const { resolveChatAiAccess } = await import("@/lib/chat-ai-eligibility");
    const aiAccess = await resolveChatAiAccess(supabase, context.userId);
    const { query, ...listOptions } = data;
    return smartSearchProducts(supabase, query, {
      ...listOptions,
      allowLlm: aiAccess.canUseLlm,
    });
  });

export const fetchHeroBanners = createServerFn({ method: "GET" }).handler(
  async () => {
    const { listHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    return listHeroBanners(supabase, "home", { activeOnly: true });
  },
);

export const fetchShopHeroBanners = createServerFn({ method: "GET" }).handler(
  async () => {
    const { listHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    return listHeroBanners(supabase, "shop", { activeOnly: true });
  },
);

export const fetchAdminHeroBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { listHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    return listHeroBanners(supabase, "home");
  });

export const fetchAdminShopHeroBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { listHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    return listHeroBanners(supabase, "shop");
  });

export const saveAdminHeroBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        banners: z.array(
          z.object({
            id: z.string().min(1),
            imageUrl: z.string().url(),
            linkUrl: z.string().nullable().optional(),
            alt: z.string().nullable().optional(),
            sortOrder: z.number().int(),
            isActive: z.boolean(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { saveHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    await saveHeroBanners(supabase, "home", data.banners);
    return { ok: true };
  });

export const saveAdminShopHeroBanners = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        banners: z.array(
          z.object({
            id: z.string().min(1),
            imageUrl: z.string().url(),
            linkUrl: z.string().nullable().optional(),
            alt: z.string().nullable().optional(),
            sortOrder: z.number().int(),
            isActive: z.boolean(),
          }),
        ),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { saveHeroBanners } = await import("@/services/hero-banner.service");
    const supabase = await getAdminClient();
    await saveHeroBanners(supabase, "shop", data.banners);
    return { ok: true };
  });

export const fetchProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getProductBySlug(supabase, data.slug);
  });

export const fetchProductReviewSummary = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getProductReviewSummary(supabase, data.productId);
  });

export const fetchSessionProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email =
      typeof context.claims.email === "string"
        ? context.claims.email
        : ((context.claims.email as string | undefined) ?? null);
    return getSessionProfile(context.supabase, context.userId, email);
  });

export const fetchAccountProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email =
      typeof context.claims.email === "string"
        ? context.claims.email
        : ((context.claims.email as string | undefined) ?? null);
    await ensureWalletAccount(context.supabase, context.userId);
    return getAccountProfile(context.supabase, context.userId, email);
  });

export const updateAccountProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        fullName: z.string().min(1),
        phone: z.string().optional(),
        locale: z.enum(["th", "en"]).optional(),
        customerType: z.enum(["individual", "juristic"]).optional(),
        nationalId: z.string().optional(),
        companyTaxId: z.string().optional(),
        companyBranch: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await updateAccountProfile(context.supabase, context.userId, data);
    return { ok: true };
  });

export const submitBankAccountFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        bankName: z.string().min(1),
        accountNumber: z.string().min(1),
        accountName: z.string().min(1),
        branch: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await submitBankAccountRequest(context.supabase, context.userId, data);
    return { ok: true };
  });

export const fetchAccountAddresses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listAddresses(context.supabase, context.userId),
  );

export const saveAccountAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        label: z.string().optional(),
        recipientName: z.string().min(1),
        phone: z.string().min(1),
        line1: z.string().min(1),
        line2: z.string().optional(),
        district: z.string().optional(),
        province: z.string().optional(),
        postalCode: z.string().optional(),
        country: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    saveAddress(context.supabase, context.userId, data),
  );

export const deleteAccountAddress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await deleteAddress(context.supabase, context.userId, data.id);
    return { ok: true };
  });

export const fetchTaxInvoiceProfiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listTaxInvoiceProfiles(context.supabase, context.userId),
  );

export const saveTaxInvoiceProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid().optional(),
        companyName: z.string().min(1),
        taxId: z.string().min(1),
        branchCode: z.string().optional(),
        address: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    saveTaxInvoiceProfile(context.supabase, context.userId, {
      ...data,
      email: data.email || undefined,
    }),
  );

export const deleteTaxInvoiceProfileFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await deleteTaxInvoiceProfile(context.supabase, context.userId, data.id);
    return { ok: true };
  });

export const fetchCart = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => cartCtxSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return getCart(supabase, cartContext(context.userId, data.sessionId));
  });

export const addProductToCart = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => addToCartSchema.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return addToCart(
      supabase,
      cartContext(context.userId, data.sessionId),
      data.productId,
      data.qty ?? 1,
      data.selectedOptions ?? {},
    );
  });

export const updateCartItem = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => cartItemSchema.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return updateCartItemQty(
      supabase,
      cartContext(context.userId, data.sessionId),
      data.itemId,
      data.qty ?? 0,
    );
  });

export const saveCartItemOptions = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => updateCartItemOptionsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return updateCartItemOptions(
      supabase,
      cartContext(context.userId, data.sessionId),
      data.itemId,
      data.selectedOptions,
    );
  });

export const fetchProductOptionGroups = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return listProductOptionGroups(supabase, data.productId);
  });

export const removeFromCart = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    cartCtxSchema.extend({ itemId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return removeCartItem(
      supabase,
      cartContext(context.userId, data.sessionId),
      data.itemId,
    );
  });

export const mergeCartOnLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ sessionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    await mergeGuestCartToUser(supabase, data.sessionId, context.userId);
    return getCart(supabase, { userId: context.userId });
  });

export const checkoutOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data, context }) => {
    return placeOrder(context.supabase, context.userId, data);
  });

export const fetchMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listUserOrders(context.supabase, context.userId),
  );

export const fetchOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) =>
    getOrderDetail(context.supabase, context.userId, data.orderId),
  );

export const fetchAdminProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminProducts(supabase);
  });

export const fetchAdminProduct = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getAdminProduct(supabase, data.id);
  });

export const saveAdminProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ id: z.string().uuid().optional() })
      .merge(adminProductSchema)
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { id, ...payload } = data;
    if (id) {
      await updateProduct(supabase, id, payload);
      return { id };
    }
    const newId = await createProduct(supabase, payload);
    return { id: newId };
  });

export const fetchAdminOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminOrders(supabase, data);
  });

export const fetchAdminOrderDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getAdminOrderDetail(supabase, data.orderId);
  });

export const adminVerifySlip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        paymentId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await verifyPaymentSlip(
      supabase,
      context.userId,
      data.orderId,
      data.paymentId,
    );
    return { ok: true };
  });

export const adminRejectSlip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        paymentId: z.string().uuid(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await rejectPaymentSlip(supabase, data.orderId, data.paymentId, data.note);
    return { ok: true };
  });

export const adminUpdateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        orderId: z.string().uuid(),
        status: z.string().min(1),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await updateOrderStatus(
      supabase,
      data.orderId,
      data.status as import("@/types/api/orders").OrderStatus,
      data.note,
    );
    return { ok: true };
  });

export const fetchAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getAdminDashboardStats(supabase);
  });

export const fetchAdminSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getSettings(supabase);
  });

export const saveAdminSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        bankAccounts: z.array(
          z.object({
            bank: z.string(),
            account_no: z.string(),
            account_name: z.string(),
          }),
        ),
        shippingFee: z.number().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await updateSettings(supabase, data);
    return { ok: true };
  });

export const submitContactForm = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        subject: z.string().min(1),
        message: z.string().min(1),
        errorCode: z.string().optional(),
        sourceUrl: z.string().optional(),
        category: z.enum(["contact", "error", "404", "403", "500"]).optional(),
        /** Honeypot — must stay empty */
        companyWebsite: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (data.companyWebsite?.trim()) {
      throw new Error("Invalid submission");
    }

    const request = getRequest();
    const rateKey = context.userId ?? getClientIp(request);
    try {
      await enforceRateLimit("contact-form", rateKey, {
        requests: 5,
        window: "10 m",
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        throw new Error("ส่งบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่");
      }
      if (err instanceof RateLimitUnavailableError) {
        throw new Error("ระบบไม่พร้อมรับคำขอชั่วคราว กรุณาลองใหม่ภายหลัง");
      }
      throw err;
    }

    const { companyWebsite: _honeypot, ...payload } = data;
    const supabase = await getAdminClient();
    return submitFeedbackReportService(supabase, {
      ...payload,
      userId: context.userId,
    });
  });

export { submitContactForm as submitFeedbackReport };

export const fetchConfiguratorCatalog = createServerFn({
  method: "GET",
}).handler(async () => {
  const supabase = await getAdminClient();
  return listConfiguratorCatalog(supabase);
});

export const calculateConfiguratorPrice = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productType: z.enum(["pleated", "eyelet", "wave"]).nullable(),
        fabricId: z.string().uuid().nullable(),
        widthCm: z.number(),
        heightCm: z.number(),
        railOptionKey: z.string().nullable(),
        installationOptionKey: z.string().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return calcConfigPrice(supabase, data);
  });

export const saveConfiguratorConfiguration = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productType: z.enum(["pleated", "eyelet", "wave"]),
        fabricId: z.string().uuid(),
        widthCm: z.number(),
        heightCm: z.number(),
        railOptionKey: z.string(),
        installationOptionKey: z.string(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return saveConfiguration(supabase, context.userId, data);
  });

export const addConfiguratorToCart = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    cartCtxSchema.extend({ configurationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return addConfigurationToCart(
      supabase,
      cartContext(context.userId, data.sessionId),
      data.configurationId,
    );
  });

const customLimitsSchema = z.object({
  minWidthCm: z.number().int().min(1).max(10000),
  maxWidthCm: z.number().int().min(1).max(10000),
  minHeightCm: z.number().int().min(1).max(10000),
  maxHeightCm: z.number().int().min(1).max(10000),
});

const adminFabricSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(200),
  collectionId: z.string().uuid().nullable().optional(),
  colorId: z.string().uuid().nullable().optional(),
  pricePerMeter: z.number().min(0),
  rollWidthCm: z.number().int().min(1).max(1000).optional(),
  swatchUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const configuratorConditionSchema = z.record(z.string(), z.string());

const configuratorAssetSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  assetType: z.enum(["preview", "swatch", "base", "overlay"]),
  name: z.string().min(1).max(200),
  publicUrl: z.string().url(),
  storagePath: z.string().nullable().optional(),
  altText: z.string().nullable().optional(),
});

const configuratorPreviewRuleSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  priority: z.number().int().min(0).max(10000),
  conditions: configuratorConditionSchema,
  assetId: z.string().uuid().nullable().optional(),
  fallbackImageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

const configuratorBomRuleSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  name: z.string().min(1).max(200),
  priority: z.number().int().min(0).max(10000),
  conditions: configuratorConditionSchema,
  outputs: z.record(z.string(), z.unknown()),
  isActive: z.boolean().optional(),
});

export const fetchAdminCustomSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { getAdminCustomSettings } =
      await import("@/services/admin-custom.service");
    return getAdminCustomSettings(supabase, data.productId);
  });

export const fetchAdminCustomProjects = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { listAdminCustomProjects } =
      await import("@/services/admin-custom.service");
    return listAdminCustomProjects(supabase);
  });

export const createAdminCustomProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1),
        slug: z.string().min(1),
        categoryId: z.string().uuid().nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { createAdminCustomProject: createProject } =
      await import("@/services/admin-custom.service");
    const id = await createProject(supabase, data);
    return { id };
  });

export const saveAdminCustomProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        name: z.string().min(1),
        slug: z.string().min(1),
        categoryId: z.string().uuid().nullable().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminCustomProduct: saveProduct } =
      await import("@/services/admin-custom.service");
    await saveProduct(supabase, data.productId, data);
    return { ok: true };
  });

export const saveAdminCustomOptions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        optionGroups: z.array(productOptionGroupSchema),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminCustomOptions: saveOptions } =
      await import("@/services/admin-custom.service");
    await saveOptions(supabase, data.productId, data.optionGroups);
    return { ok: true };
  });

export const saveAdminCustomLimits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        formulaId: z.string().uuid().nullable(),
        limits: customLimitsSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminCustomLimits: saveLimits } =
      await import("@/services/admin-custom.service");
    await saveLimits(supabase, data.productId, data.formulaId, data.limits);
    return { ok: true };
  });

export const fetchAdminFabrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { listAdminFabrics, listFabricCollections, listColorOptions } =
      await import("@/services/admin-custom.service");
    const [fabrics, collections, colors] = await Promise.all([
      listAdminFabrics(supabase),
      listFabricCollections(supabase),
      listColorOptions(supabase),
    ]);
    return { fabrics, collections, colors };
  });

export const saveAdminFabric = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminFabricSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminFabric: saveFabric } =
      await import("@/services/admin-custom.service");
    const id = await saveFabric(supabase, data);
    return { id };
  });

export const toggleAdminFabricActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { toggleAdminFabricActive: toggleFabric } =
      await import("@/services/admin-custom.service");
    await toggleFabric(supabase, data.id, data.isActive);
    return { ok: true };
  });

export const fetchAdminConfiguratorRules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const {
      listAdminConfiguratorAssets,
      listAdminConfiguratorPreviewRules,
      listAdminConfiguratorBomRules,
    } = await import("@/services/admin-custom.service");
    const [assets, previewRules, bomRules] = await Promise.all([
      listAdminConfiguratorAssets(supabase, data.productId),
      listAdminConfiguratorPreviewRules(supabase, data.productId),
      listAdminConfiguratorBomRules(supabase, data.productId),
    ]);
    return { assets, previewRules, bomRules };
  });

export const saveAdminConfiguratorAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => configuratorAssetSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminConfiguratorAsset: saveAsset } =
      await import("@/services/admin-custom.service");
    const id = await saveAsset(supabase, data);
    return { id };
  });

export const saveAdminConfiguratorPreviewRule = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    configuratorPreviewRuleSchema.parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminConfiguratorPreviewRule: saveRule } =
      await import("@/services/admin-custom.service");
    const id = await saveRule(supabase, data);
    return { id };
  });

export const toggleAdminConfiguratorPreviewRule = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { toggleAdminConfiguratorPreviewRule: toggleRule } =
      await import("@/services/admin-custom.service");
    await toggleRule(supabase, data.id, data.isActive);
    return { ok: true };
  });

export const saveAdminConfiguratorBomRule = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => configuratorBomRuleSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { saveAdminConfiguratorBomRule: saveRule } =
      await import("@/services/admin-custom.service");
    const id = await saveRule(supabase, data);
    return { id };
  });

export const toggleAdminConfiguratorBomRule = createServerFn({
  method: "POST",
})
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid(), isActive: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const { toggleAdminConfiguratorBomRule: toggleRule } =
      await import("@/services/admin-custom.service");
    await toggleRule(supabase, data.id, data.isActive);
    return { ok: true };
  });

export const applyCartCoupon = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    cartCtxSchema.extend({ code: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const ctx = cartContext(context.userId, data.sessionId);
    const cart = await getCart(supabase, ctx);
    const cartRow = await resolveCartForContext(supabase, ctx);
    return applyCouponToCart(supabase, cartRow.id, data.code, cart.subtotal);
  });

export const fetchWalletSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    getWalletSummary(context.supabase, context.userId),
  );

export const fetchWalletTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listWalletTransactions(context.supabase, context.userId),
  );

export const submitDealerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        companyName: z.string().min(1),
        taxId: z.string().optional(),
        contactName: z.string().min(1),
        contactPhone: z.string().min(1),
        contactEmail: z.string().email(),
        businessType: z.string().optional(),
        address: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const result = await submitDealerApplicationFn(
      context.supabase,
      context.userId,
      data,
    );
    return { ok: true, id: result.id };
  });

export const fetchMyDealerApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    getMyDealerApplication(context.supabase, context.userId),
  );

export const fetchDealerApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ status: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listDealerApplications(supabase, data.status);
  });

export const approveDealerApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ applicationId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await approveDealerApplication(
      supabase,
      data.applicationId,
      context.userId,
    );
    return { ok: true };
  });

export const rejectDealerApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        applicationId: z.string().uuid(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await rejectDealerApplication(
      supabase,
      data.applicationId,
      context.userId,
      data.note,
    );
    return { ok: true };
  });

export const fetchDealerCatalog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return listDealerProducts(supabase, context.userId);
  });

export const fetchDealerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return getDealerDashboard(supabase, context.userId);
  });

export const fetchTierProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    getTierProgress(context.supabase, context.userId),
  );

export const submitWalletTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ amount: z.number().min(100) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const requestId = await createTopupRequest(
      context.supabase,
      context.userId,
      data.amount,
    );
    return { requestId };
  });

export const fetchUserTopupRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listUserTopupRequests(context.supabase, context.userId),
  );

export const fetchAdminMemberTiers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listMemberTiers(supabase);
  });

export const saveAdminMemberTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        tier: z.string().min(1),
        displayName: z.string().min(1),
        minLifetimeSpend: z.number().min(0),
        discountPct: z.number().min(0).max(100),
        sortOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await updateMemberTier(supabase, data.tier, data);
    return { ok: true };
  });

export const syncAdminTierPrices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ tier: z.string().min(1) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    const count = await syncTierProductPrices(supabase, data.tier);
    return { count };
  });

export const fetchAdminMembers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminMembers(supabase);
  });

export const setAdminMemberTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ userId: z.string().uuid(), tier: z.string().min(1) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await adminSetMemberTier(supabase, data.userId, data.tier);
    return { ok: true };
  });

export const fetchAdminTopupQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ status: z.string().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminTopupRequests(supabase, data.status);
  });

export const approveAdminTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ requestId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await approveTopupRequest(supabase, context.userId, data.requestId);
    return { ok: true };
  });

export const rejectAdminTopup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        requestId: z.string().uuid(),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await rejectTopupRequest(
      supabase,
      context.userId,
      data.requestId,
      data.note,
    );
    return { ok: true };
  });

export const adjustAdminWallet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        userId: z.string().uuid(),
        amount: z.number().positive(),
        direction: z.enum(["credit", "debit"]),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await adminAdjustWallet(
      supabase,
      context.userId,
      data.userId,
      data.amount,
      data.direction,
      data.note,
    );
    return { ok: true };
  });

export {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markNotificationReadFn,
  markAllNotificationsReadFn,
} from "@/lib/server-fns/notifications";

export {
  requestQuotationFromCart,
  fetchUserQuotations,
  fetchAdminQuotations,
  fetchQuotationDetail,
  fetchPublicQuotation,
  sendQuotation,
  saveQuotationTerms,
  respondQuotation,
  respondPublicQuotation,
  convertQuotation,
} from "@/lib/server-fns/quotations";

export {
  placeAssistedOrder,
  fetchCustomerAddressesForStaff,
} from "@/lib/server-fns/assisted-order";

export {
  fetchAdminCategories,
  saveAdminCategory,
} from "@/lib/server-fns/categories";

export { fetchMemberProductPrices } from "@/lib/server-fns/pricing";

export {
  fetchAdminSupportTickets,
  fetchAdminSupportTicketDetail,
  updateAdminSupportTicket,
  fetchAdminGuestFeedback,
} from "@/lib/server-fns/support";

export {
  fetchChatSession,
  fetchChatAiAccess,
  sendChatMessage,
  requestChatHandoff,
  fetchAdminChatConversations,
  fetchAdminChatDetail,
  assignAdminChat,
  sendStaffChatMessage,
  closeAdminChat,
  fetchChatSettingsAdmin,
  saveChatSettingsAdmin,
  searchChatProducts,
  fetchChatUserQuotations,
  sendStaffChatProducts,
  sendStaffChatQuotation,
} from "@/lib/server-fns/chat";

export {
  fetchAffiliateDashboard,
  registerAffiliate,
  createAffiliateLinkFn,
  requestAffiliatePayoutFn,
} from "@/lib/server-fns/affiliate";

export {
  fetchAdminCoupons,
  saveAdminCouponFn,
  fetchAdminPromotions,
  saveAdminPromotionFn,
  fetchPromptPayId,
  updatePromptPayIdFn,
} from "@/lib/server-fns/promotions";

export {
  fetchProductReviews,
  submitProductReviewFn,
  fetchWishlist,
  fetchWishlistIds,
  toggleWishlistFn,
} from "@/lib/server-fns/reviews-wishlist";

export {
  fetchLowStockProducts,
  updateProductStockFn,
  fetchAdminReports,
} from "@/lib/server-fns/inventory-reports";

export {
  fetchCreditEnabled,
  fetchCreditSummary,
  fetchCreditAccount,
  validateCreditCheckoutFn,
  fetchAdminCreditAccounts,
  fetchAdminPendingCreditOrders,
  fetchAdminCreditInvoices,
  adminUpsertCreditAccount,
  adminApproveCreditOrder,
  adminRejectCreditOrder,
  adminRecordCreditPayment,
} from "@/lib/server-fns/credit";

export {
  fetchCustomerDocuments,
  fetchAdminCustomerDocuments,
  saveCustomerDocumentFn,
  adminReviewCustomerDocument,
} from "@/lib/server-fns/documents";

export {
  quickOrderBySku,
  reorderFromOrder,
  fetchPriceList,
  lookupProductBySku,
  resolveProductsBySkus,
  fetchFrequentOrderSkus,
  searchOrderProducts,
} from "@/lib/server-fns/wholesale";

export {
  createShareableOrderLink,
  fetchPublicOrderLink,
  acceptPublicOrderLink,
} from "@/lib/server-fns/order-links";

export { fetchAdminMemberProfile } from "@/lib/server-fns/member-admin";

export {
  fetchPublicMarketingCatalogs,
  fetchPublicMarketingCatalog,
  fetchPublicMarketingCatalogBySlug,
  fetchMarketingCatalogAccess,
  fetchMarketingCatalogRef,
  fetchRelatedMarketingCatalogs,
  fetchCatalogCategoryProducts,
  fetchProductMarketingCatalogs,
  recordCatalogView,
  fetchAdminCatalogViewStats,
  fetchAdminMarketingCatalogCategories,
  fetchAdminMarketingCatalogs,
  saveAdminMarketingCatalogCategory,
  deleteAdminMarketingCatalogCategory,
  saveAdminMarketingCatalog,
  deleteAdminMarketingCatalog,
} from "@/lib/server-fns/marketing-catalogs";

export {
  fetchPublicInspirationRooms,
  fetchPublicInspirationRoomBySlug,
  fetchAdminInspirationRooms,
  fetchAdminInspirationRoomById,
  saveAdminInspirationRoom,
  deleteAdminInspirationRoom,
  duplicateAdminInspirationRoom,
  reorderAdminInspirationRooms,
  incrementInspirationViewFn,
  toggleInspirationRoomLikeFn,
} from "@/lib/server-fns/inspiration";

export {
  fetchPublicInspirationMaterials,
  fetchAdminInspirationMaterials,
  fetchAdminInspirationMaterialById,
  saveAdminInspirationMaterial,
  deleteAdminInspirationMaterial,
  seedAdminInspirationMaterials,
} from "@/lib/server-fns/inspiration-materials";

export { fetchAdminMediaAssets } from "@/lib/server-fns/admin-media";

export {
  createRoomAdvisorSessionFn,
  analyzeRoomAdvisorSessionFn,
  fetchRoomAdvisorSessionFn,
  fetchRoomAdvisorByTokenFn,
  enableRoomAdvisorShareFn,
  submitRoomAdvisorResponseFn,
  updateRoomAdvisorMetaFn,
  listMyRoomAdvisorSessionsFn,
  listAdminRoomAdvisorSessionsFn,
} from "@/lib/server-fns/room-advisor";

export { searchAdminQuickNavFn } from "@/lib/server-fns/admin-nav";

export {
  fetchUserTaxInvoiceOverview,
  fetchOrderTaxInvoice,
  fetchTaxInvoiceDownloadUrl,
  fetchAdminOrderTaxInvoice,
} from "@/lib/server-fns/tax-invoices";
