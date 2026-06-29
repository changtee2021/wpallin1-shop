import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import {
  QuotationDocument,
  quotationStatusLabels,
} from "@/components/quotations/quotation-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchPublicQuotation,
  respondPublicQuotation,
} from "@/lib/api.functions";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/quote/$token")({
  component: PublicQuotationPage,
});

function PublicQuotationPage() {
  const { token } = Route.useParams();
  const [quote, setQuote] = useState<QuotationDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    void fetchPublicQuotation({ data: { token } })
      .then(setQuote)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "ไม่พบใบเสนอราคา"),
      )
      .finally(() => setLoading(false));
  }, [token]);

  async function respond(accept: boolean) {
    setResponding(true);
    try {
      await respondPublicQuotation({ data: { token, accept } });
      toast.success(accept ? "ยอมรับใบเสนอแล้ว" : "ปฏิเสธใบเสนอแล้ว");
      setQuote(await fetchPublicQuotation({ data: { token } }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setResponding(false);
    }
  }

  if (loading) {
    return <PageLoading variant="detail" className="min-h-screen" />;
  }

  if (!quote) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        ไม่พบใบเสนอราคา
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{quote.quotationNumber}</h1>
            <p className="text-sm text-muted-foreground">
              ใบเสนอราคาจาก WP ALL IN 1
            </p>
          </div>
          <Badge>{quotationStatusLabels[quote.status] ?? quote.status}</Badge>
        </div>

        {quote.status === "sent" ? (
          <div className="flex flex-wrap gap-2">
            <Button disabled={responding} onClick={() => void respond(true)}>
              ยอมรับใบเสนอ
            </Button>
            <Button
              variant="outline"
              disabled={responding}
              onClick={() => void respond(false)}
            >
              ปฏิเสธ
            </Button>
          </div>
        ) : null}

        <QuotationDocument quote={quote} />
      </div>
    </div>
  );
}
