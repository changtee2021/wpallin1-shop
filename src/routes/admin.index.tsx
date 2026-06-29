import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminDashboard } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { AdminDashboardDto } from "@/services/settings.service";

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminDashboardDto | null>(null);

  useEffect(() => {
    void fetchAdminDashboard(authServerFnOptions(session)).then(setStats);
  }, [session]);

  if (!stats) return <PageLoading variant="dashboard" />;

  const cards = [
    {
      title: "ยอดขายวันนี้",
      value: stats ? formatPrice(stats.todaySales) : "—",
    },
    {
      title: "ออเดอร์รอตรวจสลิป",
      value: stats?.pendingSlipVerification ?? "—",
    },
    {
      title: "ใบเสนอราคาเปิด",
      value: stats?.openQuotations ?? "—",
    },
    {
      title: "ใบสมัครตัวแทนรออนุมัติ",
      value: stats?.pendingDealerApps ?? "—",
    },
  ];

  return (
    <div>
      <PageHeader title={t("admin.overview")} description="แดชบอร์ดแอดมิน" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
