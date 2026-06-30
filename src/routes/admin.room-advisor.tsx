import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { PageLoading } from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listAdminRoomAdvisorSessionsFn } from "@/lib/server-fns/room-advisor";
import { buildRoomAdvisorShareUrl } from "@/lib/room-advisor-session";
import { formatDate } from "@/lib/format";
import type { RoomAdvisorSessionSummaryDto } from "@/types/api/room-advisor";

export const Route = createFileRoute("/admin/room-advisor")({
  component: AdminRoomAdvisorPage,
});

const STATUS_LABEL: Record<string, string> = {
  draft: "ร่าง",
  analyzing: "กำลังวิเคราะห์",
  ready: "พร้อมแชร์",
  shared: "แชร์แล้ว",
  customer_responded: "ลูกค้าตอบแล้ว",
};

function AdminRoomAdvisorPage() {
  const [rows, setRows] = useState<RoomAdvisorSessionSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void listAdminRoomAdvisorSessionsFn()
      .then((data) => {
        if (!cancelled) setRows(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoading variant="list" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Room Advisor"
        description="รายการเซสชันวิเคราะห์ห้องจากรูปหน้างาน"
        actions={
          <Button asChild>
            <Link to="/room-advisor">เปิดหน้าลูกค้า</Link>
          </Button>
        }
      />

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}

      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">ยังไม่มีเซสชัน</p>
        ) : (
          rows.map((row) => (
            <Card key={row.id}>
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                {row.heroPhotoUrl ? (
                  <img
                    src={row.heroPhotoUrl}
                    alt=""
                    className="size-16 rounded-lg object-cover ring-1 ring-black/5"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {row.clientName ?? "ไม่ระบุชื่อ"}
                    {row.roomTypeHint ? ` · ${row.roomTypeHint}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(row.createdAt)} · แนะนำ {row.recommendationCount}{" "}
                    แบบ
                  </p>
                  {row.customerSelectedRanks.length > 0 ? (
                    <p className="text-xs text-primary">
                      ลูกค้าเลือกแบบที่ {row.customerSelectedRanks.join(", ")}
                    </p>
                  ) : null}
                </div>
                <Badge variant="outline">
                  {STATUS_LABEL[row.status] ?? row.status}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/room-advisor/result/$id"
                      params={{ id: row.id }}
                    >
                      เปิด
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      void navigator.clipboard.writeText(
                        buildRoomAdvisorShareUrl(row.shareToken),
                      );
                    }}
                  >
                    คัดลอกลิงก์
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
