import { createFileRoute } from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InlineRowsSkeleton, PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import {
  QuotationDocument,
  quotationStatusLabels,
} from "@/components/quotations/quotation-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchQuotationDetail,
  fetchUserQuotations,
  respondQuotation,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/account/quotations")({
  component: AccountQuotationsPage,
});

function AccountQuotationsPage() {
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuote, setViewQuote] = useState<QuotationDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const authOpts = authServerFnOptions(session);

  async function loadList() {
    setLoading(true);
    try {
      setQuotes(await fetchUserQuotations(authOpts));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadList();
  }, [session]);

  async function respond(id: string, accept: boolean) {
    try {
      await respondQuotation({
        data: { quotationId: id, accept },
        ...authOpts,
      });
      toast.success(accept ? "ยอมรับใบเสนอแล้ว" : "ปฏิเสธใบเสนอแล้ว");
      await loadList();
      if (viewQuote?.id === id) {
        setViewQuote(
          await fetchQuotationDetail({
            data: { quotationId: id },
            ...authOpts,
          }),
        );
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function openDetail(id: string) {
    setLoadingDetail(true);
    setViewQuote(null);
    try {
      setViewQuote(
        await fetchQuotationDetail({ data: { quotationId: id }, ...authOpts }),
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoadingDetail(false);
    }
  }

  return (
    <div>
      <PageHeader title="ใบเสนอราคา" description="ใบเสนอจากทีมขาย" />
      <div className="space-y-3">
        {loading ? (
          <PageLoading variant="list" />
        ) : quotes.length === 0 ? (
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
                <Badge variant="secondary">
                  {quotationStatusLabels[q.status] ?? q.status}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void openDetail(q.id)}
                  >
                    <Eye className="mr-1 size-4" />
                    ดูใบเสนอ
                  </Button>
                  {q.status === "sent" ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => void respond(q.id, true)}
                      >
                        ยอมรับ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void respond(q.id, false)}
                      >
                        ปฏิเสธ
                      </Button>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog
        open={Boolean(viewQuote) || loadingDetail}
        onOpenChange={(open) => {
          if (!open) setViewQuote(null);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {viewQuote?.quotationNumber ?? "ใบเสนอราคา"}
            </DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <InlineRowsSkeleton rows={4} />
          ) : viewQuote ? (
            <div className="space-y-4">
              {viewQuote.status === "sent" ? (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void respond(viewQuote.id, true)}
                  >
                    ยอมรับ
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void respond(viewQuote.id, false)}
                  >
                    ปฏิเสธ
                  </Button>
                </div>
              ) : null}
              <QuotationDocument quote={viewQuote} />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
