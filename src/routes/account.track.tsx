import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackOrder } from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { OrderDetailDto } from "@/types/api/orders";

export const Route = createFileRoute("/account/track")({
  component: TrackOrderPage,
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

function TrackOrderPage() {
  const { t } = useT();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OrderDetailDto | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const order = await trackOrder({ data: { orderNumber, email } });
      if (!order) {
        toast.error("ไม่พบคำสั่งซื้อ — ตรวจสอบเลขออเดอร์และอีเมล");
      } else {
        setResult(order);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ค้นหาไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("account.trackOrder")}
        description="ค้นหาสถานะด้วยเลขออเดอร์และอีเมล"
      />
      <form
        className="mb-6 max-w-md space-y-4"
        onSubmit={(e) => void handleSubmit(e)}
      >
        <div className="space-y-2">
          <Label htmlFor="orderId">เลขที่ออเดอร์</Label>
          <Input
            id="orderId"
            placeholder="WR-20260623-0001"
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="trackEmail">อีเมล</Label>
          <Input
            id="trackEmail"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button disabled={loading} type="submit">
          {loading ? "กำลังค้นหา..." : "ติดตามสถานะ"}
        </Button>
      </form>

      {result && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{result.orderNumber}</p>
              <Badge>{statusLabels[result.status] ?? result.status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(result.createdAt)} · {formatPrice(result.grandTotal)}
            </p>
            {result.productionSteps.length > 0 && (
              <div className="space-y-1 pt-2">
                <p className="text-sm font-medium">การผลิต</p>
                {result.productionSteps.map((step) => (
                  <div key={step.id} className="text-sm text-muted-foreground">
                    {step.stepName}: {step.status}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
