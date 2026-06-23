import type { SupabaseClient } from "@supabase/supabase-js";

import type { OrderDetailDto } from "@/types/api/orders";

export async function trackOrderByNumberAndEmail(
  supabase: SupabaseClient,
  orderNumber: string,
  email: string,
): Promise<OrderDetailDto | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedOrder = orderNumber.trim().toUpperCase();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("order_number", normalizedOrder)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!order) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", order.user_id)
    .maybeSingle();

  if ((profile?.email ?? "").toLowerCase() !== normalizedEmail) return null;

  const { getOrderDetail } = await import("@/services/order.service");
  return getOrderDetail(supabase, order.user_id, order.id);
}
