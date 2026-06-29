import { Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Store, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyDealerApplication } from "@/lib/api.functions";
import {
  dealerApplicationStatusLabel,
  dealerBusinessTypeLabel,
} from "@/lib/dealer.constants";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DealerApplicationDto } from "@/services/dealer.service";

type DealerApplicationBannerProps = {
  application: DealerApplicationDto | null;
  isDealer: boolean;
  loading?: boolean;
  className?: string;
};

export function DealerApplicationBanner({
  application,
  isDealer,
  loading,
  className,
}: DealerApplicationBannerProps) {
  if (loading || isDealer) return null;

  if (!application) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 to-transparent",
          className,
        )}
      >
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Store className="size-5" />
            </div>
            <div>
              <p className="font-semibold">สมัครเป็นตัวแทนจำหน่าย</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ดูราคาส่ง แคตตาล็อกตัวแทน และสิทธิพิเศษสำหรับร้านค้า /
                ช่างติดตั้ง
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/dealer/register">สมัครตัวแทน</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (application.status === "pending") {
    return (
      <Card className={cn("border-amber-200 bg-amber-50/60", className)}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-amber-700" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">ใบสมัครตัวแทนรออนุมัติ</p>
                <Badge variant="secondary">
                  {dealerApplicationStatusLabel(application.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {application.companyName} · ส่งเมื่อ{" "}
                {formatDate(application.createdAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                ทีมงานจะตรวจสอบภายใน 1–3 วันทำการ
              </p>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <Link to="/dealer/register">ดูสถานะ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (application.status === "rejected") {
    return (
      <Card className={cn("border-destructive/20 bg-destructive/5", className)}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <p className="font-semibold">ใบสมัครตัวแทนไม่ผ่าน</p>
              {application.reviewNote ? (
                <p className="mt-1 text-sm text-muted-foreground">
                  {application.reviewNote}
                </p>
              ) : null}
              <p className="mt-1 text-xs text-muted-foreground">
                สามารถส่งใบสมัครใหม่ได้
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/dealer/register">สมัครใหม่</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (application.status === "approved") {
    return (
      <Card className={cn("border-emerald-200 bg-emerald-50/60", className)}>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-700" />
            <div>
              <p className="font-semibold">อนุมัติเป็นตัวแทนแล้ว</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {application.companyName}
                {application.businessType
                  ? ` · ${dealerBusinessTypeLabel(application.businessType)}`
                  : ""}
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link to="/dealer">เข้าพอร์ทัลตัวแทน</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}

export function DealerApplicationBannerSection({
  className,
}: {
  className?: string;
}) {
  const { session, isDealer } = useAuth();
  const [application, setApplication] = useState<DealerApplicationDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || isDealer) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetchMyDealerApplication(authServerFnOptions(session))
      .then((app) => {
        if (!cancelled) setApplication(app);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, isDealer]);

  return (
    <DealerApplicationBanner
      application={application}
      isDealer={isDealer}
      loading={loading}
      className={className}
    />
  );
}
