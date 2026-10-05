import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ListEmptyState,
  ListErrorState,
} from "@/components/ui/list-query-state";
import { Price } from "@/components/ui/price";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { fetchMyOrders, reorderFromOrder } from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate } from "@/lib/format";
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
  const { session, loading: authLoading } = useAuth();
  const { refresh } = useCart();
  const authOpts = useAuthServerFnOptions(session);
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reordering, setReordering] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

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
    if (authLoading || !session?.access_token) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchMyOrders(authOpts)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, authOpts, session?.access_token, reloadKey]);

  return (
    <div>
      <PageHeader
        title={t("account.orders")}
        description="ประวัติคำสั่งซื้อของคุณ"
      />
      {authLoading || loading || !session?.access_token ? (
        <PageLoading variant="list" />
      ) : error ? (
        <ListErrorState
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : orders.length === 0 ? (
        <ListEmptyState
          message="ยังไม่มีคำสั่งซื้อ"
          action={
            <Button asChild>
              <Link to="/products">เริ่มช้อปเลย</Link>
            </Button>
          }
        />
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
                  <Price amount={order.grandTotal} />
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
