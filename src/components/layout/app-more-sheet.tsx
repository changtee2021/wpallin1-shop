import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Boxes,
  FileText,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Store,
  Tag,
  Wallet,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import type { AppNavZone } from "@/hooks/use-app-nav";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type MoreLink = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  search?: Record<string, unknown>;
};

function linksForZone(
  zone: AppNavZone,
  isAdmin: boolean,
  isDealer: boolean,
  user: boolean,
): MoreLink[] {
  if (zone === "store") {
    const links: MoreLink[] = [
      { to: "/configurator", label: "ออกแบบผ้าม่าน", icon: SlidersHorizontal },
      { to: "/about", label: "เกี่ยวกับเรา", icon: Store },
    ];
    if (user) {
      links.push({
        to: "/account/notifications",
        label: "แจ้งเตือน",
        icon: Bell,
      });
      links.push({
        to: "/account/affiliate",
        label: "Affiliate",
        icon: Share2,
      });
      links.push({
        to: "/account/wishlist",
        label: "รายการโปรด",
        icon: Heart,
      });
    }
    if (isDealer)
      links.push({ to: "/dealer", label: "พอร์ทัลตัวแทน", icon: Store });
    if (isAdmin) links.push({ to: "/admin", label: "แอดมิน", icon: Shield });
    return links;
  }

  if (zone === "account") {
    return [
      {
        to: "/account",
        label: "ที่อยู่ / ใบกำกับ",
        icon: Settings,
        search: { tab: "addresses" },
      },
      { to: "/account/notifications", label: "แจ้งเตือน", icon: Bell },
      { to: "/account/quotations", label: "ใบเสนอราคา", icon: FileText },
      { to: "/shop", label: "กลับร้านค้า", icon: Store },
      ...(isDealer ? [{ to: "/dealer", label: "ตัวแทน", icon: Store }] : []),
      ...(isAdmin ? [{ to: "/admin", label: "แอดมิน", icon: Shield }] : []),
    ];
  }

  if (zone === "dealer") {
    return [
      { to: "/dealer/wallet", label: "กระเป๋า", icon: Wallet },
      { to: "/account", label: "บัญชี", icon: Settings },
      { to: "/shop", label: "ร้านค้า", icon: Store },
      ...(isAdmin ? [{ to: "/admin", label: "แอดมิน", icon: Shield }] : []),
    ];
  }

  return [
    { to: "/admin/wallet", label: "กระเป๋า", icon: Wallet },
    { to: "/admin/members", label: "สมาชิก", icon: Store },
    { to: "/admin/tiers", label: "Tier", icon: LayoutDashboard },
    { to: "/admin/dealers", label: "ตัวแทน", icon: Store },
    { to: "/admin/coupons", label: "คูปอง", icon: Tag },
    { to: "/admin/inventory", label: "สต็อก", icon: Boxes },
    { to: "/admin/reports", label: "รายงาน", icon: BarChart3 },
    { to: "/admin/support", label: "Support", icon: Bell },
    { to: "/shop", label: "ร้านค้า", icon: Store },
  ];
}

export function AppMoreSheet({
  open,
  onOpenChange,
  zone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: AppNavZone;
}) {
  const { t } = useT();
  const { user, isAdmin, isDealer, signOut } = useAuth();
  const links = linksForZone(zone, isAdmin, isDealer, !!user);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl pb-8">
        <SheetHeader>
          <SheetTitle>{t("nav.more") ?? "เพิ่มเติม"}</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 grid gap-1">
          {links.map((link) => (
            <Link
              key={link.to + link.label}
              to={link.to}
              search={link.search}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted",
              )}
              onClick={() => onOpenChange(false)}
            >
              <link.icon className="size-5 text-muted-foreground" />
              {link.label}
            </Link>
          ))}
          {user ? (
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-muted"
              onClick={() => {
                void signOut();
                onOpenChange(false);
              }}
            >
              <LogOut className="size-5" />
              {t("nav.logout") ?? "ออกจากระบบ"}
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              <LogOut className="size-5" />
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
