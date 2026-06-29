import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Banknote,
  Check,
  Copy,
  Gift,
  Link2,
  Loader2,
  MousePointerClick,
  Share2,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import {
  createAffiliateLinkFn,
  fetchAffiliateDashboard,
  registerAffiliate,
  requestAffiliatePayoutFn,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";
import type { AffiliateDashboardDto } from "@/services/affiliate.service";

export const Route = createFileRoute("/account/affiliate")({
  component: AccountAffiliatePage,
});

const conversionStatusLabels: Record<string, string> = {
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  paid: "จ่ายแล้ว",
  rejected: "ไม่ผ่าน",
};

const payoutStatusLabels: Record<string, string> = {
  pending: "รอดำเนินการ",
  processing: "กำลังโอน",
  completed: "โอนแล้ว",
  rejected: "ไม่ผ่าน",
};

const onboardingSteps = [
  {
    icon: Share2,
    title: "แชร์ลิงก์ของคุณ",
    description: "ส่งลิงก์ให้เพื่อน ลูกค้า หรือโพสต์ในโซเชียล",
  },
  {
    icon: ShoppingBag,
    title: "เพื่อนช้อปผ่านลิงก์",
    description: "เมื่อมีคนสั่งซื้อผ่านลิงก์ของคุณ ระบบจะบันทึกยอดขาย",
  },
  {
    icon: Gift,
    title: "รับค่าคอมมิชชัน",
    description: "สะสมค่าคอมแล้วถอนเข้าบัญชีธนาคารได้",
  },
];

async function copyText(text: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
  } catch {
    toast.error("คัดลอกไม่สำเร็จ ลองเลือกข้อความแล้วคัดลอกเอง");
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  icon: typeof MousePointerClick;
  highlight?: boolean;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <Icon className="size-4 shrink-0 text-accent" />
        </div>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            highlight && "text-accent",
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">{children}</CardContent>
    </Card>
  );
}

function AccountAffiliatePage() {
  const { t } = useT();
  const { session } = useAuth();
  const authOpts = useAuthServerFnOptions(session);
  const [data, setData] = useState<AffiliateDashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [creatingLink, setCreatingLink] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);
  const [linkSlug, setLinkSlug] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [bank, setBank] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  async function reload() {
    const dash = await fetchAffiliateDashboard(authOpts);
    setData(dash);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void reload()
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
      )
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authOpts]);

  async function handleRegister() {
    setRegistering(true);
    try {
      await registerAffiliate(authOpts);
      toast.success("ยินดีต้อนรับ! ลิงก์ชวนของคุณพร้อมใช้งานแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setRegistering(false);
    }
  }

  async function handleCreateLink(e: FormEvent) {
    e.preventDefault();
    const slug = linkSlug.trim().toLowerCase();
    if (!slug) {
      toast.error(
        "กรุณาตั้งชื่อลิงก์ (ภาษาอังกฤษ เช่น facebook หรือ line-group)",
      );
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast.error("ใช้ได้เฉพาะ a-z, 0-9 และ - เท่านั้น");
      return;
    }

    setCreatingLink(true);
    try {
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://wpallin1-shop.vercel.app";
      await createAffiliateLinkFn({
        data: {
          slug,
          targetUrl: `${base}/shop`,
          label: linkLabel.trim() || undefined,
        },
        ...authOpts,
      });
      toast.success("สร้างลิงก์ติดตามแล้ว");
      setLinkSlug("");
      setLinkLabel("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setCreatingLink(false);
    }
  }

  async function handlePayout(e: FormEvent) {
    e.preventDefault();
    const amount = Number(payoutAmount);
    const balance = data?.account?.payoutBalance ?? 0;

    if (!amount || amount <= 0) {
      toast.error("กรุณาระบุจำนวนเงินที่ต้องการถอน");
      return;
    }
    if (amount > balance) {
      toast.error("ยอดถอนเกินจำนวนที่ถอนได้");
      return;
    }
    if (!bank.trim() || !accountNo.trim() || !accountName.trim()) {
      toast.error("กรุณากรอกข้อมูลบัญชีธนาคารให้ครบ");
      return;
    }

    setSubmittingPayout(true);
    try {
      await requestAffiliatePayoutFn({
        data: {
          amount,
          bank: bank.trim(),
          accountNo: accountNo.trim(),
          accountName: accountName.trim(),
        },
        ...authOpts,
      });
      toast.success("ส่งคำขอถอนแล้ว ทีมงานจะดำเนินการภายใน 3–5 วันทำการ");
      setPayoutAmount("");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmittingPayout(false);
    }
  }

  if (loading) {
    return <PageLoading variant="dashboard" />;
  }

  if (!data?.account) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Affiliate"
          description="แนะนำเพื่อนมาช้อป รับค่าคอมมิชชันทุกครั้งที่มีการสั่งซื้อ"
        />

        <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-accent/5 via-background to-background shadow-sm">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-accent/10 p-2.5">
                <Sparkles className="size-5 text-accent" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">
                  เริ่มหารายได้เสริมง่าย ๆ
                </p>
                <p className="text-sm text-muted-foreground">
                  สมัครฟรี ได้ลิงก์ชวนทันที ไม่ต้องสต็อกสินค้า ไม่ต้องจัดส่ง
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {onboardingSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-lg border bg-background/80 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                      {index + 1}
                    </span>
                    <step.icon className="size-4 text-accent" />
                  </div>
                  <p className="font-medium">{step.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className="min-w-[200px]"
                disabled={registering}
                onClick={() => void handleRegister()}
              >
                {registering ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    กำลังสมัคร...
                  </>
                ) : (
                  <>
                    เริ่มต้นใช้งานฟรี
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                อนุมัติทันที · ค่าคอมเริ่มต้น 3% ต่อออเดอร์
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const acc = data.account;
  const referralUrl = data.referralUrl ?? "";
  const canWithdraw = acc.payoutBalance > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliate"
        description="แชร์ลิงก์ ติดตามยอด และถอนค่าคอมมิชชัน"
        badge={
          acc.status === "approved"
            ? "ใช้งานได้"
            : acc.status === "pending"
              ? "รออนุมัติ"
              : acc.status
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard
          label="คลิกทั้งหมด"
          value={acc.totalClicks.toLocaleString("th-TH")}
          icon={MousePointerClick}
        />
        <StatCard
          label="ยอดขาย"
          value={acc.totalConversions.toLocaleString("th-TH")}
          icon={ShoppingBag}
        />
        <StatCard
          label="ค่าคอมสะสม"
          value={formatPrice(acc.totalCommission)}
          icon={Gift}
        />
        <StatCard
          label="ถอนได้"
          value={formatPrice(acc.payoutBalance)}
          icon={Wallet}
          highlight
        />
      </div>

      <SectionCard
        title="ลิงก์ชวนของคุณ"
        description="คัดลอกลิงก์นี้แล้วแชร์ให้เพื่อน — เมื่อมีคนช้อปผ่านลิงก์ คุณจะได้รับค่าคอม"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 rounded-lg border bg-muted/30 px-3 py-2.5">
            <p className="break-all font-mono text-sm">{referralUrl}</p>
          </div>
          <Button
            type="button"
            className="shrink-0"
            onClick={() => void copyText(referralUrl, t("share.linkCopied"))}
          >
            <Copy className="size-4" />
            {t("share.copyLink")}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>รหัสแนะนำ</span>
          <Badge variant="secondary" className="font-mono">
            {acc.referralCode}
          </Badge>
          <span>·</span>
          <span>อัตราค่าคอม {acc.commissionRate}%</span>
        </div>

        <Alert className="border-accent/20 bg-accent/5">
          <Link2 className="size-4" />
          <AlertTitle>วิธีใช้งาน</AlertTitle>
          <AlertDescription>
            แชร์ลิงก์ใน LINE, Facebook หรือช่องทางอื่น ๆ
            เมื่อลูกค้ากดลิงก์แล้วสั่งซื้อภายใน 30 วัน คุณจะได้รับค่าคอมมิชชัน
          </AlertDescription>
        </Alert>
      </SectionCard>

      <SectionCard
        title="ลิงก์ย่อย (ติดตามช่องทาง)"
        description="ตั้งชื่อลิงก์เพื่อดูว่าคลิกมาจากช่องทางไหน เช่น Facebook หรือ LINE"
      >
        <form className="space-y-4" onSubmit={(e) => void handleCreateLink(e)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="link-slug">ชื่อลิงก์ (ภาษาอังกฤษ)</Label>
              <Input
                id="link-slug"
                value={linkSlug}
                onChange={(e) => setLinkSlug(e.target.value)}
                placeholder="facebook, line-group, tiktok"
              />
              <p className="text-xs text-muted-foreground">
                ใช้ a-z, 0-9 และ - เท่านั้น
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-label">ชื่อที่จำง่าย (ไม่บังคับ)</Label>
              <Input
                id="link-label"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="โพสต์ Facebook ม.ค."
              />
            </div>
          </div>
          <Button type="submit" size="sm" disabled={creatingLink}>
            {creatingLink ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                กำลังสร้าง...
              </>
            ) : (
              "สร้างลิงก์ติดตาม"
            )}
          </Button>
        </form>

        {data.links.length > 0 ? (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm font-medium">ลิงก์ที่สร้างไว้</p>
            {data.links.map((link) => (
              <div
                key={link.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div className="min-w-0 space-y-1">
                  <p className="font-medium">
                    {link.label ?? link.slug}
                    {!link.isActive && (
                      <Badge variant="outline" className="ml-2">
                        ปิดใช้งาน
                      </Badge>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {link.clickCount.toLocaleString("th-TH")} คลิก
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void copyText(
                      referralUrl,
                      `คัดลอกลิงก์ "${link.label ?? link.slug}" แล้ว`,
                    )
                  }
                >
                  <Copy className="size-3.5" />
                  คัดลอก
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            ยังไม่มีลิงก์ย่อย — สร้างเพื่อดูว่าคลิกมาจากช่องทางไหน
          </p>
        )}
      </SectionCard>

      <SectionCard
        title="ถอนค่าคอมมิชชัน"
        description={
          canWithdraw
            ? `ถอนได้สูงสุด ${formatPrice(acc.payoutBalance)}`
            : "ยังไม่มียอดถอน — แชร์ลิงก์เพื่อเริ่มสะสมค่าคอม"
        }
      >
        <form className="space-y-4" onSubmit={(e) => void handlePayout(e)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="payout-amount">จำนวนเงิน (บาท)</Label>
                {canWithdraw && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => setPayoutAmount(String(acc.payoutBalance))}
                  >
                    ถอนทั้งหมด
                  </Button>
                )}
              </div>
              <Input
                id="payout-amount"
                type="number"
                min={1}
                max={acc.payoutBalance}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="0"
                disabled={!canWithdraw}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-bank">ธนาคาร</Label>
              <Input
                id="payout-bank"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                placeholder="เช่น กสิกรไทย, ไทยพาณิชย์"
                disabled={!canWithdraw}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-account-no">เลขบัญชี</Label>
              <Input
                id="payout-account-no"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                placeholder="xxx-x-xxxxx-x"
                disabled={!canWithdraw}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payout-account-name">ชื่อบัญชี</Label>
              <Input
                id="payout-account-name"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="ชื่อ-นามสกุล ตามบัญชีธนาคาร"
                disabled={!canWithdraw}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={!canWithdraw || submittingPayout}
            >
              {submittingPayout ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  กำลังส่งคำขอ...
                </>
              ) : (
                <>
                  <Banknote className="size-4" />
                  ส่งคำขอถอน
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              โอนเข้าบัญชีภายใน 3–5 วันทำการหลังอนุมัติ
            </p>
          </div>
        </form>

        {data.payouts.length > 0 && (
          <div className="space-y-2">
            <Separator />
            <p className="text-sm font-medium">ประวัติการถอน</p>
            {data.payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-medium">{formatPrice(payout.amount)}</p>
                  <p className="text-muted-foreground">
                    {formatDate(payout.createdAt)}
                  </p>
                </div>
                <Badge variant="outline">
                  {payoutStatusLabels[payout.status] ?? payout.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="ยอดขายล่าสุด"
        description="รายการสั่งซื้อที่มาจากลิงก์ของคุณ"
      >
        {data.conversions.length > 0 ? (
          <div className="divide-y rounded-lg border">
            {data.conversions.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    ค่าคอม {formatPrice(c.commissionAmount)}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <Badge
                  variant={
                    c.status === "approved" || c.status === "paid"
                      ? "default"
                      : "outline"
                  }
                  className="gap-1"
                >
                  {(c.status === "approved" || c.status === "paid") && (
                    <Check className="size-3" />
                  )}
                  {conversionStatusLabels[c.status] ?? c.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            ยังไม่มียอดขาย — ลองแชร์ลิงก์ชวนให้เพื่อนเริ่มต้นได้เลย
          </p>
        )}
      </SectionCard>
    </div>
  );
}
