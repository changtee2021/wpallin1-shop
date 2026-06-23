import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { optionalSupabaseAuth } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  getProductReviewSummary,
  listProductReviews,
  submitProductReview,
} from "@/services/review.service";
import {
  addWishlistItem,
  isProductWishlisted,
  listWishlistProducts,
  listWishlistedProductIds,
  removeWishlistItem,
} from "@/services/wishlist.service";

export const fetchProductReviews = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const [reviews, summary] = await Promise.all([
      listProductReviews(supabase, data.productId),
      getProductReviewSummary(supabase, data.productId),
    ]);
    return { reviews, summary };
  });

export const submitProductReviewFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        productId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        title: z.string().optional(),
        body: z.string().min(3),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    await submitProductReview(supabase, context.userId, data);
    return { ok: true };
  });

export const fetchWishlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const supabase = await getAdminClient();
    return listWishlistProducts(supabase, context.userId);
  });

export const fetchWishlistIds = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    if (!context.userId) return [] as string[];
    const supabase = await getAdminClient();
    return listWishlistedProductIds(supabase, context.userId);
  });

export const toggleWishlistFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const active = await isProductWishlisted(
      supabase,
      context.userId,
      data.productId,
    );
    if (active) {
      await removeWishlistItem(supabase, context.userId, data.productId);
      return { wishlisted: false };
    }
    await addWishlistItem(supabase, context.userId, data.productId);
    return { wishlisted: true };
  });
