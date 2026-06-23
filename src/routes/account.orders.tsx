import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyOrders } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { OrderSummaryDto } from "@/types/api/orders";

export const Route = createFileRoute("/account/orders")({
  component: AccountOrdersPage,
});

const statusLabels: Record<string, string> = {
  pending_payment: "รอชำระ",
  awaiting_payment_verification: "รอตรวจสลิป",
  paid: "ชำระแล้ว",
  confirmed: "ยืนยันแล้ว",
  shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

function AccountOrdersPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchMyOrders(authServerFnOptions(session))
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div>
      <PageHeader
        title={t("account.orders")}
        description="ประวัติคำสั่งซื้อของคุณ"
      />
      {loading ? (
        <p className="text-muted-foreground">{t("common.loading")}</p>
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            ยังไม่มีคำสั่งซื้อ —{" "}
            <Link to="/shop" className="text-primary underline">
              เริ่มช้อปเลย
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <Link
                    to="/account/orders/$orderId"
                    params={{ orderId: order.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {statusLabels[order.status] ?? order.status}
                </Badge>
                <p className="font-bold text-accent">
                  {formatPrice(order.grandTotal)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
