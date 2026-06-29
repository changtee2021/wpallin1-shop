import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { AccountMenuButton } from "@/components/account/account-menu-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { SearchBar } from "@/components/storefront/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

const navLinks = [
  { to: "/" as const, key: "nav.home" as const, exact: true },
  { to: "/shop" as const, key: "nav.shop" as const },
  { to: "/catalogs" as const, key: "nav.catalogs" as const },
  { to: "/configurator" as const, key: "nav.configurator" as const },
  { to: "/about" as const, key: "nav.about" as const },
];

const headerIconClass = "text-white hover:bg-white/10 hover:text-white";

export function StorefrontHeader() {
  const { t } = useT();
  const { user } = useAuth();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-primary to-[#126B68] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-3 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/brand/logo-mono-dark.png"
              alt="WP ALL"
              className="h-8 w-auto object-contain mix-blend-screen sm:h-10"
            />
          </Link>

          <div className="min-w-0 flex-1 md:hidden">
            <SearchBar compact />
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? (
              <NotificationBell triggerClassName={headerIconClass} />
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className={`relative hidden rounded-full md:inline-flex ${headerIconClass}`}
              asChild
            >
              <Link to="/cart" aria-label={t("nav.cart")}>
                <ShoppingCart className="size-5" />
                {cart.itemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-white">
                    {cart.itemCount > 99 ? "99+" : cart.itemCount}
                  </Badge>
                )}
              </Link>
            </Button>
            {user ? (
              <AccountMenuButton />
            ) : (
              <Button
                size="sm"
                className="hidden bg-accent hover:bg-accent/90 sm:inline-flex"
                asChild
              >
                <Link to="/login">{t("nav.login")}</Link>
              </Button>
            )}
          </div>
        </div>

        <nav className="hidden border-t border-white/15 py-2 md:flex md:items-center md:justify-center md:gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
              activeProps={{ className: "text-white font-semibold" }}
              activeOptions={item.exact ? { exact: true } : undefined}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
