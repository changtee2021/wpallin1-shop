import { Link } from "@tanstack/react-router";
import { LayoutDashboard, User } from "lucide-react";
import { useMemo, useState } from "react";

import { AppMoreSheet } from "@/components/layout/app-more-sheet";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import {
  useAppNavActive,
  useAppNavItems,
  useAppNavZone,
  type AppNavItem,
} from "@/hooks/use-app-nav";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

function BottomNavLink({
  item,
  cartCount,
  isLoggedIn,
}: {
  item: AppNavItem;
  cartCount: number;
  isLoggedIn: boolean;
}) {
  const active = useAppNavActive(item);
  const Icon = item.icon;
  const badge = item.id === "cart" ? cartCount : (item.badge ?? 0);
  let to = item.to;
  if (item.id === "wishlist" && !isLoggedIn) to = "/login";

  return (
    <Link
      to={to}
      search={item.search}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
        />
      ) : null}
      <span className="relative">
        <Icon className="size-5" />
        {badge > 0 ? (
          <Badge className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-accent p-0 text-[9px] text-white">
            {badge > 99 ? "99+" : badge}
          </Badge>
        ) : null}
      </span>
      {item.label}
    </Link>
  );
}

function BottomNavAccountMenuButton({
  item,
  onOpen,
}: {
  item: AppNavItem;
  onOpen: () => void;
}) {
  const active = useAppNavActive(item);
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent"
        />
      ) : null}
      <Icon className="size-5" />
      {item.label}
    </button>
  );
}

export function AppBottomNav() {
  const { t } = useT();
  const { cart } = useCart();
  const { user } = useAuth();
  const zone = useAppNavZone();
  const items = useAppNavItems(cart.itemCount);
  const [moreOpen, setMoreOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const accountMenuLeadingLinks = useMemo(
    () =>
      user
        ? [
            {
              to: "/account",
              label: t("nav.account"),
              icon: LayoutDashboard,
              search: { tab: "dashboard" },
            },
          ]
        : [
            {
              to: "/login",
              label: t("nav.login"),
              icon: User,
            },
          ],
    [t, user],
  );

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Mobile navigation"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {items.map((item) => {
            if (item.isMore) {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMoreOpen(true)}
                  className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground"
                >
                  <Icon className="size-5" />
                  {item.label}
                </button>
              );
            }

            if (item.isAccountMenu) {
              return (
                <BottomNavAccountMenuButton
                  key={item.id}
                  item={item}
                  onOpen={() => setAccountMenuOpen(true)}
                />
              );
            }

            return (
              <BottomNavLink
                key={item.id}
                item={item}
                cartCount={cart.itemCount}
                isLoggedIn={!!user}
              />
            );
          })}
        </div>
      </nav>
      {zone !== "store" ? (
        <AppMoreSheet open={moreOpen} onOpenChange={setMoreOpen} zone={zone} />
      ) : null}
      {zone === "store" ? (
        <AppMoreSheet
          open={accountMenuOpen}
          onOpenChange={setAccountMenuOpen}
          zone="store"
          title={t("nav.account")}
          leadingLinks={accountMenuLeadingLinks}
        />
      ) : null}
    </>
  );
}
