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
  fetchAdminQuotations,
  sendQuotation,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/admin/quotations")({
  component: AdminQuotationsPage,
});

function AdminQuotationsPage() {
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const authOpts = authServerFnOptions(session);

  async function load() {
    setQuotes(await fetchAdminQuotations({ data: {}, ...authOpts }));
  }

  useEffect(() => {
    void load();
  }, [session]);

  async function handleSend(id: string) {
    try {
      await sendQuotation({ data: { quotationId: id }, ...authOpts });
      toast.success("ส่งใบเสนอแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleConvert(id: string) {
    try {
      const result = await convertQuotation({
        data: { quotationId: id },
        ...authOpts,
      });
      toast.success(`สร้างออเดอร์ ${result.orderNumber} แล้ว`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  return (
    <div>
      <PageHeader
        title="ใบเสนอราคา"
        description="จัดการใบเสนอจากลูกค้าและทีมขาย"
      />
      <div className="space-y-3">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              ไม่มีใบเสนอราคา
            </CardContent>
          </Card>
        ) : (
          quotes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{q.quotationNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {q.customerEmail ?? q.customerName ?? q.userId}
                  </p>
                  <p className="text-xl font-bold">
                    {formatPrice(q.grandTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(q.createdAt)}
                  </p>
                </div>
                <Badge>{q.status}</Badge>
                <div className="flex flex-wrap gap-2">
                  {q.status === "draft" ? (
                    <Button size="sm" onClick={() => void handleSend(q.id)}>
                      ส่งให้ลูกค้า
                    </Button>
                  ) : null}
                  {["accepted", "sent", "draft"].includes(q.status) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleConvert(q.id)}
                    >
                      แปลงเป็นออเดอร์
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" asChild>
                    <Link
                      to="/admin/sales-order"
                      search={{ customerId: q.userId }}
                    >
                      สั่งแทน
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
