import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CreditCard, Heart, Package, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useT } from "@/i18n";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CreditAccountDto } from "@/services/credit.service";
import type { OrderStatus, OrderSummaryDto } from "@/types/api/orders";
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

type OrderTab =
  | "all"
  | "pay"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

const orderTabs: {
  id: OrderTab;
  label: string;
  statuses: OrderStatus[] | null;
}[] = [
  { id: "all", label: "ทั้งหมด", statuses: null },
  {
    id: "pay",
    label: "รอชำระ",
    statuses: ["pending_payment", "awaiting_payment_verification"],
  },
  {
    id: "processing",
    label: "กำลังเตรียม",
    statuses: ["paid", "confirmed"],
  },
  { id: "shipping", label: "กำลังจัดส่ง", statuses: ["shipped"] },
  { id: "completed", label: "สำเร็จ", statuses: ["completed"] },
  { id: "cancelled", label: "ยกเลิก", statuses: ["cancelled"] },
];

type AccountDashboardProps = {
  profile: AccountProfileDto;
  creditAccount: CreditAccountDto | null;
  recentOrders: OrderSummaryDto[];
  loading: boolean;
};

export function AccountDashboard({
  profile,
  creditAccount,
  recentOrders,
  loading,
}: AccountDashboardProps) {
  const { t } = useT();
  const [orderTab, setOrderTab] = useState<OrderTab>("all");

  const tabCounts = useMemo(() => {
    const counts: Record<OrderTab, number> = {
      all: recentOrders.length,
      pay: 0,
      processing: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };
    for (const order of recentOrders) {
      for (const tab of orderTabs) {
        if (tab.id === "all") continue;
        if (tab.statuses?.includes(order.status)) {
          counts[tab.id]++;
        }
      }
    }
    return counts;
  }, [recentOrders]);

  const filteredOrders = useMemo(() => {
    const active = orderTabs.find((tab) => tab.id === orderTab);
    if (!active?.statuses) return recentOrders;
    return recentOrders.filter((order) =>
      active.statuses!.includes(order.status),
    );
  }, [recentOrders, orderTab]);

  const displayOrders = filteredOrders.slice(0, 5);

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
              <Link
                to="/account"
                search={{ tab: "settings", section: "personal" }}
              >
                กรอกข้อมูล
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section>
        <div className="grid grid-cols-3 gap-x-4 gap-y-6">
          <ShortcutLink
            to="/account/wishlist"
            icon={Heart}
            label="รายการโปรด"
          />
          <ShortcutLink
            to="/account/tax-invoices"
            icon={Receipt}
            label={t("account.taxInvoice")}
          />
          <ShortcutLink
            to="/account/orders"
            icon={Package}
            label={t("account.orders")}
          />
        </div>
      </section>

      {creditAccount && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="size-4 text-accent" />
              {t("account.credit")}
            </CardTitle>
            <Button variant="link" size="sm" className="h-auto p-0" asChild>
              <Link
                to="/account"
                search={{ tab: "settings", section: "personal" }}
              >
                รายละเอียด
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">วงเงิน</p>
              <p className="font-medium">
                {formatPrice(creditAccount.creditLimit)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">คงค้าง</p>
              <p>{formatPrice(creditAccount.outstandingBalance)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">ใช้ได้</p>
              <p className="font-semibold text-accent">
                {formatPrice(creditAccount.availableCredit)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-2 pb-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Package className="size-4 text-accent" />
            คำสั่งซื้อล่าสุด
          </CardTitle>
          <Button
            variant="link"
            size="sm"
            className="h-auto shrink-0 p-0"
            asChild
          >
            <Link to="/account/orders">ดูทั้งหมด</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="-mx-1 overflow-x-auto pb-1">
            <div className="flex min-w-max gap-1 border-b px-1">
              {orderTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setOrderTab(tab.id)}
                  className={cn(
                    "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors",
                    orderTab === tab.id
                      ? "text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tab.label}
                  {tabCounts[tab.id] > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({tabCounts[tab.id]})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
          ) : displayOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {orderTab === "all"
                ? "ยังไม่มีคำสั่งซื้อ"
                : "ไม่มีคำสั่งซื้อในสถานะนี้"}
            </p>
          ) : (
            <div className="space-y-2">
              {displayOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/account/orders/$orderId"
                  params={{ orderId: order.id }}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline" className="mb-1">
                      {statusLabels[order.status] ?? order.status}
                    </Badge>
                    <p className="font-medium">
                      {formatPrice(order.grandTotal)}
                    </p>
                  </div>
                </Link>
              ))}
              {filteredOrders.length > 5 && (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/account/orders">
                    ดูอีก {filteredOrders.length - 5} รายการ
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="คำสั่งซื้อทั้งหมด"
          value={`${profile.orderCount} รายการ`}
        />
        <StatCard label="ยอดซื้อสะสม" value={formatPrice(profile.totalSpent)} />
        <StatCard label="สถานะบัญชี" value={profile.accountStatus ?? "-"} />
      </div>
    </div>
  );
}

function ShortcutLink({
  to,
  search,
  hash,
  icon: Icon,
  label,
}: {
  to: string;
  search?: { tab: string };
  hash?: string;
  icon: typeof Heart;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      hash={hash}
      className="flex flex-col items-center gap-2 text-center text-sm text-foreground transition-colors hover:text-accent"
    >
      <Icon className="size-6 text-accent" />
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
