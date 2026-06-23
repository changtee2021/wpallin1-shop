import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserQuotations, respondQuotation } from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/account/quotations")({
  component: AccountQuotationsPage,
});

function AccountQuotationsPage() {
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const authOpts = authServerFnOptions(session);

  useEffect(() => {
    void fetchUserQuotations(authOpts).then(setQuotes);
  }, [session]);

  async function respond(id: string, accept: boolean) {
    try {
      await respondQuotation({
        data: { quotationId: id, accept },
        ...authOpts,
      });
      toast.success(accept ? "ยอมรับใบเสนอแล้ว" : "ปฏิเสธใบเสนอแล้ว");
      setQuotes(await fetchUserQuotations(authOpts));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  return (
    <div>
      <PageHeader title="ใบเสนอราคา" description="ใบเสนอจากทีมขาย" />
      <div className="space-y-3">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              ยังไม่มีใบเสนอราคา
            </CardContent>
          </Card>
        ) : (
          quotes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{q.quotationNumber}</p>
                  <p className="text-2xl font-bold">
                    {formatPrice(q.grandTotal)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(q.createdAt)}
                  </p>
                </div>
                <Badge>{q.status}</Badge>
                {q.status === "sent" ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => void respond(q.id, true)}>
                      ยอมรับ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void respond(q.id, false)}
                    >
                      ปฏิเสธ
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
