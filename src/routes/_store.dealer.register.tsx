import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  LogIn,
  RefreshCw,
  Store,
  XCircle,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DealerRegisterBenefits } from "@/components/dealer/dealer-register-benefits";
import { DealerRegisterSteps } from "@/components/dealer/dealer-register-steps";
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
import { useDealerApplication } from "@/hooks/use-dealer-application";
import {
  DEALER_BUSINESS_TYPES,
  dealerApplicationStatusLabel,
  dealerBusinessTypeLabel,
} from "@/lib/dealer.constants";
import { submitDealerApplication } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { getMyDealerApplication } from "@/services/dealer.service";

export const Route = createFileRoute("/_store/dealer/register")({
  component: DealerRegisterPage,
});

type FormState = {
  companyName: string;
  taxId: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  businessType: string;
  address: string;
};

function emptyForm(user?: {
  user_metadata?: { full_name?: string };
  email?: string | null;
}): FormState {
  return {
    companyName: "",
    taxId: "",
    contactName: user?.user_metadata?.full_name ?? "",
    contactPhone: "",
    contactEmail: user?.email ?? "",
    businessType: "",
    address: "",
  };
}

function DealerRegisterPage() {
  const { session, user, isDealer, loading: authLoading } = useAuth();
  const {
    application,
    loading: loadingApp,
    error: loadError,
    setApplication,
  } = useDealerApplication(user?.id, isDealer);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(() =>
    emptyForm(user ?? undefined),
  );

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        contactName: prev.contactName || user.user_metadata?.full_name || "",
        contactEmail: prev.contactEmail || user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (application?.status === "rejected") {
      setForm({
        companyName: application.companyName,
        taxId: application.taxId ?? "",
        contactName: application.contactName ?? "",
        contactPhone: application.contactPhone ?? "",
        contactEmail: application.contactEmail ?? "",
        businessType: application.businessType ?? "",
        address: application.address ?? "",
      });
    }
  }, [application]);

  async function refreshApplication() {
    if (!user?.id) return;
    try {
      const app = await getMyDealerApplication(supabase, user.id);
      setApplication(app);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !session) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสมัคร");
      return;
    }
    if (!form.businessType) {
      toast.error("กรุณาเลือกประเภทธุรกิจ");
      return;
    }
    setSubmitting(true);
    try {
      await submitDealerApplication({
        data: form,
        ...authServerFnOptions(session),
      });
      await refreshApplication();
      toast.success("ส่งใบสมัครแล้ว — รออนุมัติ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  if (!authLoading && isDealer) {
    return <Navigate to="/dealer" />;
  }

  const currentStep = !user
    ? "account"
    : application?.status === "pending"
      ? "review"
      : "form";

  const pendingView = application?.status === "pending" ? application : null;
  const showForm =
    Boolean(user) &&
    !isDealer &&
    !pendingView &&
    !(application?.status === "approved");

  const showInitialLoad =
    Boolean(user) && loadingApp && !application && !loadError;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title="สมัครตัวแทนจำหน่าย"
        description="พาร์ทเนอร์ร้านม่าน / ช่างติดตั้ง — สั่งจากโรงงาน WP ALL โดยตรง"
      />

      <DealerRegisterSteps current={currentStep} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 space-y-6">
          {!user && !authLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <LogIn className="size-8" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold">เข้าสู่ระบบก่อนสมัคร</p>
                  <p className="text-sm text-muted-foreground">
                    ต้องมีบัญชีสมาชิก WP ALL ก่อนส่งใบสมัครตัวแทน
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button asChild>
                    <Link
                      to="/login"
                      search={{ redirect: "/dealer/register", tab: "login" }}
                    >
                      เข้าสู่ระบบ
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link
                      to="/login"
                      search={{ redirect: "/dealer/register", tab: "signup" }}
                    >
                      สมัครสมาชิก
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {authLoading && !user ? (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                กำลังตรวจสอบบัญชี...
              </CardContent>
            </Card>
          ) : null}

          {loadError ? (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                  <p>{loadError}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void refreshApplication()}
                >
                  <RefreshCw className="size-4" />
                  ลองใหม่
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {showInitialLoad ? (
            <Card>
              <CardContent className="flex items-center justify-center gap-2 p-8 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                กำลังตรวจสอบใบสมัครเดิม...
              </CardContent>
            </Card>
          ) : null}

          {pendingView ? (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-6 text-amber-700" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">ใบสมัครอยู่ระหว่างตรวจสอบ</p>
                      <Badge variant="secondary">
                        {dealerApplicationStatusLabel(pendingView.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      ส่งเมื่อ {formatDate(pendingView.createdAt)}
                    </p>
                  </div>
                </div>
                <dl className="grid gap-2 rounded-lg border bg-background/80 p-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">บริษัท / ร้าน</dt>
                    <dd className="font-medium">{pendingView.companyName}</dd>
                  </div>
                  {pendingView.businessType ? (
                    <div>
                      <dt className="text-muted-foreground">ประเภทธุรกิจ</dt>
                      <dd>
                        {dealerBusinessTypeLabel(pendingView.businessType)}
                      </dd>
                    </div>
                  ) : null}
                  <div>
                    <dt className="text-muted-foreground">ผู้ติดต่อ</dt>
                    <dd>
                      {pendingView.contactName} · {pendingView.contactPhone}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground">
                  จะได้รับการแจ้งเตือนเมื่อมีผลการพิจารณา — สอบถามทีมขายได้ทาง
                  LINE
                </p>
              </CardContent>
            </Card>
          ) : null}

          {application?.status === "approved" && !isDealer ? (
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                <CheckCircle2 className="size-10 text-emerald-700" />
                <div>
                  <p className="font-semibold">อนุมัติเป็นตัวแทนแล้ว</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {application.companyName}
                  </p>
                </div>
                <Button asChild>
                  <Link to="/dealer">
                    <Store className="size-4" />
                    เข้าพอร์ทัลตัวแทน
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : null}

          {showForm && !showInitialLoad ? (
            <Card>
              <CardContent className="p-6">
                {application?.status === "rejected" ? (
                  <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
                    <div className="flex items-start gap-2">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                      <div>
                        <p className="font-medium">ใบสมัครก่อนหน้าไม่ผ่าน</p>
                        {application.reviewNote ? (
                          <p className="mt-1 text-muted-foreground">
                            {application.reviewNote}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs text-muted-foreground">
                          แก้ไขข้อมูลแล้วส่งใหม่ได้
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-muted-foreground">
                    กรอกข้อมูลร้านหรือบริษัทของคุณ —
                    ทีมงานจะติดต่อกลับหลังตรวจสอบ
                  </p>
                )}

                <form
                  className="space-y-4"
                  onSubmit={(e) => void handleSubmit(e)}
                >
                  <div>
                    <Label htmlFor="companyName">ชื่อบริษัท / ร้านค้า *</Label>
                    <Input
                      id="companyName"
                      required
                      value={form.companyName}
                      onChange={(e) =>
                        setForm({ ...form, companyName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">เลขประจำตัวผู้เสียภาษี</Label>
                    <Input
                      id="taxId"
                      value={form.taxId}
                      onChange={(e) =>
                        setForm({ ...form, taxId: e.target.value })
                      }
                      placeholder="13 หลัก (ถ้ามี)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">ประเภทธุรกิจ *</Label>
                    <Select
                      value={form.businessType || undefined}
                      onValueChange={(value) =>
                        setForm({ ...form, businessType: value })
                      }
                    >
                      <SelectTrigger id="businessType">
                        <SelectValue placeholder="เลือกประเภทธุรกิจ" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEALER_BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="contactName">ชื่อผู้ติดต่อ *</Label>
                      <Input
                        id="contactName"
                        required
                        value={form.contactName}
                        onChange={(e) =>
                          setForm({ ...form, contactName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPhone">เบอร์โทร *</Label>
                      <Input
                        id="contactPhone"
                        required
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) =>
                          setForm({ ...form, contactPhone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="contactEmail">อีเมล *</Label>
                    <Input
                      id="contactEmail"
                      required
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) =>
                        setForm({ ...form, contactEmail: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">ที่อยู่ / พื้นที่ให้บริการ</Label>
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                      placeholder="จังหวัด / อำเภอที่ต้องการขาย"
                      rows={3}
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting || !form.businessType}
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        กำลังส่ง...
                      </>
                    ) : application?.status === "rejected" ? (
                      "ส่งใบสมัครใหม่"
                    ) : (
                      "ส่งใบสมัครตัวแทน"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <DealerRegisterBenefits />
      </div>
    </div>
  );
}
