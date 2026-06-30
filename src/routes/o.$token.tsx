import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  acceptPublicOrderLink,
  fetchPublicOrderLink,
} from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { OrderLinkDto } from "@/types/api/order-links";

export const Route = createFileRoute("/o/$token")({
  component: PublicOrderLinkPage,
});

const statusLabels: Record<string, string> = {
  pending: "รอเปิด",
  opened: "เปิดแล้ว",
  ordered: "สั่งแล้ว",
  expired: "หมดอายุ",
  cancelled: "ยกเลิก",
};

function PublicOrderLinkPage() {
  const { token } = Route.useParams();
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const { refresh } = useCart();
  const [link, setLink] = useState<OrderLinkDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    void fetchPublicOrderLink({ data: { token } })
      .then(setLink)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "ไม่พบลิงก์สั่ง"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  async function handleAccept() {
    setAccepting(true);
    try {
      await acceptPublicOrderLink({
        data: { token, sessionId: getOrCreateCartSessionId() },
        ...authServerFnOptions(session),
      });
      await refresh();
      toast.success("เพิ่มลงตะกร้าแล้ว");
      if (!user) {
        toast.info("เข้าสู่ระบบก่อนชำระเงิน");
        void navigate({
          to: "/login",
          search: { redirect: `/cart/summary` },
        });
        return;
      }
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return <PageLoading variant="detail" className="min-h-screen" />;
  }

  if (!link) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        ไม่พบลิงก์สั่ง
      </div>
    );
  }

  const canOrder =
    link.status !== "ordered" &&
    link.status !== "expired" &&
    link.status !== "cancelled";

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-lg space-y-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">ลิงก์สั่งจาก WP ALL</h1>
            <p className="text-sm text-muted-foreground">
              หมดอายุ {formatDate(link.expiresAt)}
            </p>
          </div>
          <Badge>{statusLabels[link.status] ?? link.status}</Badge>
        </div>

        {link.customerNote ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              {link.customerNote}
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardContent className="divide-y p-0">
            {link.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.productName}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.sku} × {item.qty}
                  </p>
                </div>
                <p className="font-semibold text-accent">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            ))}
            <div className="flex items-center justify-between p-4">
              <span className="text-sm text-muted-foreground">รวม</span>
              <span className="text-lg font-bold">
                {formatPrice(link.subtotal)}
              </span>
            </div>
          </CardContent>
        </Card>

        {canOrder ? (
          <Button
            size="lg"
            className="w-full"
            disabled={accepting}
            onClick={() => void handleAccept()}
          >
            {accepting ? "กำลังเพิ่ม..." : "ยืนยันสั่ง → ไปชำระเงิน"}
          </Button>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            {link.status === "ordered"
              ? "ลิงก์นี้สั่งไปแล้ว"
              : "ลิงก์นี้ใช้ไม่ได้แล้ว"}
          </p>
        )}

        <p className="text-center text-sm">
          <Link to="/" className="text-primary underline">
            กลับหน้าแรก WP ALL
          </Link>
        </p>
      </div>
    </div>
  );
}
