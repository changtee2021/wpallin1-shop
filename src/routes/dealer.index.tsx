import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchDealerDashboard } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";

export const Route = createFileRoute("/dealer/")({
  component: DealerDashboardPage,
});

function DealerDashboardPage() {
  const { t } = useT();
  const { session, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<{
    tier: string;
    orderCount: number;
    totalSpent: number;
  } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;

    let cancelled = false;
    setLoadError(null);

    void fetchDealerDashboard(authServerFnOptions(session))
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
  }, [authLoading, session?.access_token]);

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
        badge={stats?.tier ?? "dealer"}
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">ออเดอร์ทั้งหมด</p>
            <p className="text-2xl font-bold">{stats?.orderCount ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">ยอดซื้อสะสม</p>
            <p className="text-2xl font-bold">
              {stats ? formatPrice(stats.totalSpent) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/dealer/catalog">{t("dealer.catalog")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/dealer/wallet">{t("dealer.wallet")}</Link>
        </Button>
      </div>
    </div>
  );
}
