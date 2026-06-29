import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetchAccountProfile } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";
import type { AccountProfileDto } from "@/types/api/profile";

type AccountMenuButtonProps = {
  className?: string;
  variant?: "header" | "menu";
  iconOnly?: boolean;
  onNavigate?: () => void;
};

export function AccountMenuButton({
  className,
  variant = "header",
  iconOnly = false,
  onNavigate,
}: AccountMenuButtonProps) {
  const { user, session } = useAuth();
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    void fetchAccountProfile(authServerFnOptions(session))
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {
        if (!cancelled) setProfile(null);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  const displayName =
    profile?.fullName ??
    user?.user_metadata?.full_name ??
    user?.email ??
    "สมาชิก";
  const email = profile?.email ?? user?.email ?? "";
  const initials = (displayName[0] ?? email[0] ?? "U").toUpperCase();

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
        <Avatar className="size-9 shrink-0">
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="text-sm">{initials}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm font-medium">{displayName}</span>
      </Link>
    );
  }

  return (
    <Button
      variant="ghost"
      size={iconOnly ? "icon" : "sm"}
      className={cn(
        iconOnly
          ? "rounded-full text-white hover:bg-white/10 hover:text-white"
          : "max-w-none border-0 bg-transparent px-1 text-white shadow-none hover:bg-white/10 hover:text-white sm:max-w-[200px] sm:px-2",
        className,
      )}
      asChild
    >
      <Link
        to="/account"
        search={{ tab: "dashboard" }}
        className={iconOnly ? "flex items-center" : "flex items-center gap-2"}
        aria-label={displayName}
      >
        <Avatar className={iconOnly ? "size-8 shrink-0" : "size-7 shrink-0"}>
          {profile?.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-white/20 text-xs text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        {iconOnly ? null : (
          <span className="hidden truncate sm:inline">{displayName}</span>
        )}
      </Link>
    </Button>
  );
}
