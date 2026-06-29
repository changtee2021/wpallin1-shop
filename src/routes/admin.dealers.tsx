import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  approveDealerApp,
  fetchDealerApplications,
  rejectDealerApp,
} from "@/lib/api.functions";
import {
  dealerApplicationStatusLabel,
  dealerBusinessTypeLabel,
} from "@/lib/dealer.constants";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealerApplicationDto } from "@/services/dealer.service";

export const Route = createFileRoute("/admin/dealers")({
  component: AdminDealersPage,
});

type StatusFilter = "pending" | "approved" | "rejected" | "all";

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "pending", label: "รออนุมัติ" },
  { id: "approved", label: "อนุมัติแล้ว" },
  { id: "rejected", label: "ไม่ผ่าน" },
  { id: "all", label: "ทั้งหมด" },
];

function statusBadgeVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "pending") return "secondary";
  if (status === "approved") return "default";
  if (status === "rejected") return "destructive";
  return "outline";
}

function AdminDealersPage() {
  const { session } = useAuth();
  const [apps, setApps] = useState<DealerApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function reload(status?: StatusFilter) {
    const active = status ?? filter;
    const data = await fetchDealerApplications({
      data: { status: active === "all" ? undefined : active },
      ...authServerFnOptions(session),
    });
    setApps(data);
  }

  useEffect(() => {
    void reload(filter).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, filter]);

  async function handleApprove(id: string) {
    setApprovingId(id);
    try {
      await approveDealerApp({
        data: { applicationId: id },
        ...authServerFnOptions(session),
      });
      toast.success("อนุมัติแล้ว — ผู้สมัครได้ role ตัวแทน");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleRejectConfirm() {
    if (!rejectId) return;
    setRejecting(true);
    try {
      await rejectDealerApp({
        data: {
          applicationId: rejectId,
          note: rejectNote.trim() || "ไม่ผ่านเกณฑ์",
        },
        ...authServerFnOptions(session),
      });
      toast.success("ปฏิเสธแล้ว");
      setRejectId(null);
      setRejectNote("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setRejecting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="ตัวแทนจำหน่าย"
        description="อนุมัติใบสมัครตัวแทน — ระบบภายในร้าน WP ALL"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              filter === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/40",
            )}
          >
            {tab.label}
            {tab.id === "pending" && filter === "pending" && apps.length > 0
              ? ` (${apps.length})`
              : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <PageLoading variant="table" />
      ) : apps.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {filter === "pending"
              ? "ไม่มีใบสมัครรออนุมัติ"
              : "ไม่มีข้อมูลในหมวดนี้"}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{app.companyName}</p>
                      <Badge variant={statusBadgeVariant(app.status)}>
                        {dealerApplicationStatusLabel(app.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {app.contactName} · {app.contactPhone} ·{" "}
                      {app.contactEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      สมัคร {formatDate(app.createdAt)}
                      {app.reviewedAt
                        ? ` · ตรวจ ${formatDate(app.reviewedAt)}`
                        : ""}
                    </p>
                  </div>
                  {app.status === "pending" ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={approvingId === app.id}
                        onClick={() => void handleApprove(app.id)}
                      >
                        {approvingId === app.id ? "กำลังอนุมัติ..." : "อนุมัติ"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setRejectId(app.id);
                          setRejectNote("");
                        }}
                      >
                        ปฏิเสธ
                      </Button>
                    </div>
                  ) : null}
                </div>

                <dl className="grid gap-2 rounded-lg border bg-muted/20 p-3 text-sm sm:grid-cols-2">
                  {app.taxId ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        เลขผู้เสียภาษี
                      </dt>
                      <dd>{app.taxId}</dd>
                    </div>
                  ) : null}
                  {app.businessType ? (
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        ประเภทธุรกิจ
                      </dt>
                      <dd>{dealerBusinessTypeLabel(app.businessType)}</dd>
                    </div>
                  ) : null}
                  {app.address ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">ที่อยู่</dt>
                      <dd>{app.address}</dd>
                    </div>
                  ) : null}
                  {app.reviewNote ? (
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-muted-foreground">
                        หมายเหตุจากแอดมิน
                      </dt>
                      <dd>{app.reviewNote}</dd>
                    </div>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filter === "pending" && apps.length === 0 && !loading ? (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          ใบสมัครใหม่จะแจ้งเตือนในระบบเมื่อลูกค้าส่งจากหน้า /dealer/register
        </p>
      ) : null}

      <Dialog
        open={rejectId != null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectId(null);
            setRejectNote("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ปฏิเสธใบสมัครตัวแทน</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-note">เหตุผล (ส่งให้ผู้สมัคร)</Label>
            <Textarea
              id="reject-note"
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="ระบุเหตุผล เช่น เอกสารไม่ครบ"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectId(null);
                setRejectNote("");
              }}
            >
              ยกเลิก
            </Button>
            <Button
              variant="destructive"
              disabled={rejecting}
              onClick={() => void handleRejectConfirm()}
            >
              ยืนยันปฏิเสธ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
