import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminReportsDto = {
  periodDays: number;
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
};

export async function getAdminReports(
  supabase: SupabaseClient,
  periodDays = 30,
): Promise<AdminReportsDto> {
  const since = new Date();
  since.setDate(since.getDate() - periodDays);

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, status, grand_total, payment_status")
    .gte("created_at", since.toISOString());

  if (error) throw new Error(error.message);

  const paidOrders = (orders ?? []).filter((o) =>
    ["paid", "awaiting_verification"].includes(String(o.payment_status)),
  );

  const totalRevenue = paidOrders.reduce(
    (sum, o) => sum + Number(o.grand_total),
    0,
  );
  const orderCount = paidOrders.length;
  const avgOrderValue = orderCount ? totalRevenue / orderCount : 0;

  const statusMap = new Map<string, number>();
  for (const o of orders ?? []) {
    const key = String(o.status);
    statusMap.set(key, (statusMap.get(key) ?? 0) + 1);
  }

  const orderIds = paidOrders.map((o) => o.id);
  let topProducts: AdminReportsDto["topProducts"] = [];

  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, qty, line_total")
      .in("order_id", orderIds);

    const productMap = new Map<string, { qty: number; revenue: number }>();
    for (const item of items ?? []) {
      const name = String(item.product_name);
      const prev = productMap.get(name) ?? { qty: 0, revenue: 0 };
      productMap.set(name, {
        qty: prev.qty + Number(item.qty),
        revenue: prev.revenue + Number(item.line_total),
      });
    }

    topProducts = [...productMap.entries()]
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  return {
    periodDays,
    totalRevenue,
    orderCount,
    avgOrderValue,
    topProducts,
    ordersByStatus: [...statusMap.entries()].map(([status, count]) => ({
      status,
      count,
    })),
  };
}
