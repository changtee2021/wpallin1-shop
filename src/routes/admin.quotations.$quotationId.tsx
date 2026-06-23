import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  convertQuotation,
  fetchQuotationDetail,
  sendQuotation,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";

export const Route = createFileRoute("/admin/quotations/$quotationId")({
  component: AdminQuotationDetailPage,
});

function AdminQuotationDetailPage() {
  const { quotationId } = Route.useParams();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [detail, setDetail] = useState<Awaited<
    ReturnType<typeof fetchQuotationDetail>
  > | null>(null);

  async function reload() {
    setDetail(
      await fetchQuotationDetail({ data: { quotationId }, ...authOpts }),
    );
  }

  useEffect(() => {
    void reload().catch((err) =>
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
    );
  }, [quotationId, session]);

  if (!detail) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.quotationNumber}
        description={`ลูกค้า: ${detail.customerEmail ?? detail.customerName ?? "-"}`}
      />

      <div className="flex flex-wrap gap-2">
        <Badge>{detail.status}</Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/quotations">กลับรายการ</Link>
        </Button>
        {detail.status === "draft" && (
          <Button
            size="sm"
            onClick={() =>
              void sendQuotation({ data: { quotationId }, ...authOpts })
                .then(() => toast.success("ส่งแล้ว"))
                .then(reload)
            }
          >
            ส่งใบเสนอ
          </Button>
        )}
        {["sent", "accepted"].includes(detail.status) && (
          <Button
            size="sm"
            onClick={() =>
              void convertQuotation({ data: { quotationId }, ...authOpts })
                .then((r) => toast.success(`สร้างออเดอร์ ${r.orderNumber}`))
                .then(reload)
            }
          >
            แปลงเป็นออเดอร์
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="text-sm text-muted-foreground">
            สร้าง {formatDate(detail.createdAt)}
            {detail.validUntil ? ` · หมดอายุ ${detail.validUntil}` : ""}
          </p>
          {detail.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 text-sm last:border-0"
            >
              <span>
                {item.productName} x {item.qty}
              </span>
              <span>{formatPrice(item.lineTotal)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-lg font-bold">
            <span>รวม</span>
            <span>{formatPrice(detail.grandTotal)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
