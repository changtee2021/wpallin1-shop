import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  adjustAdminWallet,
  approveAdminTopup,
  fetchAdminMembers,
  fetchAdminTopupQueue,
  rejectAdminTopup,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminMemberDto } from "@/services/tier.service";
import type { WalletTopupRequestDto } from "@/services/wallet.service";

export const Route = createFileRoute("/admin/wallet")({
  component: AdminWalletPage,
});

function AdminWalletPage() {
  const { session } = useAuth();
  const [queue, setQueue] = useState<WalletTopupRequestDto[]>([]);
  const [members, setMembers] = useState<AdminMemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustUserId, setAdjustUserId] = useState("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDirection, setAdjustDirection] = useState<"credit" | "debit">(
    "credit",
  );
  const [adjustNote, setAdjustNote] = useState("");

  async function load() {
    const [topups, memberList] = await Promise.all([
      fetchAdminTopupQueue({
        data: { status: "pending" },
        ...authServerFnOptions(session),
      }),
      fetchAdminMembers(authServerFnOptions(session)),
    ]);
    setQueue(topups);
    setMembers(memberList);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [session]);

  async function handleApprove(requestId: string) {
    try {
      await approveAdminTopup({
        data: { requestId },
        ...authServerFnOptions(session),
      });
      toast.success("อนุมัติเติมเงินแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleReject(requestId: string) {
    try {
      await rejectAdminTopup({
        data: { requestId, note: "สลิปไม่ถูกต้อง" },
        ...authServerFnOptions(session),
      });
      toast.success("ปฏิเสธคำขอแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleAdjust() {
    if (!adjustUserId || !adjustAmount) return;
    try {
      await adjustAdminWallet({
        data: {
          userId: adjustUserId,
          amount: Number(adjustAmount),
          direction: adjustDirection,
          note: adjustNote || undefined,
        },
        ...authServerFnOptions(session),
      });
      toast.success("ปรับยอดกระเป๋าแล้ว");
      setAdjustAmount("");
      setAdjustNote("");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="กระเป๋าเงิน"
        description="อนุมัติเติมเงินและปรับยอดลูกค้า"
      />

      <section>
        <h2 className="mb-3 text-lg font-semibold">คำขอเติมเงินรอตรวจ</h2>
        {loading ? (
          <PageLoading variant="table" />
        ) : queue.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              ไม่มีคำขอรอตรวจ
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {queue.map((req) => (
              <Card key={req.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                  <div>
                    <p className="font-semibold">
                      {req.userName ?? req.userEmail ?? req.userId}
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {formatPrice(req.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </p>
                    {req.slipSignedUrl ? (
                      <a
                        href={req.slipSignedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline"
                      >
                        ดูสลิป
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        ยังไม่อัปโหลดสลิป
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => void handleApprove(req.id)}
                      disabled={!req.slipFileUrl}
                    >
                      อนุมัติ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void handleReject(req.id)}
                    >
                      ปฏิเสธ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">ปรับยอดกระเป๋า (แอดมิน)</h2>
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>ลูกค้า</Label>
              <Select value={adjustUserId} onValueChange={setAdjustUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกลูกค้า" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.userId} value={m.userId}>
                      {m.fullName ?? m.email ?? m.userId} ·{" "}
                      {formatPrice(m.walletBalance)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>จำนวนเงิน</Label>
              <Input
                type="number"
                min={1}
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ประเภท</Label>
              <Select
                value={adjustDirection}
                onValueChange={(v) =>
                  setAdjustDirection(v as "credit" | "debit")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">เพิ่มเงิน</SelectItem>
                  <SelectItem value="debit">หักเงิน</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>หมายเหตุ</Label>
              <Textarea
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                rows={2}
              />
            </div>
            <Button onClick={() => void handleAdjust()}>
              บันทึกการปรับยอด
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
