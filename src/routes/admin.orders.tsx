import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminOrders } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import type { AdminOrderSummaryDto } from "@/types/api/orders";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrdersPage,
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

function AdminOrdersPage() {
  const { session } = useAuth();
  const [orders, setOrders] = useState<AdminOrderSummaryDto[]>([]);
  const [filter, setFilter] = useState<string>("awaiting_payment_verification");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminOrders({
      data: { status: filter || undefined },
      ...authServerFnOptions(session),
    })
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [session, filter]);

  return (
    <div>
      <PageHeader
        title="คำสั่งซื้อ"
        description="จัดการออเดอร์และตรวจสอบสลิป"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { value: "awaiting_payment_verification", label: "รอตรวจสลิป" },
          { value: "pending_payment", label: "รอชำระ" },
          { value: "paid", label: "ชำระแล้ว" },
          { value: "", label: "ทั้งหมด" },
        ].map((f) => (
          <Button
            key={f.value || "all"}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <PageLoading variant="table" />
      ) : orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            ไม่มีคำสั่งซื้อ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: order.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName ?? "-"} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {statusLabels[order.status] ?? order.status}
                </Badge>
                <p className="font-bold">{formatPrice(order.grandTotal)}</p>
                <Button asChild size="sm" variant="outline">
                  <Link
                    to="/admin/orders/$orderId"
                    params={{ orderId: order.id }}
                  >
                    ดูรายละเอียด
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
