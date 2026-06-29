import { Link } from "@tanstack/react-router";
import {
  CircleHelp,
  Heart,
  Languages,
  LogOut,
  Package,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AccountHelpDialog } from "@/components/account/account-help-dialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLocaleControl, useT } from "@/i18n";
import type { Locale } from "@/i18n/types";
import { fetchAccountProfileCached } from "@/lib/account-profile-cache";
import { cn } from "@/lib/utils";
import type { AccountProfileDto } from "@/types/api/profile";

type AccountMenuButtonProps = {
  className?: string;
  variant?: "header" | "menu";
  onNavigate?: () => void;
};

const localeOptions: { value: Locale; label: string }[] = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
];

export function AccountMenuButton({
  className,
  variant = "header",
  onNavigate,
}: AccountMenuButtonProps) {
  const { t } = useT();
  const { locale, setLocale } = useLocaleControl();
  const { user, session, signOut } = useAuth();
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;

    const load = () => {
      void fetchAccountProfileCached(session)
        .then((data) => {
          if (!cancelled) setProfile(data);
        })
        .catch(() => {
          if (!cancelled) setProfile(null);
        });
    };

    const idleId =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(load, { timeout: 3000 })
        : window.setTimeout(load, 300);

    return () => {
      cancelled = true;
      if (typeof requestIdleCallback !== "undefined") {
        cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as number);
      }
    };
  }, [session]);

  const displayName =
    profile?.fullName ??
    user?.user_metadata?.full_name ??
    user?.email ??
    "สมาชิก";
  const email = profile?.email ?? user?.email ?? "";
  const initials = (displayName[0] ?? email[0] ?? "U").toUpperCase();

  const avatar = (
    <Avatar
      className={variant === "menu" ? "size-9 shrink-0" : "size-7 shrink-0"}
    >
      {profile?.avatarUrl ? (
        <AvatarImage src={profile.avatarUrl} alt={displayName} />
      ) : null}
      <AvatarFallback
        className={cn(
          "text-sm",
          variant === "header" && "bg-white/20 text-xs text-white",
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  if (variant === "menu") {
    return (
      <Link
        to="/account"
        search={{ tab: "dashboard" }}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted",
          className,
        )}
        onClick={onNavigate}
      >
        {avatar}
        <span className="truncate text-sm font-medium">{displayName}</span>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "max-w-none border-0 bg-transparent px-1 text-white shadow-none hover:bg-white/10 hover:text-white sm:max-w-[200px] sm:px-2",
            className,
          )}
          aria-label={displayName}
        >
          <span className="flex items-center gap-2">
            {avatar}
            <span className="hidden truncate sm:inline">{displayName}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link
            to="/account"
            search={{ tab: "settings", section: "personal" }}
            className="cursor-pointer"
          >
            <User />
            {t("account.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/wishlist" className="cursor-pointer">
            <Heart />
            รายการโปรด
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/account/orders" className="cursor-pointer">
            <Package />
            {t("account.orders")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => setHelpOpen(true)}
        >
          <CircleHelp />
          {t("account.help")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Languages />
            {locale === "th" ? "เปลี่ยนภาษา" : "Language"}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {localeOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setLocale(option.value)}
                className={
                  locale === option.value ? "font-semibold" : undefined
                }
              >
                {option.label}
                {locale === option.value ? " ✓" : null}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => void signOut()}
        >
          <LogOut />
          {t("nav.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
      <AccountHelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </DropdownMenu>
  );
}
