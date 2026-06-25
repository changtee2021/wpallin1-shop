import type { SupabaseClient } from "@supabase/supabase-js";

import { toAddressJson, validateShippingAddress } from "@/domain/checkout";
import { calcOrderTotals } from "@/domain/pricing";
import { recordAffiliateConversion } from "@/services/affiliate.service";
import {
  clearCart,
  getCart,
  removeCartItems,
  resolveCartForContext,
} from "@/services/cart.service";
import { getProductById } from "@/services/catalog.service";
import { incrementCouponUsage } from "@/services/coupon.service";
import { decrementStockForPaidOrder } from "@/services/inventory.service";
import {
  recordPaidOrderStats,
  resolveProductUnitPrice,
} from "@/services/tier.service";
import { debitWalletForOrder } from "@/services/wallet.service";
import type { CheckoutInput, CheckoutResult } from "@/types/api/orders";

async function getBankAccounts(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "payment.bank_accounts")
    .maybeSingle();
  const accounts = data?.value;
  if (Array.isArray(accounts))
    return accounts as CheckoutResult["bankAccounts"];
  return [];
}

async function getDefaultShippingFee(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "shipping.default_fee")
    .maybeSingle();
  const fee = data?.value;
  return typeof fee === "number" ? fee : Number(fee ?? 0);
}

export async function placeOrder(
  supabase: SupabaseClient,
  userId: string,
  input: CheckoutInput,
): Promise<CheckoutResult> {
  const addressErr = validateShippingAddress(input);
  if (addressErr) throw new Error(addressErr);

  const cartDto = await getCart(supabase, { userId });
  if (!cartDto.items.length) throw new Error("ตะกร้าว่าง");

  const cartRow = await resolveCartForContext(supabase, { userId });
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select(
      "id, product_id, configuration_id, product_name, sku, qty, unit_price, line_total",
    )
    .eq("cart_id", cartRow.id);

  const selectedItemIds = input.itemIds?.length
    ? new Set(input.itemIds)
    : null;
  const checkoutItems = (cartItems ?? []).filter((item) =>
    selectedItemIds ? selectedItemIds.has(item.id) : true,
  );
  if (!checkoutItems.length) throw new Error("ไม่มีรายการที่เลือก");
  const orderItems: Array<{
    product_id: string | null;
    product_name: string;
    sku: string | null;
    qty: number;
    unit_price: number;
    line_total: number;
  }> = [];

  for (const item of checkoutItems) {
    if (item.configuration_id) {
      orderItems.push({
        product_id: item.product_id,
        product_name: item.product_name,
        sku: item.sku,
        qty: Number(item.qty),
        unit_price: Number(item.unit_price),
        line_total: Number(item.line_total),
      });
      continue;
    }

    if (!item.product_id) continue;
    const product = await getProductById(supabase, item.product_id);
    if (!product) throw new Error(`สินค้า ${item.product_name} ไม่พร้อมขาย`);

    const unitPrice = await resolveProductUnitPrice(
      supabase,
      userId,
      item.product_id,
    );
    const lineTotal = Math.round(Number(item.qty) * unitPrice * 100) / 100;
    orderItems.push({
      product_id: item.product_id,
      product_name: product.name,
      sku: product.sku,
      qty: Number(item.qty),
      unit_price: unitPrice,
      line_total: lineTotal,
    });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.line_total, 0);
  const shippingFee = await getDefaultShippingFee(supabase);
  const fullCartDiscount = Number(cartRow.discount ?? cartDto.discount);
  const discount =
    selectedItemIds && cartDto.subtotal > 0
      ? Math.round(
          ((fullCartDiscount * subtotal) / cartDto.subtotal) * 100,
        ) / 100
      : fullCartDiscount;
  const totals = calcOrderTotals(subtotal, shippingFee, discount);
  const shippingAddress = toAddressJson(input);
  const paymentMethod = input.paymentMethod ?? "bank_transfer";

  if (paymentMethod === "wallet") {
    const { getWalletSummary } = await import("@/services/wallet.service");
    const wallet = await getWalletSummary(supabase, userId);
    if (wallet.availableBalance < totals.grandTotal) {
      throw new Error("ยอดเงินในกระเป๋าไม่พอ");
    }
  }

  if (paymentMethod === "credit") {
    const { validateCreditCheckout } =
      await import("@/services/credit.service");
    await validateCreditCheckout(supabase, userId, totals.grandTotal);
  }

  const orderMetadata: Record<string, unknown> = {};
  if (paymentMethod === "credit") {
    orderMetadata.credit_status = "requested";
  }

  const isWalletPaid = paymentMethod === "wallet";
  const isCreditPending = paymentMethod === "credit";

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      customer_name: input.recipientName.trim(),
      customer_phone: input.phone.trim(),
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping_fee: totals.shippingFee,
      tax_amount: totals.taxAmount,
      grand_total: totals.grandTotal,
      note: input.note?.trim() || null,
      metadata: orderMetadata,
      status: isWalletPaid
        ? "paid"
        : isCreditPending
          ? "pending_payment"
          : "pending_payment",
      payment_status: isWalletPaid ? "paid" : "unpaid",
    })
    .select("id, order_number, grand_total")
    .single();

  if (orderErr) throw new Error(orderErr.message);

  const { error: itemsErr } = await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));
  if (itemsErr) throw new Error(itemsErr.message);

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      user_id: userId,
      order_id: order.id,
      method: paymentMethod,
      status: isWalletPaid ? "paid" : "awaiting_verification",
      amount: totals.grandTotal,
      paid_at: isWalletPaid ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (payErr) throw new Error(payErr.message);

  if (isWalletPaid) {
    await debitWalletForOrder(supabase, userId, order.id, totals.grandTotal);
    await recordPaidOrderStats(supabase, userId, totals.grandTotal);
    await decrementStockForPaidOrder(supabase, order.id);
    const { createProductionJob } =
      await import("@/services/admin-order.service");
    await createProductionJob(supabase, order.id);
  }

  const { data: cartFull } = await supabase
    .from("carts")
    .select("coupon_code")
    .eq("id", cartRow.id)
    .maybeSingle();
  if (cartFull?.coupon_code) {
    await incrementCouponUsage(supabase, cartFull.coupon_code);
  }

  if (input.affiliateCode) {
    await recordAffiliateConversion(
      supabase,
      input.affiliateCode,
      order.id,
      totals.grandTotal,
    );
  }

  if (selectedItemIds) {
    await removeCartItems(supabase, cartRow.id, input.itemIds!);
    const remainingCount = (cartItems?.length ?? 0) - checkoutItems.length;
    if (remainingCount <= 0) {
      await supabase
        .from("carts")
        .update({ discount: 0, coupon_code: null })
        .eq("id", cartRow.id);
    }
  } else {
    await clearCart(supabase, cartRow.id);
  }

  const bankAccounts = await getBankAccounts(supabase);

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    grandTotal: Number(order.grand_total),
    paymentId: payment.id,
    bankAccounts,
  };
}

export type AssistedOrderItem = {
  productId: string | null;
  productName: string;
  sku?: string | null;
  qty: number;
  unitPrice?: number;
};

export type AssistedOrderInput = {
  staffUserId?: string;
  customerUserId: string;
  items: AssistedOrderItem[];
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  note?: string;
  internalNote?: string;
  paymentMethod: "bank_transfer" | "wallet" | "pay_later";
  discount?: number;
  quotationId?: string;
};

export async function placeOrderOnBehalf(
  supabase: SupabaseClient,
  input: AssistedOrderInput,
): Promise<CheckoutResult> {
  if (!input.items.length) throw new Error("ไม่มีรายการสินค้า");

  const orderItems: Array<{
    product_id: string | null;
    product_name: string;
    sku: string | null;
    qty: number;
    unit_price: number;
    line_total: number;
  }> = [];

  for (const item of input.items) {
    let unitPrice = item.unitPrice;
    if (unitPrice == null && item.productId) {
      unitPrice = await resolveProductUnitPrice(
        supabase,
        input.customerUserId,
        item.productId,
      );
    }
    unitPrice = unitPrice ?? 0;
    const lineTotal = Math.round(item.qty * unitPrice * 100) / 100;
    orderItems.push({
      product_id: item.productId,
      product_name: item.productName,
      sku: item.sku ?? null,
      qty: item.qty,
      unit_price: unitPrice,
      line_total: lineTotal,
    });
  }

  const subtotal = orderItems.reduce((s, i) => s + i.line_total, 0);
  const shippingFee = await getDefaultShippingFee(supabase);
  const discount = input.discount ?? 0;
  const totals = calcOrderTotals(subtotal, shippingFee, discount);
  const shippingAddress = toAddressJson(input);
  const paymentMethod =
    input.paymentMethod === "pay_later" ? "bank_transfer" : input.paymentMethod;

  if (paymentMethod === "wallet") {
    const { getWalletSummary } = await import("@/services/wallet.service");
    const wallet = await getWalletSummary(supabase, input.customerUserId);
    if (wallet.availableBalance < totals.grandTotal) {
      throw new Error("ยอดเงินในกระเป๋าลูกค้าไม่พอ");
    }
  }

  const metadata: Record<string, unknown> = {
    placement_type: "assisted",
  };
  if (input.staffUserId) metadata.placed_by_user_id = input.staffUserId;

  const isPaid = paymentMethod === "wallet";
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      user_id: input.customerUserId,
      quotation_id: input.quotationId ?? null,
      customer_name: input.recipientName.trim(),
      customer_phone: input.phone.trim(),
      shipping_address: shippingAddress,
      billing_address: shippingAddress,
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping_fee: totals.shippingFee,
      tax_amount: totals.taxAmount,
      grand_total: totals.grandTotal,
      note: input.note?.trim() || null,
      internal_note: input.internalNote?.trim() || null,
      metadata,
      status: isPaid ? "paid" : "pending_payment",
      payment_status: isPaid ? "paid" : "unpaid",
    })
    .select("id, order_number, grand_total")
    .single();

  if (orderErr) throw new Error(orderErr.message);

  await supabase
    .from("order_items")
    .insert(orderItems.map((item) => ({ ...item, order_id: order.id })));

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      user_id: input.customerUserId,
      order_id: order.id,
      method: paymentMethod,
      status: isPaid ? "paid" : "awaiting_verification",
      amount: totals.grandTotal,
      paid_at: isPaid ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (payErr) throw new Error(payErr.message);

  if (isPaid) {
    await debitWalletForOrder(
      supabase,
      input.customerUserId,
      order.id,
      totals.grandTotal,
    );
    await recordPaidOrderStats(
      supabase,
      input.customerUserId,
      totals.grandTotal,
    );
    await decrementStockForPaidOrder(supabase, order.id);
    const { createProductionJob } =
      await import("@/services/admin-order.service");
    await createProductionJob(supabase, order.id);
  }

  const { notifyUserEvent } = await import("@/services/notification.service");
  await notifyUserEvent(
    supabase,
    input.customerUserId,
    "assisted_order_created",
    {
      orderId: order.id,
      orderNumber: order.order_number,
    },
  );

  const bankAccounts = await getBankAccounts(supabase);

  return {
    orderId: order.id,
    orderNumber: order.order_number,
    grandTotal: Number(order.grand_total),
    paymentId: payment.id,
    bankAccounts,
  };
}
