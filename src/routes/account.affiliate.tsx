import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import {
  createAffiliateLinkFn,
  fetchAffiliateDashboard,
  registerAffiliate,
  requestAffiliatePayoutFn,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AffiliateDashboardDto } from "@/services/affiliate.service";

export const Route = createFileRoute("/account/affiliate")({
  component: AccountAffiliatePage,
});

function AccountAffiliatePage() {
  const { session } = useAuth();
  const [data, setData] = useState<AffiliateDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkSlug, setLinkSlug] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  async function reload() {
    const dash = await fetchAffiliateDashboard(authServerFnOptions(session));
    setData(dash);
  }

  useEffect(() => {
    void reload().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleRegister() {
    try {
      await registerAffiliate(authServerFnOptions(session));
      toast.success("สมัคร Affiliate แล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleCreateLink() {
    if (!linkSlug.trim()) return;
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://wpallin1-shop.vercel.app";
      await createAffiliateLinkFn({
        data: {
          slug: linkSlug,
          targetUrl: `${base}/shop`,
          label: linkLabel || undefined,
        },
        ...authServerFnOptions(session),
      });
      toast.success("สร้างลิงก์แล้ว");
      setLinkSlug("");
      setLinkLabel("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handlePayout() {
    const amount = Number(payoutAmount);
    if (!amount) return;
    try {
      await requestAffiliatePayoutFn({
        data: { amount, bank, accountNo, accountName },
        ...authServerFnOptions(session),
      });
      toast.success("ส่งคำขอถอนแล้ว");
      setPayoutAmount("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>;
  }

  if (!data?.account) {
    return (
      <div>
        <PageHeader
          title="Affiliate"
          description="แนะนำเพื่อน รับค่าคอมมิชชัน"
        />
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">
              สมัครโปรแกรม Affiliate เพื่อรับลิงก์ชวนและติดตามค่าคอม
            </p>
            <Button onClick={() => void handleRegister()}>
              สมัคร Affiliate
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acc = data.account;

  return (
    <div className="space-y-6">
      <PageHeader title="Affiliate" description="ติดตามลิงก์และค่าคอมมิชชัน" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">คลิก</p>
            <p className="text-2xl font-bold">{acc.totalClicks}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ยอดขาย</p>
            <p className="text-2xl font-bold">{acc.totalConversions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ค่าคอมรวม</p>
            <p className="text-2xl font-bold">
              {formatPrice(acc.totalCommission)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">ถอนได้</p>
            <p className="text-2xl font-bold">
              {formatPrice(acc.payoutBalance)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="font-semibold">ลิงก์หลัก</p>
          <p className="break-all rounded bg-muted/40 p-2 font-mono text-sm">
            {data.referralUrl}
          </p>
          <p className="text-sm text-muted-foreground">
            รหัส: <Badge variant="outline">{acc.referralCode}</Badge> · อัตรา{" "}
            {acc.commissionRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="font-semibold">สร้างลิงก์ย่อย</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label>Slug</Label>
              <Input
                value={linkSlug}
                onChange={(e) => setLinkSlug(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>ชื่อ (ไม่บังคับ)</Label>
              <Input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" onClick={() => void handleCreateLink()}>
            สร้างลิงก์
          </Button>
          {data.links.length > 0 && (
            <div className="space-y-2 pt-2">
              {data.links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border p-2 text-sm"
                >
                  <span>
                    {link.label ?? link.slug} · {link.clickCount} คลิก
                  </span>
                  <span className="text-muted-foreground">
                    {link.targetUrl}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <p className="font-semibold">ขอถอนค่าคอม</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>จำนวนเงิน</Label>
              <Input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
              />
            </div>
            <div>
              <Label>ธนาคาร</Label>
              <Input value={bank} onChange={(e) => setBank(e.target.value)} />
            </div>
            <div>
              <Label>เลขบัญชี</Label>
              <Input
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
              />
            </div>
            <div>
              <Label>ชื่อบัญชี</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
              />
            </div>
          </div>
          <Button size="sm" onClick={() => void handlePayout()}>
            ส่งคำขอถอน
          </Button>
        </CardContent>
      </Card>

      {data.conversions.length > 0 && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <p className="font-semibold">ยอดขายล่าสุด</p>
            {data.conversions.map((c) => (
              <div
                key={c.id}
                className="flex justify-between border-b py-2 text-sm last:border-0"
              >
                <span>{formatDate(c.createdAt)}</span>
                <span>{formatPrice(c.commissionAmount)}</span>
                <Badge variant="outline">{c.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
