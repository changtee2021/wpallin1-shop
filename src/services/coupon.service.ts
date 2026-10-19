import type { SupabaseClient } from "@supabase/supabase-js";

import { calcOrderTotals } from "@/domain/pricing";

export type CouponResult = {
  code: string;
  discount: number;
  message: string;
};

export async function validateCoupon(
  supabase: SupabaseClient,
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  const normalized = code.trim().toUpperCase();
  const { data: coupon, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!coupon) throw new Error("ไม่พบคูปอง");

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    throw new Error("คูปองหมดสิทธิ์แล้ว");
  }
  if (Number(coupon.min_order_amount) > subtotal) {
    throw new Error(`ยอดขั้นต่ำ ${coupon.min_order_amount} บาท`);
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    throw new Error("คูปองยังไม่เริ่มใช้");
  }
  if (coupon.ends_at && new Date(coupon.ends_at) < now) {
    throw new Error("คูปองหมดอายุ");
  }

  let discount = 0;
  if (coupon.discount_type === "percent") {
    discount =
      Math.round(subtotal * (Number(coupon.discount_value) / 100) * 100) / 100;
  } else {
    discount = Number(coupon.discount_value);
  }
  discount = Math.min(discount, subtotal);

  return {
    code: normalized,
    discount,
    message: coupon.description ?? "ใช้คูปองสำเร็จ",
  };
}

export async function applyCouponToCart(
  supabase: SupabaseClient,
  cartId: string,
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  const result = await validateCoupon(supabase, code, subtotal);
  await supabase
    .from("carts")
    .update({
      coupon_code: result.code,
      discount: result.discount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", cartId);
  return result;
}

export async function removeCouponFromCart(
  supabase: SupabaseClient,
  cartId: string,
): Promise<void> {
  await supabase
    .from("carts")
    .update({ coupon_code: null, discount: 0 })
    .eq("id", cartId);
}

export async function incrementCouponUsage(
  supabase: SupabaseClient,
  code: string,
): Promise<void> {
  const { error } = await supabase.rpc("coupon_redeem", { p_code: code });
  if (error) {
    if (error.message.includes("coupon_exhausted")) {
      throw new Error("คูปองหมดสิทธิ์แล้ว");
    }
    throw new Error("ใช้คูปองไม่สำเร็จ");
  }
}

export async function releaseCouponUsage(
  supabase: SupabaseClient,
  code: string,
): Promise<void> {
  const { error } = await supabase.rpc("coupon_release", { p_code: code });
  if (error) throw new Error("คืนสิทธิ์คูปองไม่สำเร็จ");
}
