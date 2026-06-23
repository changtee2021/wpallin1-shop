import { Link } from "@tanstack/react-router";
import { useState } from "react";

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
  const to = item.id === "account" && !isLoggedIn ? "/login" : item.to;

  return (
    <Link
      to={to}
      search={item.search}
      className={cn(
        "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
    >
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

export function AppBottomNav() {
  const { cart } = useCart();
  const { user } = useAuth();
  const zone = useAppNavZone();
  const items = useAppNavItems(cart.itemCount);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur md:hidden"
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
      <AppMoreSheet open={moreOpen} onOpenChange={setMoreOpen} zone={zone} />
    </>
  );
}
