import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OrderPad } from "@/components/order/order-pad";
import { PageHeader } from "@/components/layout/page-header";
import { StorePage } from "@/components/layout/store-page";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyOrders } from "@/lib/api.functions";
import { orderLinesFromSearch, orderSearchSchema } from "@/lib/order-share";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";
import type { OrderSummaryDto } from "@/types/api/orders";

const RECENT_ORDER_LIMIT = 5;

export const Route = createFileRoute("/_store/order")({
  validateSearch: (search) => orderSearchSchema.parse(search),
  component: OrderPage,
});

function OrderPage() {
  const { t } = useT();
  const search = Route.useSearch();
  const { session, loading: authLoading } = useAuth();
  const initialLines = orderLinesFromSearch(search);
  const [recentOrders, setRecentOrders] = useState<OrderSummaryDto[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !session?.access_token) {
      setRecentOrders([]);
      return;
    }
    let cancelled = false;
    setOrdersLoading(true);
    void fetchMyOrders(authServerFnOptions(session))
      .then((data) => {
        if (!cancelled) setRecentOrders(data.slice(0, RECENT_ORDER_LIMIT));
      })
      .catch(() => {
        if (!cancelled) setRecentOrders([]);
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, session?.access_token]);

  return (
    <StorePage width="medium" className="space-y-6 sm:space-y-8">
      <PageHeader
        title={t("order.title")}
        description={t("order.description")}
        badge="B2B"
        className="mb-0"
      />
      <OrderPad
        initialLines={initialLines}
        recentOrders={recentOrders}
        ordersLoading={ordersLoading}
      />
    </StorePage>
  );
}
