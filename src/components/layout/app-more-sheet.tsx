import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Boxes,
  CircleHelp,
  FileText,
  Heart,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Settings,
  Share2,
  Shield,
  SlidersHorizontal,
  Store,
  Tag,
  Wallet,
} from "lucide-react";
import { useState } from "react";

import { AccountHelpDialog } from "@/components/account/account-help-dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useChatUi } from "@/hooks/use-chat-ui";
import type { AppNavZone } from "@/hooks/use-app-nav";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type MoreLink = {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  search?: Record<string, unknown>;
  action?: "help" | "chat";
};

function linksForZone(
  zone: AppNavZone,
  isAdmin: boolean,
  isDealer: boolean,
  user: boolean,
): MoreLink[] {
  if (zone === "store") {
    const links: MoreLink[] = [
      { to: "/configurator", label: "Custom", icon: SlidersHorizontal },
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
        label: "help",
        icon: CircleHelp,
        action: "help",
      });
      links.push({
        label: "chat",
        icon: MessageCircle,
        action: "chat",
      });
    }
    return links;
  }

  if (zone === "account") {
    return [
      {
        to: "/account/tax-invoices",
        label: "ใบกำกับภาษี",
        icon: FileText,
      },
      { to: "/account/notifications", label: "แจ้งเตือน", icon: Bell },
      { to: "/account/quotations", label: "ใบเสนอราคา", icon: FileText },
      { to: "/account/wishlist", label: "รายการโปรด", icon: Heart },
      { to: "/account/affiliate", label: "Affiliate", icon: Share2 },
      { to: "/shop", label: "กลับร้านค้า", icon: Store },
      ...(isDealer ? [{ to: "/dealer", label: "ตัวแทน", icon: Store }] : []),
      ...(isAdmin ? [{ to: "/admin", label: "แอดมิน", icon: Shield }] : []),
      {
        label: "help",
        icon: CircleHelp,
        action: "help",
      },
      {
        label: "chat",
        icon: MessageCircle,
        action: "chat",
      },
      {
        to: "/account",
        label: "ตั้งค่า",
        icon: Settings,
        search: { tab: "settings", section: "personal" },
      },
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
    { to: "/admin/inspiration", label: "Inspiration", icon: ImageIcon },
    { to: "/admin/banners", label: "แบนเนอร์", icon: ImageIcon },
    { to: "/admin/catalogs", label: "แคตตาล็อก", icon: FileText },
    { to: "/admin/custom", label: "Custom", icon: SlidersHorizontal },
    { to: "/admin/reports", label: "รายงาน", icon: BarChart3 },
    { to: "/admin/support", label: "Support", icon: Bell },
    { to: "/shop", label: "ร้านค้า", icon: Store },
  ];
}

export function AppMoreSheet({
  open,
  onOpenChange,
  zone,
  title,
  leadingLinks = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: AppNavZone;
  title?: string;
  leadingLinks?: MoreLink[];
}) {
  const { t } = useT();
  const { user, isAdmin, isDealer, signOut } = useAuth();
  const { openChat } = useChatUi();
  const [helpOpen, setHelpOpen] = useState(false);
  const links = [
    ...leadingLinks,
    ...linksForZone(zone, isAdmin, isDealer, !!user),
  ];
  const sheetTitle = title ?? t("nav.more") ?? "เพิ่มเติม";

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 grid gap-1">
            {links.map((link) => {
              if (link.action === "help") {
                return (
                  <button
                    key="help"
                    type="button"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted",
                    )}
                    onClick={() => {
                      onOpenChange(false);
                      setHelpOpen(true);
                    }}
                  >
                    <link.icon className="size-5 text-muted-foreground" />
                    {t("account.help")}
                  </button>
                );
              }

              if (link.action === "chat") {
                return (
                  <button
                    key="chat"
                    type="button"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted",
                    )}
                    onClick={() => {
                      onOpenChange(false);
                      openChat();
                    }}
                  >
                    <link.icon className="size-5 text-muted-foreground" />
                    {t("account.chat")}
                  </button>
                );
              }

              if (!link.to) return null;

              return (
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
              );
            })}
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
      <AccountHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
