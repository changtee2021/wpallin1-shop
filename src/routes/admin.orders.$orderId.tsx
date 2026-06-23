import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import {
  adminRejectSlip,
  adminUpdateOrderStatus,
  adminVerifySlip,
  fetchAdminOrderDetail,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import type { AdminOrderDetailDto, OrderStatus } from "@/types/api/orders";

export const Route = createFileRoute("/admin/orders/$orderId")({
  component: AdminOrderDetailPage,
});

function AdminOrderDetailPage() {
  const { session } = useAuth();
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<AdminOrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  async function reload() {
    const data = await fetchAdminOrderDetail({
      data: { orderId },
      ...authServerFnOptions(session),
    });
    setOrder(data);
  }

  useEffect(() => {
    void reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, session]);

  async function handleVerify() {
    if (!order?.payment) return;
    setActing(true);
    try {
      await adminVerifySlip({
        data: {
          orderId: order.id,
          paymentId: order.payment.id,
        },
        ...authServerFnOptions(session),
      });
      toast.success("ยืนยันสลิปแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setActing(false);
    }
  }

  async function handleReject() {
    if (!order?.payment) return;
    setActing(true);
    try {
      await adminRejectSlip({
        data: {
          orderId: order.id,
          paymentId: order.payment.id,
          note: "สลิปไม่ถูกต้อง",
        },
        ...authServerFnOptions(session),
      });
      toast.success("ปฏิเสธสลิปแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setActing(false);
    }
  }

  async function handleStatusChange(status: OrderStatus) {
    setActing(true);
    try {
      await adminUpdateOrderStatus({
        data: { orderId, status },
        ...authServerFnOptions(session),
      });
      toast.success("อัปเดตสถานะแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setActing(false);
    }
  }

  if (loading) return <p className="text-muted-foreground">กำลังโหลด...</p>;
  if (!order) {
    return (
      <Card>
        <CardContent className="p-8 text-center">ไม่พบคำสั่งซื้อ</CardContent>
      </Card>
    );
  }

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`${order.customerName ?? "-"} · ${order.customerEmail ?? ""}`}
        badge={order.status}
      />

      {order.placedByUserId && (
        <div className="mb-4">
          <Badge variant="secondary">
            สั่งแทนโดย {order.placedByName ?? order.placedByUserId}
          </Badge>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="font-semibold">รายการ</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} x{item.qty}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
            <p className="font-bold">รวม {formatPrice(order.grandTotal)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">การชำระเงิน</h2>
            {order.payment && (
              <p className="text-sm">
                {order.payment.method} — {order.payment.status} —{" "}
                {formatPrice(order.payment.amount)}
              </p>
            )}
            {order.slips.map((slip) => (
              <div key={slip.id} className="space-y-2">
                {slip.signedUrl && (
                  <img
                    src={slip.signedUrl}
                    alt="Payment slip"
                    className="max-h-48 rounded border"
                  />
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(slip.uploadedAt)}{" "}
                  {slip.verified ? "(verified)" : ""}
                </p>
              </div>
            ))}
            {order.status === "awaiting_payment_verification" &&
              order.payment && (
                <div className="flex gap-2">
                  <Button disabled={acting} onClick={() => void handleVerify()}>
                    ยืนยันสลิป
                  </Button>
                  <Button
                    disabled={acting}
                    variant="outline"
                    onClick={() => void handleReject()}
                  >
                    ปฏิเสธ
                  </Button>
                </div>
              )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">เปลี่ยนสถานะ</h2>
            <Select
              value={order.status}
              onValueChange={(v) => void handleStatusChange(v as OrderStatus)}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  "pending_payment",
                  "awaiting_payment_verification",
                  "paid",
                  "confirmed",
                  "shipped",
                  "completed",
                  "cancelled",
                ].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-1">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="text-sm text-muted-foreground">
                  {formatDate(h.createdAt)} —{" "}
                  <Badge variant="outline">{h.status}</Badge>
                  {h.note ? ` — ${h.note}` : ""}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Button asChild variant="outline" className="mt-4">
        <Link to="/admin/orders">กลับรายการ</Link>
      </Button>
    </div>
  );
}
