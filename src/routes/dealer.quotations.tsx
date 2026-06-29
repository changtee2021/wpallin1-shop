import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserQuotations, respondQuotation } from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/dealer/quotations")({
  component: DealerQuotationsPage,
});

function DealerQuotationsPage() {
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const authOpts = useAuthServerFnOptions(session);

  useEffect(() => {
    setLoading(true);
    void fetchUserQuotations(authOpts)
      .then(setQuotes)
      .finally(() => setLoading(false));
  }, [authOpts]);

  if (loading) {
    return <PageLoading variant="list" />;
  }

  return (
    <div>
      <PageHeader title="ใบเสนอราคา B2B" description="ใบเสนอสำหรับตัวแทน" />
      <div className="space-y-3">
        {quotes.map((q) => (
          <Card key={q.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">{q.quotationNumber}</p>
                <p className="text-xl font-bold">{formatPrice(q.grandTotal)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(q.createdAt)}
                </p>
              </div>
              <Badge>{q.status}</Badge>
              {q.status === "sent" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void respondQuotation({
                        data: { quotationId: q.id, accept: true },
                        ...authOpts,
                      }).then(() =>
                        fetchUserQuotations(authOpts).then(setQuotes),
                      )
                    }
                  >
                    ยอมรับ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void respondQuotation({
                        data: { quotationId: q.id, accept: false },
                        ...authOpts,
                      }).then(() =>
                        fetchUserQuotations(authOpts).then(setQuotes),
                      )
                    }
                  >
                    ปฏิเสธ
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
