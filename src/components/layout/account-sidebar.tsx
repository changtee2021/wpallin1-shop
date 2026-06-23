import {
  Bell,
  Heart,
  Home,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  SlidersHorizontal,
  Store,
  Share2,
} from "lucide-react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

export function AccountSidebar() {
  const { t } = useT();
  const { user } = useAuth();
  const initials = (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <Avatar className="size-16">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">
              {user?.user_metadata?.full_name ?? "สมาชิก"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </CardContent>
      </Card>
      <SidebarNav
        title={t("nav.account")}
        items={[
          {
            to: "/account",
            search: { tab: "dashboard" },
            label: t("account.dashboard"),
            icon: LayoutDashboard,
            key: "dashboard",
          },
          {
            to: "/account",
            search: { tab: "settings" },
            label: t("account.settings"),
            icon: Settings,
            key: "settings",
          },
          {
            to: "/account/orders",
            label: t("account.orders"),
            icon: Package,
            key: "orders",
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
          {
            to: "/account/track",
            label: t("account.trackOrder"),
            icon: Search,
            key: "track",
          },
        ]}
      />
      <SidebarNav
        title={t("nav.shop")}
        items={[
          { to: "/", label: t("nav.home"), icon: Home },
          { to: "/shop", label: t("nav.shop"), icon: Store },
          {
            to: "/configurator",
            label: t("nav.configurator"),
            icon: SlidersHorizontal,
          },
        ]}
      />
    </div>
  );
}
