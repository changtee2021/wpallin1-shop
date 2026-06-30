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
  ScanLine,
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
import { useChatUiSafe } from "@/hooks/use-chat-ui";
import type { AppNavZone } from "@/hooks/use-app-nav";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { cn } from "@/lib/utils";

type MoreLink = {
  to?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  search?: Record<string, unknown>;
  action?: "help" | "chat";
};

type MoreSection = {
  titleKey: TranslationKey;
  links: MoreLink[];
};

function sectionsForStoreZone(user: boolean): MoreSection[] {
  const sections: MoreSection[] = [
    {
      titleKey: "account.section.tools",
      links: [
        { to: "/inspiration", label: "แรงบันดาลใจ", icon: ImageIcon },
        { to: "/room-advisor", label: "AI ที่ปรึกษาห้อง", icon: ScanLine },
        { to: "/configurator", label: "Custom", icon: SlidersHorizontal },
      ],
    },
    {
      titleKey: "account.section.mine",
      links: [
        { to: "/account/wishlist", label: "รายการโปรด", icon: Heart },
        ...(user
          ? [
              {
                to: "/account/notifications",
                label: "แจ้งเตือน",
                icon: Bell,
              },
              {
                to: "/account/affiliate",
                label: "Affiliate",
                icon: Share2,
              },
            ]
          : []),
      ],
    },
    {
      titleKey: "account.section.about",
      links: [{ to: "/about", label: "เกี่ยวกับเรา", icon: Store }],
    },
  ];

  if (user) {
    sections.push({
      titleKey: "account.section.support",
      links: [
        { label: "help", icon: CircleHelp, action: "help" },
        { label: "chat", icon: MessageCircle, action: "chat" },
      ],
    });
  }

  return sections;
}

function linksForZone(
  zone: AppNavZone,
  isAdmin: boolean,
  isDealer: boolean,
  user: boolean,
): MoreLink[] {
  if (zone === "store") {
    return [];
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
    { to: "/admin/room-advisor", label: "Room Advisor", icon: ScanLine },
    { to: "/admin/banners", label: "แบนเนอร์", icon: ImageIcon },
    { to: "/admin/catalogs", label: "แคตตาล็อก", icon: FileText },
    { to: "/admin/custom", label: "Custom", icon: SlidersHorizontal },
    { to: "/admin/reports", label: "รายงาน", icon: BarChart3 },
    { to: "/admin/support", label: "Support", icon: Bell },
    { to: "/shop", label: "ร้านค้า", icon: Store },
  ];
}

function MoreLinkRow({
  link,
  onClose,
  onHelp,
  onChat,
  t,
}: {
  link: MoreLink;
  onClose: () => void;
  onHelp: () => void;
  onChat: () => void;
  t: (key: TranslationKey) => string;
}) {
  if (link.action === "help") {
    return (
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
        onClick={() => {
          onClose();
          onHelp();
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
        type="button"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
        onClick={() => {
          onClose();
          onChat();
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
      to={link.to}
      search={link.search}
      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
      onClick={onClose}
    >
      <link.icon className="size-5 text-muted-foreground" />
      {link.label}
    </Link>
  );
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
  const { openChat } = useChatUiSafe();
  const [helpOpen, setHelpOpen] = useState(false);
  const flatLinks = linksForZone(zone, isAdmin, isDealer, !!user);
  const storeSections =
    zone === "store" ? sectionsForStoreZone(!!user) : null;
  const sheetTitle = title ?? t("nav.more") ?? "เพิ่มเติม";

  const close = () => onOpenChange(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl pb-8">
          <SheetHeader>
            <SheetTitle>{sheetTitle}</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 grid gap-1">
            {leadingLinks.map((link) => (
              <MoreLinkRow
                key={link.to ?? link.label}
                link={link}
                onClose={close}
                onHelp={() => setHelpOpen(true)}
                onChat={() => openChat()}
                t={t}
              />
            ))}

            {storeSections
              ? storeSections.map((section) => (
                  <div key={section.titleKey} className="mt-2 first:mt-0">
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold tracking-wide text-muted-foreground">
                      {t(section.titleKey)}
                    </p>
                    {section.links.map((link) => (
                      <MoreLinkRow
                        key={(link.to ?? link.label) + section.titleKey}
                        link={link}
                        onClose={close}
                        onHelp={() => setHelpOpen(true)}
                        onChat={() => openChat()}
                        t={t}
                      />
                    ))}
                  </div>
                ))
              : flatLinks.map((link) => (
                  <MoreLinkRow
                    key={link.to ?? link.label}
                    link={link}
                    onClose={close}
                    onHelp={() => setHelpOpen(true)}
                    onChat={() => openChat()}
                    t={t}
                  />
                ))}

            <div className="mt-2 border-t pt-2">
              {user ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-muted"
                  onClick={() => {
                    void signOut();
                    close();
                  }}
                >
                  <LogOut className="size-5" />
                  {t("nav.logout") ?? "ออกจากระบบ"}
                </button>
              ) : zone !== "store" ? (
                <Link
                  to="/login"
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
                  onClick={close}
                >
                  <LogOut className="size-5" />
                  {t("nav.login")}
                </Link>
              ) : null}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      <AccountHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
