import {
  Bell,
  Heart,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Share2,
  Shield,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import {
  fetchAccountProfile,
  fetchTierProgress,
  fetchWalletSummary,
} from "@/lib/api.functions";
import { formatPrice } from "@/lib/format";
import { customerTypeLabel } from "@/lib/member-tier";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { TierProgressDto } from "@/services/tier.service";
import type { AccountProfileDto } from "@/types/api/profile";

type AccountProfileSummaryProps = {
  showNav?: boolean;
};

export function AccountProfileSummary({
  showNav = true,
}: AccountProfileSummaryProps) {
  const { t } = useT();
  const { user, session, isAdmin, isDealer } = useAuth();
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletPending, setWalletPending] = useState(0);
  const [tierProgress, setTierProgress] = useState<TierProgressDto | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    const authOpts = authServerFnOptions(session);
    let cancelled = false;

    void (async () => {
      setLoading(true);
      try {
        const [profileData, wallet, tier] = await Promise.all([
          fetchAccountProfile(authOpts),
          fetchWalletSummary(authOpts),
          fetchTierProgress(authOpts),
        ]);
        if (cancelled) return;
        setProfile(profileData);
        setWalletBalance(wallet.availableBalance);
        setWalletPending(wallet.pendingBalance);
        setTierProgress(tier);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const displayName =
    profile?.fullName ?? user?.user_metadata?.full_name ?? "สมาชิก";
  const email = profile?.email ?? user?.email ?? "";
  const initials = (displayName[0] ?? email[0] ?? "U").toUpperCase();

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

  const accountItems = [
    {
      to: "/account",
      search: { tab: "dashboard" },
      label: t("account.dashboard"),
      icon: LayoutDashboard,
      key: "dashboard",
    },
    {
      to: "/account/orders",
      label: t("account.orders"),
      icon: Package,
      key: "orders",
    },
    {
      to: "/account/tax-invoices",
      label: t("account.taxInvoice"),
      icon: Receipt,
      key: "tax-invoices",
    },
    {
      to: "/account/wishlist",
      label: "รายการโปรด",
      icon: Heart,
      key: "wishlist",
    },
    {
      to: "/account/affiliate",
      label: "Affiliate",
      icon: Share2,
      key: "affiliate",
    },
    {
      to: "/account/notifications",
      label: "แจ้งเตือน",
      icon: Bell,
      key: "notifications",
    },
    ...(isDealer
      ? [
          {
            to: "/dealer",
            label: t("nav.dealer"),
            icon: Store,
            key: "dealer",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            to: "/admin",
            label: t("nav.admin"),
            icon: Shield,
            key: "admin",
          },
        ]
      : []),
    {
      to: "/account",
      search: { tab: "settings", section: "personal" },
      label: t("account.settings"),
      icon: Settings,
      key: "settings",
    },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
          <Avatar className="size-16 rounded-2xl">
            {profile?.avatarUrl ? (
              <AvatarImage
                src={profile.avatarUrl}
                alt={displayName}
                className="rounded-2xl"
              />
            ) : null}
            <AvatarFallback className="rounded-2xl text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="w-full min-w-0">
            <p className="truncate font-semibold">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">{email}</p>
          </div>
          {profile && (
            <div className="flex flex-wrap justify-center gap-1.5">
              <Badge variant="secondary" className="text-xs">
                {customerTypeLabel(profile.customerType)}
              </Badge>
            </div>
          )}

          {!loading && tierProgress && (
            <div className="w-full rounded-xl border bg-muted/30 px-3 py-2.5 text-left">
              <p className="text-xs font-medium text-muted-foreground">
                ระดับสมาชิก
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge className="text-xs">
                  {tierProgress.currentTierName}
                </Badge>
                {tierProgress.nextTierName ? (
                  <span className="text-xs text-muted-foreground">
                    → {tierProgress.nextTierName}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    ระดับสูงสุด
                  </span>
                )}
              </div>
              <Progress value={tierPct} className="mt-2 h-1.5" />
              <p className="mt-1.5 text-xs text-muted-foreground">
                ยอดซื้อสะสม {formatPrice(tierProgress.totalSpent)}
                {tierProgress.nextTierName && tierProgress.amountToNext != null
                  ? ` · อีก ${formatPrice(tierProgress.amountToNext)}`
                  : ""}
              </p>
            </div>
          )}

          <div className="w-full rounded-xl bg-muted/40 px-3 py-2.5 text-left">
            <p className="text-xs text-muted-foreground">
              {t("account.wallet")} · ยอดใช้ได้
            </p>
            {loading ? (
              <p className="mt-0.5 text-sm text-muted-foreground">...</p>
            ) : (
              <p className="text-lg font-bold text-accent">
                {formatPrice(walletBalance)}
              </p>
            )}
            {!loading && walletPending > 0 && (
              <p className="text-xs text-muted-foreground">
                รอดำเนินการ {formatPrice(walletPending)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {showNav ? <SidebarNav title={displayName} items={accountItems} /> : null}
    </div>
  );
}
