import { Link, useMatchRoute } from "@tanstack/react-router";
import { MessageCircle, ShoppingCart, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountMenuButton } from "@/components/account/account-menu-button";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { HeaderSearch } from "@/components/storefront/search-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useChatUiSafe } from "@/hooks/use-chat-ui";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/" as const, key: "nav.home" as const, exact: true },
  { to: "/inspiration" as const, key: "nav.inspiration" as const },
  { to: "/shop" as const, key: "nav.shop" as const },
  { to: "/catalogs" as const, key: "nav.catalogs" as const },
  { to: "/dealer/register" as const, key: "nav.dealerRegister" as const },
  { to: "/about" as const, key: "nav.about" as const },
];

const headerIconClass = "text-white hover:bg-white/10 hover:text-white";

export function StorefrontHeader() {
  const { t } = useT();
  const { user } = useAuth();
  const { openChat } = useChatUiSafe();
  const { cart } = useCart();
  const matchRoute = useMatchRoute();
  const isHome = Boolean(matchRoute({ to: "/", fuzzy: false }));
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setScrolled(false);
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const overlayHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "z-40 text-white transition-colors duration-200",
        overlayHero
          ? "fixed inset-x-0 top-0 bg-transparent shadow-none"
          : isHome
            ? "fixed inset-x-0 top-0 bg-gradient-to-r from-primary to-primary/80 shadow-md"
            : "sticky top-0 bg-gradient-to-r from-primary to-primary/80 shadow-md",
      )}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Mobile: logo · search · bell */}
        <div className="flex h-14 items-center gap-1 py-1 md:hidden">
          <Link to="/" className="flex shrink-0 items-center" aria-label={t("nav.home")}>
            <img
              src="/brand/logo-white.png"
              alt="WP ALL"
              className="h-8 w-auto object-contain mix-blend-screen"
            />
          </Link>
          <div className="ml-auto flex items-center gap-0.5">
            <HeaderSearch triggerClassName={headerIconClass} />
            {user ? (
              <NotificationBell triggerClassName={headerIconClass} />
            ) : null}
          </div>
        </div>

        {/* Desktop: logo · nav · search · actions */}
        <div className="hidden h-16 items-center gap-3 md:flex lg:gap-8">
          <Link to="/" className="flex shrink-0 items-center" aria-label={t("nav.home")}>
            <img
              src="/brand/logo-white.png"
              alt="WP ALL"
              className="h-10 w-auto object-contain mix-blend-screen"
            />
          </Link>
          <nav className="flex min-w-0 shrink items-center gap-2.5 overflow-x-auto lg:gap-6">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[13px] font-normal whitespace-nowrap text-white/80 transition-colors hover:text-white lg:text-sm"
                activeProps={{ className: "text-white font-medium" }}
                activeOptions={item.exact ? { exact: true } : undefined}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-1 lg:gap-2">
            <Button
              size="sm"
              className="btn-shimmer rounded-full bg-accent px-4 hover:bg-accent/90 lg:px-5"
              asChild
            >
              <Link to="/order">
                <Zap className="size-4 lg:mr-1.5" />
                <span className="hidden lg:inline">{t("nav.order")}</span>
              </Link>
            </Button>
            <HeaderSearch triggerClassName={headerIconClass} />
            {user ? (
              <NotificationBell triggerClassName={headerIconClass} />
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-full ${headerIconClass}`}
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
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full ${headerIconClass}`}
                  onClick={() => openChat()}
                  aria-label={t("account.chat")}
                >
                  <MessageCircle className="size-5" />
                </Button>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90"
                  asChild
                >
                  <Link to="/login">{t("nav.login")}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
