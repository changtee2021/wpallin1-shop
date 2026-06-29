import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { fetchMyOrders, reorderFromOrder } from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { OrderSummaryDto } from "@/types/api/orders";
import { toast } from "sonner";

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
  const { refresh } = useCart();
  const authOpts = useAuthServerFnOptions(session);
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState<string | null>(null);

  async function handleReorder(orderId: string) {
    setReordering(orderId);
    try {
      await reorderFromOrder({
        data: { orderId, sessionId: getOrCreateCartSessionId() },
        ...authOpts,
      });
      await refresh();
      toast.success("เพิ่มรายการลงตะกร้าแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setReordering(null);
    }
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchMyOrders(authOpts)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authOpts]);

  return (
    <div>
      <PageHeader
        title={t("account.orders")}
        description="ประวัติคำสั่งซื้อของคุณ"
      />
      {loading ? (
        <PageLoading variant="list" />
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
                <Button
                  size="sm"
                  variant="outline"
                  disabled={reordering === order.id}
                  onClick={() => void handleReorder(order.id)}
                >
                  {reordering === order.id ? "กำลังเพิ่ม..." : "สั่งซ้ำ"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
