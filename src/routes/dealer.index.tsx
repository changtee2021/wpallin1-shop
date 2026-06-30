import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Download, RotateCcw, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  fetchDealerDashboard,
  fetchPriceList,
  reorderFromOrder,
} from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";

export const Route = createFileRoute("/dealer/")({
  component: DealerDashboardPage,
});

function DealerDashboardPage() {
  const { t } = useT();
  const { session, loading: authLoading } = useAuth();
  const { refresh } = useCart();
  const [stats, setStats] = useState<{
    tier: string;
    orderCount: number;
    totalSpent: number;
    recentOrder: {
      id: string;
      orderNumber: string;
      createdAt: string;
      grandTotal: number;
    } | null;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const authOpts = authServerFnOptions(session);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;

    let cancelled = false;
    setLoadError(null);

    void fetchDealerDashboard(authOpts)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, session?.access_token, authOpts]);

  async function handleReorder() {
    if (!stats?.recentOrder) return;
    setReordering(true);
    try {
      await reorderFromOrder({
        data: {
          orderId: stats.recentOrder.id,
          sessionId: getOrCreateCartSessionId(),
        },
        ...authOpts,
      });
      await refresh();
      toast.success("เพิ่มรายการลงตะกร้าแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setReordering(false);
    }
  }

  async function handleDownloadPriceList() {
    setDownloading(true);
    try {
      const data = await fetchPriceList(authOpts);
      const header = ["SKU", "Name", "Category", "MOQ", "Price", "Retail"].join(
        ",",
      );
      const rows = data.rows.map((r) =>
        [
          r.sku,
          `"${r.name.replace(/"/g, '""')}"`,
          r.category ?? "",
          r.moq,
          r.price,
          r.retailPrice,
        ].join(","),
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `price-list-${data.tierName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloading(false);
    }
  }

  if (authLoading || (!stats && !loadError)) {
    return <PageLoading variant="dashboard" />;
  }

  if (loadError || !stats) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError ?? "โหลดข้อมูลไม่สำเร็จ"}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("dealer.dashboard")}
        description="ภาพรวมบัญชีตัวแทน"
        badge={stats.tier ?? "dealer"}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg" className="h-auto flex-col gap-2 py-4">
          <Link to="/order">
            <Zap className="size-5" />
            สั่งเลย
          </Link>
        </Button>
        {stats.recentOrder ? (
          <Button
            size="lg"
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
            disabled={reordering}
            onClick={() => void handleReorder()}
          >
            <RotateCcw className="size-5" />
            {reordering
              ? "กำลังเพิ่ม..."
              : `สั่งซ้ำ ${stats.recentOrder.orderNumber}`}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-auto flex-col gap-2 py-4"
          >
            <Link to="/account/orders">
              <RotateCcw className="size-5" />
              ประวัติออเดอร์
            </Link>
          </Button>
        )}
        <Button
          size="lg"
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          disabled={downloading}
          onClick={() => void handleDownloadPriceList()}
        >
          <Download className="size-5" />
          {downloading ? "กำลังสร้าง..." : "Price List"}
        </Button>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">ออเดอร์ทั้งหมด</p>
            <p className="text-2xl font-bold">{stats.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">ยอดซื้อสะสม</p>
            <p className="text-2xl font-bold">
              {formatPrice(stats.totalSpent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {stats.recentOrder ? (
        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm text-muted-foreground">ออเดอร์ล่าสุด</p>
              <p className="font-semibold">{stats.recentOrder.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {formatDate(stats.recentOrder.createdAt)} ·{" "}
                {formatPrice(stats.recentOrder.grandTotal)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link
                  to="/account/orders/$orderId"
                  params={{ orderId: stats.recentOrder.id }}
                >
                  ดูรายละเอียด
                </Link>
              </Button>
              <Button
                size="sm"
                disabled={reordering}
                onClick={() => void handleReorder()}
              >
                สั่งซ้ำ
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/dealer/catalog">{t("dealer.catalog")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dealer/wallet">{t("dealer.wallet")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/order">
            <Copy className="mr-1.5 size-4" />
            สร้างลิงก์สั่ง
          </Link>
        </Button>
      </div>
    </div>
  );
}
