import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminDashboard } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import type { AdminDashboardDto } from "@/services/settings.service";

export const Route = createFileRoute("/admin/")({
  component: AdminOverviewPage,
});

type DashboardCard = {
  title: string;
  value: string | number;
  to: string;
  search?: Record<string, unknown>;
};

function AdminOverviewPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [stats, setStats] = useState<AdminDashboardDto | null>(null);

  useEffect(() => {
    void fetchAdminDashboard(authServerFnOptions(session)).then(setStats);
  }, [session]);

  if (!stats) return <PageLoading variant="dashboard" />;

  const cards: DashboardCard[] = [
    {
      title: "ยอดขายวันนี้",
      value: formatPrice(stats.todaySales),
      to: "/admin/reports",
    },
    {
      title: "ออเดอร์รอตรวจสลิป",
      value: stats.pendingSlipVerification,
      to: "/admin/orders",
    },
    {
      title: "ใบเสนอราคาเปิด",
      value: stats.openQuotations,
      to: "/admin/quotations",
    },
    {
      title: "ใบสมัครตัวแทนรออนุมัติ",
      value: stats.pendingDealerApps,
      to: "/admin/dealers",
    },
    {
      title: "Inspiration แบบร่าง",
      value: stats.inspirationDraftCount,
      to: "/admin/inspiration",
      search: { status: "draft" },
    },
    {
      title: "สินค้าใกล้หมด",
      value: stats.lowStockCount,
      to: "/admin/inventory",
    },
  ];

  return (
    <div>
      <PageHeader title={t("admin.overview")} description="แดชบอร์ดแอดมิน" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            search={card.search}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card
              className={cn(
                "h-full transition-colors hover:border-primary/40 hover:bg-muted/30",
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
