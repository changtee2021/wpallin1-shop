import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { quotationStatusLabels } from "@/components/quotations/quotation-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminQuotations } from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/admin/quotations/")({
  component: AdminQuotationsListPage,
});

function AdminQuotationsListPage() {
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const authOpts = authServerFnOptions(session);

  useEffect(() => {
    void fetchAdminQuotations({ data: {}, ...authOpts }).then(setQuotes);
  }, [session]);

  return (
    <div>
      <PageHeader
        title="ใบเสนอราคา"
        description="จัดการใบเสนอจากลูกค้า — ตรวจสอบ ส่งให้ลูกค้า และแปลงเป็นออเดอร์เมื่อยอมรับแล้ว"
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
                    {q.customerName ?? q.customerEmail ?? q.userId}
                  </p>
                  <p className="text-xl font-bold">
                    {formatPrice(q.grandTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(q.createdAt)}
                  </p>
                </div>
                <Badge variant="secondary">
                  {quotationStatusLabels[q.status] ?? q.status}
                </Badge>
                <Button size="sm" variant="secondary" asChild>
                  <Link
                    to="/admin/quotations/$quotationId"
                    params={{ quotationId: q.id }}
                  >
                    รายละเอียด
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
