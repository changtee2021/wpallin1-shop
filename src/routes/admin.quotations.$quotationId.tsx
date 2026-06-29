import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import {
  QuotationDocument,
  quotationStatusLabels,
} from "@/components/quotations/quotation-document";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  convertQuotation,
  fetchQuotationDetail,
  saveQuotationTerms,
  sendQuotation,
} from "@/lib/api.functions";
import { downloadQuotationElementPdf } from "@/lib/quotation-pdf";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { QuotationDto } from "@/types/api/quotations";

export const Route = createFileRoute("/admin/quotations/$quotationId")({
  component: AdminQuotationDetailPage,
});

function AdminQuotationDetailPage() {
  const { quotationId } = Route.useParams();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const docRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<QuotationDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [converting, setConverting] = useState(false);
  const [publicLink, setPublicLink] = useState<string | null>(null);
  const [terms, setTerms] = useState({
    paymentTerms: "",
    deliveryTerms: "",
    customerNote: "",
    validUntil: "",
  });

  async function reload() {
    const data = await fetchQuotationDetail({
      data: { quotationId },
      ...authOpts,
    });
    setDetail(data);
    if (data) {
      setTerms({
        paymentTerms: data.metadata?.paymentTerms ?? "",
        deliveryTerms: data.metadata?.deliveryTerms ?? "",
        customerNote: data.metadata?.customerNote ?? "",
        validUntil: data.validUntil ?? "",
      });
      if (data.metadata?.publicToken) {
        setPublicLink(
          `${window.location.origin}/quote/${data.metadata.publicToken}`,
        );
      }
    }
  }

  useEffect(() => {
    void reload().catch((err) =>
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
    );
  }, [quotationId, session]);

  async function handleSaveTerms() {
    setSaving(true);
    try {
      await saveQuotationTerms({
        data: { quotationId, ...terms },
        ...authOpts,
      });
      toast.success("บันทึกเงื่อนไขแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleSend() {
    setSending(true);
    try {
      const result = await sendQuotation({
        data: { quotationId },
        ...authOpts,
      });
      toast.success("ส่งใบเสนอให้ลูกค้าแล้ว");
      if (result.publicToken) {
        setPublicLink(`${window.location.origin}/quote/${result.publicToken}`);
      }
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleConvert() {
    setConverting(true);
    try {
      const result = await convertQuotation({
        data: { quotationId },
        ...authOpts,
      });
      toast.success(`สร้างออเดอร์ ${result.orderNumber} แล้ว`);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setConverting(false);
    }
  }

  async function handleDownloadPdf() {
    const el = docRef.current?.querySelector("#quotation-document");
    if (!el || !(el instanceof HTMLElement)) return;
    try {
      await downloadQuotationElementPdf(
        el,
        detail?.quotationNumber ?? "quotation",
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "ดาวน์โหลด PDF ไม่สำเร็จ",
      );
    }
  }

  if (!detail) {
    return <PageLoading variant="detail" />;
  }

  const canEditTerms = ["draft", "sent"].includes(detail.status);
  const canSend = detail.status === "draft";
  const canConvert = detail.status === "accepted";

  return (
    <div className="space-y-6">
      <PageHeader
        title={detail.quotationNumber}
        description={`ลูกค้า: ${detail.customerName ?? detail.customerEmail ?? "-"}`}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge>{quotationStatusLabels[detail.status] ?? detail.status}</Badge>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/quotations">กลับรายการ</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void handleDownloadPdf()}
        >
          <Download className="mr-1 size-4" />
          ดาวน์โหลด PDF
        </Button>
        {canSend ? (
          <Button
            size="sm"
            disabled={sending}
            onClick={() => void handleSend()}
          >
            <Send className="mr-1 size-4" />
            {sending ? "กำลังส่ง..." : "ส่งให้ลูกค้า"}
          </Button>
        ) : null}
        {canConvert ? (
          <Button
            size="sm"
            disabled={converting}
            onClick={() => void handleConvert()}
          >
            {converting ? "กำลังแปลง..." : "แปลงเป็นออเดอร์"}
          </Button>
        ) : null}
      </div>

      {publicLink ? (
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="font-medium">ลิงก์ให้ลูกค้าดูและยืนยัน</p>
            <a
              href={publicLink}
              target="_blank"
              rel="noreferrer"
              className="mt-1 break-all text-primary underline"
            >
              {publicLink}
            </a>
          </CardContent>
        </Card>
      ) : null}

      {canEditTerms ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <p className="font-semibold">เงื่อนไขใบเสนอราคา</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="validUntil">ใช้ได้ถึง</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={terms.validUntil}
                  onChange={(e) =>
                    setTerms((t) => ({ ...t, validUntil: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">เงื่อนไขการชำระเงิน</Label>
              <Textarea
                id="paymentTerms"
                rows={2}
                value={terms.paymentTerms}
                onChange={(e) =>
                  setTerms((t) => ({ ...t, paymentTerms: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryTerms">เงื่อนไขการจัดส่ง</Label>
              <Textarea
                id="deliveryTerms"
                rows={2}
                value={terms.deliveryTerms}
                onChange={(e) =>
                  setTerms((t) => ({ ...t, deliveryTerms: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerNote">หมายเหตุถึงลูกค้า</Label>
              <Textarea
                id="customerNote"
                rows={2}
                value={terms.customerNote}
                onChange={(e) =>
                  setTerms((t) => ({ ...t, customerNote: e.target.value }))
                }
              />
            </div>
            <Button
              size="sm"
              disabled={saving}
              onClick={() => void handleSaveTerms()}
            >
              {saving ? "กำลังบันทึก..." : "บันทึกเงื่อนไข"}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div
        ref={docRef}
        className="overflow-x-auto rounded-lg border bg-muted/30 p-4"
      >
        <QuotationDocument quote={detail} />
      </div>
    </div>
  );
}
