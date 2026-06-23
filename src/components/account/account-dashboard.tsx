import { Link } from "@tanstack/react-router";
import {
  Bell,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  Package,
  Pencil,
  Phone,
  Receipt,
  Search,
  Shield,
  Wallet,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/i18n";
import { customerTypeLabel, tierLabel } from "@/lib/member-tier";
import { formatDate, formatPrice } from "@/lib/format";
import type { CreditAccountDto } from "@/services/credit.service";
import type { TierProgressDto } from "@/services/tier.service";
import type { OrderSummaryDto } from "@/types/api/orders";
import type { AccountProfileDto } from "@/types/api/profile";

const statusLabels: Record<string, string> = {
  pending_payment: "รอชำระ",
  awaiting_payment_verification: "รอตรวจสลิป",
  paid: "ชำระแล้ว",
  confirmed: "ยืนยันแล้ว",
  shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};

type AccountDashboardProps = {
  profile: AccountProfileDto;
  walletBalance: number;
  walletPending: number;
  tierProgress: TierProgressDto | null;
  creditAccount: CreditAccountDto | null;
  recentOrders: OrderSummaryDto[];
  loading: boolean;
  isAdmin: boolean;
  isDealer: boolean;
};

export function AccountDashboard({
  profile,
  walletBalance,
  walletPending,
  tierProgress,
  creditAccount,
  recentOrders,
  loading,
  isAdmin,
  isDealer,
}: AccountDashboardProps) {
  const { t } = useT();
  const initials = (profile.fullName?.[0] ?? profile.email?.[0] ?? "U").toUpperCase();

  const tierPct =
    tierProgress?.nextTierName && tierProgress.amountToNext != null
      ? Math.min(
          100,
          Math.round(
            (tierProgress.totalSpent /
              (tierProgress.totalSpent + tierProgress.amountToNext)) *
              100,
          ),
        )
      : tierProgress
        ? 100
        : 0;

  return (
    <div className="space-y-6">
      {!profile.profileCompleted && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-amber-900">
            <p>
              กรุณากรอกข้อมูลให้ครบ (ประเภทผู้ซื้อและเลขประจำตัว/เลขภาษี)
              เพื่อใช้งานใบกำกับภาษีและขอวงเงินเครดิต
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link to="/account" search={{ tab: "settings" }}>
                กรอกข้อมูล
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {(isAdmin || isDealer) && (
        <div className="flex flex-wrap gap-2">
          {isAdmin && (
            <Button asChild>
              <Link to="/admin">
                <Shield className="mr-2 size-4" />
                {t("nav.admin")}
              </Link>
            </Button>
          )}
          {isDealer && (
            <Button asChild variant="outline">
              <Link to="/dealer">{t("nav.dealer")}</Link>
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="overflow-hidden border-border/60 shadow-sm lg:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="mb-4 size-20 rounded-2xl">
              <AvatarFallback className="rounded-2xl text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-lg font-semibold">
              {profile.fullName ?? "สมาชิก"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{profile.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">
                {customerTypeLabel(profile.customerType)}
              </Badge>
              <Badge>{tierLabel(profile.memberTier)}</Badge>
            </div>
            <Badge className="mt-4 bg-accent px-4 py-1.5 text-sm text-white hover:bg-accent">
              Balance: {formatPrice(walletBalance)}
            </Badge>
            <div className="mt-4 w-full space-y-2 text-left text-sm">
              {profile.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="size-4 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4"
              asChild
            >
              <Link to="/account" search={{ tab: "settings" }}>
                <Pencil className="mr-1 size-3.5" />
                แก้ไขโปรไฟล์
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-4 text-accent" />
                {t("account.wallet")}
              </CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/account" search={{ tab: "settings" }}>
                  จัดการ
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">ยอดใช้ได้</p>
                    <p className="text-2xl font-bold text-accent">
                      {formatPrice(walletBalance)}
                    </p>
                  </div>
                  {walletPending > 0 && (
                    <p className="text-sm text-muted-foreground">
                      รอดำเนินการ {formatPrice(walletPending)}
                    </p>
                  )}
                  {tierProgress && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>{tierProgress.currentTierName}</span>
                        {tierProgress.nextTierName ? (
                          <span className="text-muted-foreground">
                            → {tierProgress.nextTierName}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            ระดับสูงสุด
                          </span>
                        )}
                      </div>
                      <Progress value={tierPct} className="h-1.5" />
                      <p className="text-xs text-muted-foreground">
                        ยอดซื้อสะสม {formatPrice(tierProgress.totalSpent)}
                      </p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {creditAccount && (
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <CreditCard className="size-4 text-accent" />
                  {t("account.credit")}
                </CardTitle>
                <Button variant="link" size="sm" className="h-auto p-0" asChild>
                  <Link to="/account" search={{ tab: "settings" }}>
                    รายละเอียด
                  </Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">วงเงิน</span>
                  <span className="font-medium">
                    {formatPrice(creditAccount.creditLimit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">คงค้าง</span>
                  <span>{formatPrice(creditAccount.outstandingBalance)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">ใช้ได้</span>
                  <span className="font-semibold text-accent">
                    {formatPrice(creditAccount.availableCredit)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card
            className={`border-border/60 shadow-sm ${creditAccount ? "sm:col-span-2" : ""}`}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="size-4 text-accent" />
                คำสั่งซื้อล่าสุด
              </CardTitle>
              <Button variant="link" size="sm" className="h-auto p-0" asChild>
                <Link to="/account/orders">ดูทั้งหมด</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  ยังไม่มีคำสั่งซื้อ
                </p>
              ) : (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to="/account/orders/$orderId"
                      params={{ orderId: order.id }}
                      className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {statusLabels[order.status] ?? order.status}
                        </Badge>
                        <p className="font-medium">
                          {formatPrice(order.grandTotal)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">ทางลัด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ShortcutLink
              to="/account/wishlist"
              icon={Heart}
              label="รายการโปรด"
            />
            <ShortcutLink
              to="/account/notifications"
              icon={Bell}
              label="แจ้งเตือน"
            />
            <ShortcutLink
              to="/account/track"
              icon={Search}
              label={t("account.trackOrder")}
            />
            <ShortcutLink
              to="/account"
              search={{ tab: "settings" }}
              icon={Receipt}
              label={t("account.taxInvoice")}
            />
            <ShortcutLink
              to="/account/orders"
              icon={Package}
              label={t("account.orders")}
            />
            <ShortcutLink
              to="/account"
              search={{ tab: "settings" }}
              icon={MapPin}
              label={t("account.addresses")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="คำสั่งซื้อทั้งหมด" value={`${profile.orderCount} รายการ`} />
        <StatCard
          label="ยอดซื้อสะสม"
          value={formatPrice(profile.totalSpent)}
        />
        <StatCard
          label="สถานะบัญชี"
          value={profile.accountStatus}
        />
      </div>
    </div>
  );
}

function ShortcutLink({
  to,
  search,
  icon: Icon,
  label,
}: {
  to: string;
  search?: { tab: string };
  icon: typeof Heart;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/20 p-4 text-center text-sm transition-colors hover:border-accent/40 hover:bg-accent/5"
    >
      <Icon className="size-5 text-accent" />
      <span>{label}</span>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
