import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { fetchOrderDetail } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { OrderDetailDto } from "@/types/api/orders";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: AccountOrderDetailPage,
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

function AccountOrderDetailPage() {
  const { t } = useT();
  const { session } = useAuth();
  const { orderId } = Route.useParams();
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    void fetchOrderDetail({
      data: { orderId },
      ...authServerFnOptions(session),
    })
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId, session]);

  async function handleSlipUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !session?.access_token || !order?.paymentId) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("paymentId", order.paymentId);
      form.append("orderId", order.id);
      const res = await fetch("/api/v1/payment-slip", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      toast.success("อัปโหลดสลิปแล้ว — รอตรวจสอบ");
      const refreshed = await fetchOrderDetail({
        data: { orderId },
        ...authServerFnOptions(session),
      });
      setOrder(refreshed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          ไม่พบคำสั่งซื้อ —{" "}
          <Link to="/account/orders" className="text-primary underline">
            กลับ
          </Link>
        </CardContent>
      </Card>
    );
  }

  const canUploadSlip =
    order.paymentId &&
    (order.status === "pending_payment" ||
      order.status === "awaiting_payment_verification");

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={formatDate(order.createdAt)}
        badge={statusLabels[order.status] ?? order.status}
      />

      <div className="space-y-4">
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="font-semibold">รายการสินค้า</h2>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between border-b pb-2 text-sm last:border-0"
              >
                <span>
                  {item.productName} x{item.qty}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold">
              <span>ยอดรวม</span>
              <span className="text-accent">
                {formatPrice(order.grandTotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        {order.bankAccounts.length > 0 && (
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <h2 className="font-semibold">บัญชีโอนเงิน</h2>
              {order.bankAccounts.map((b) => (
                <div key={b.account_no} className="rounded border p-3">
                  <p>{b.bank}</p>
                  <p className="font-mono">{b.account_no}</p>
                  <p>{b.account_name}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {canUploadSlip && (
          <Card>
            <CardContent className="space-y-3 p-4">
              <Label htmlFor="slip">อัปโหลดสลิปโอนเงิน</Label>
              <Input
                id="slip"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => void handleSlipUpload(e)}
              />
            </CardContent>
          </Card>
        )}

        {order.productionSteps.length > 0 && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <h2 className="font-semibold">สถานะการผลิต</h2>
              {order.productionSteps.map((step) => (
                <div key={step.id} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline">{step.stepName}</Badge>
                  <span className="text-muted-foreground">{step.status}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {order.statusHistory.length > 0 && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <h2 className="font-semibold">ประวัติสถานะ</h2>
              {order.statusHistory.map((h) => (
                <div key={h.id} className="text-sm text-muted-foreground">
                  {formatDate(h.createdAt)} —{" "}
                  {statusLabels[h.status] ?? h.status}
                  {h.note ? ` (${h.note})` : ""}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Button asChild variant="outline">
          <Link to="/account/orders">กลับรายการคำสั่งซื้อ</Link>
        </Button>
      </div>
    </div>
  );
}
