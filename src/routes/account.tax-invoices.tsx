import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ExternalLink, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchTaxInvoiceDownloadUrl,
  fetchUserTaxInvoiceOverview,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";
import type { OrderTaxInvoiceOverviewDto } from "@/services/tax-invoice.service";

export const Route = createFileRoute("/account/tax-invoices")({
  component: AccountTaxInvoicesPage,
});

function AccountTaxInvoicesPage() {
  const { t } = useT();
  const { session } = useAuth();
  const authOpts = useAuthServerFnOptions(session);
  const [rows, setRows] = useState<OrderTaxInvoiceOverviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchUserTaxInvoiceOverview(authOpts)
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authOpts]);

  async function handleDownload(invoiceId: string) {
    setDownloadingId(invoiceId);
    try {
      const { url } = await fetchTaxInvoiceDownloadUrl({
        data: { invoiceId },
        ...authOpts,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloadingId(null);
    }
  }

  const issuedCount = rows.filter((row) => row.invoice).length;

  return (
    <div>
      <PageHeader
        title={t("account.taxInvoice")}
        description="ใบกำกับภาษีจากออเดอร์ที่ชำระเงินแล้ว"
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {issuedCount > 0
            ? `มีใบกำกับแล้ว ${issuedCount} รายการ`
            : "ยังไม่มีใบกำกับที่ออกแล้ว"}
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link
            to="/account"
            search={{ tab: "settings", section: "address-tax" }}
            hash="section-tax-invoice"
          >
            จัดการข้อมูลออกใบกำกับ
          </Link>
        </Button>
      </div>

      {loading ? (
        <PageLoading variant="list" />
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-8 text-center text-muted-foreground">
            <Receipt className="mx-auto size-10 text-accent/70" />
            <p>ยังไม่มีออเดอร์ที่ชำระเงินแล้ว</p>
            <Link to="/shop" className="text-primary underline">
              เริ่มช้อปเลย
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.orderId}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <Link
                    to="/account/orders/$orderId"
                    params={{ orderId: row.orderId }}
                    className="font-semibold hover:text-primary"
                  >
                    {row.orderNumber}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(row.orderDate)} · {formatPrice(row.orderTotal)}
                  </p>
                  {row.invoice ? (
                    <p className="mt-1 text-sm">
                      เลขที่ {row.invoice.invoiceNumber} ·{" "}
                      {formatDate(row.invoice.invoiceDate)}
                    </p>
                  ) : null}
                </div>

                {row.invoice ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">ออกแล้ว</Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={downloadingId === row.invoice.id}
                      onClick={() => void handleDownload(row.invoice!.id)}
                    >
                      <Download className="mr-1.5 size-4" />
                      {downloadingId === row.invoice.id
                        ? "กำลังเปิด..."
                        : "ดาวน์โหลด"}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link
                        to="/account/orders/$orderId"
                        params={{ orderId: row.orderId }}
                      >
                        <ExternalLink className="mr-1.5 size-4" />
                        ดูออเดอร์
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    รอออกใบกำกับ
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
