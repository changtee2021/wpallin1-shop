import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminReports } from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminReportsDto } from "@/services/reports.service";

export const Route = createFileRoute("/admin/reports")({
  component: AdminReportsPage,
});

function AdminReportsPage() {
  const { session } = useAuth();
  const [reports, setReports] = useState<AdminReportsDto | null>(null);

  useEffect(() => {
    void fetchAdminReports({
      data: { periodDays: 30 },
      ...authServerFnOptions(session),
    }).then(setReports);
  }, [session]);

  if (!reports) {
    return <PageLoading variant="dashboard" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงานยอดขาย"
        description={`${reports.periodDays} วันล่าสุด`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">รายได้</p>
            <p className="text-2xl font-bold">
              {formatPrice(reports.totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ออเดอร์</p>
            <p className="text-2xl font-bold">{reports.orderCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">เฉลี่ย/ออเดอร์</p>
            <p className="text-2xl font-bold">
              {formatPrice(reports.avgOrderValue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="font-semibold">สินค้าขายดี</p>
          {reports.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            reports.topProducts.map((p) => (
              <div
                key={p.name}
                className="flex justify-between border-b py-2 text-sm last:border-0"
              >
                <span>{p.name}</span>
                <span>
                  {p.qty} ชิ้น · {formatPrice(p.revenue)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <p className="font-semibold">ออเดอร์ตามสถานะ</p>
          {reports.ordersByStatus.map((row) => (
            <div
              key={row.status}
              className="flex justify-between border-b py-2 text-sm last:border-0"
            >
              <span>{row.status}</span>
              <span>{row.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
