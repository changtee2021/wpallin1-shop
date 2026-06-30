import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { OrderPad } from "@/components/order/order-pad";
import { PageHeader } from "@/components/layout/page-header";
import { useAuth } from "@/hooks/use-auth";
import { fetchDealerDashboard } from "@/lib/api.functions";
import { orderLinesFromSearch, orderSearchSchema } from "@/lib/order-share";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_store/order")({
  validateSearch: (search) => orderSearchSchema.parse(search),
  component: OrderPage,
});

function OrderPage() {
  const { t } = useT();
  const search = Route.useSearch();
  const { session, loading: authLoading } = useAuth();
  const initialLines = orderLinesFromSearch(search);
  const [recentOrder, setRecentOrder] = useState<{
    id: string;
    orderNumber: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;
    let cancelled = false;
    void fetchDealerDashboard(authServerFnOptions(session))
      .then((data) => {
        if (!cancelled && data.recentOrder) {
          setRecentOrder({
            id: data.recentOrder.id,
            orderNumber: data.recentOrder.orderNumber,
          });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [authLoading, session?.access_token]);

  return (
    <div className="container max-w-3xl py-6 sm:py-8">
      <PageHeader
        title={t("order.title")}
        description={t("order.description")}
        badge="B2B"
      />
      <OrderPad initialLines={initialLines} recentOrder={recentOrder} />
    </div>
  );
}
