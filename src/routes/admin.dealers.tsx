import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate } from "@/lib/format";
import type { DealerApplicationDto } from "@/services/dealer.service";

export const Route = createFileRoute("/admin/dealers")({
  component: AdminDealersPage,
});

function AdminDealersPage() {
  const { session } = useAuth();
  const [apps, setApps] = useState<DealerApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  async function reload() {
    const data = await fetchDealerApplications({
      data: { status: "pending" },
      ...authServerFnOptions(session),
    });
    setApps(data);
  }

  useEffect(() => {
    void reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleApprove(id: string) {
    try {
      await approveDealerApp({
        data: { applicationId: id },
        ...authServerFnOptions(session),
      });
      toast.success("อนุมัติแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
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
      <PageHeader title="ตัวแทนจำหน่าย" description="อนุมัติใบสมัคร dealer" />
      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : apps.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            ไม่มีใบสมัครรออนุมัติ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{app.companyName}</p>
                  <p className="text-sm text-muted-foreground">
                    {app.contactName} · {app.contactEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(app.createdAt)}
                  </p>
                </div>
                <Badge>{app.status}</Badge>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void handleApprove(app.id)}>
                    อนุมัติ
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
