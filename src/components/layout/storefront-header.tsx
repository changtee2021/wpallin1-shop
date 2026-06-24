import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { NotificationBell } from "@/components/notifications/notification-bell";
import { StorefrontMobileMenu } from "@/components/layout/storefront-mobile-menu";
import { SearchBar } from "@/components/storefront/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

const navLinks = [
  { to: "/shop" as const, key: "nav.shop" as const },
  { to: "/configurator" as const, key: "nav.configurator" as const },
  { to: "/about" as const, key: "nav.about" as const },
];

export function StorefrontHeader() {
  const { t } = useT();
  const { user, isAdmin, isDealer } = useAuth();
  const { cart } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-2 sm:h-16 sm:gap-3 md:gap-6">
          <Link to="/" className="flex shrink-0 items-center">
            <img
              src="/brand/logo-color.png"
              alt="WP ALL"
              className="h-8 w-auto object-contain sm:h-10"
            />
          </Link>

          <StorefrontMobileMenu />

          <div className="min-w-0 flex-1 lg:hidden">
            <SearchBar compact />
          </div>

          <div className="hidden min-w-0 flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            {user ? <NotificationBell /> : null}
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hidden md:inline-flex"
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
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/account" search={{ tab: "dashboard" }}>
                    {t("nav.account")}
                  </Link>
                </Button>
                {isDealer && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:inline-flex"
                    asChild
                  >
                    <Link to="/dealer">{t("nav.dealer")}</Link>
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden lg:inline-flex"
                    asChild
                  >
                    <Link to="/admin">{t("nav.admin")}</Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:inline-flex"
                  asChild
                >
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
                <Button
                  size="sm"
                  className="hidden bg-accent hover:bg-accent/90 sm:inline-flex"
                  asChild
                >
                  <Link to="/signup">{t("nav.signup")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        <nav className="hidden border-t py-2 lg:flex lg:items-center lg:gap-6">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
