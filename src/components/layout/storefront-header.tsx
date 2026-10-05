import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, Globe, Menu, Phone, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountMenuButton } from "@/components/account/account-menu-button";
import { ArrowFillLink } from "@/components/brand/arrow-fill-link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useLocaleControl, useT } from "@/i18n";
import type { Locale, TranslationKey } from "@/i18n/types";
import { COMMERCE_ENABLED } from "@/lib/features";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type NavItem = {
  to: "/products" | "/projects" | "/about" | "/catalogs";
  key: TranslationKey;
};

export const SITE_NAV: NavItem[] = [
  { to: "/products", key: "nav.products" },
  { to: "/projects", key: "nav.projects" },
  { to: "/catalogs", key: "nav.catalogs" },
  { to: "/about", key: "nav.about" },
];

const headerIconClass =
  "size-11 rounded-full text-white hover:bg-white/10 hover:text-white";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "th", label: "ไทย" },
  { value: "en", label: "English" },
];

export function LocaleToggle({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const { t } = useT();
  const { locale, setLocale } = useLocaleControl();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={t("site.lang.label")}
          className={cn(
            "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            tone === "light"
              ? "text-white/85 hover:bg-white/10 hover:text-white"
              : "text-foreground hover:bg-muted",
            className,
          )}
        >
          <Globe className="size-4" aria-hidden />
          {locale.toUpperCase()}
          <ChevronDown className="size-3.5 opacity-70" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => setLocale(value as Locale)}
        >
          {LOCALE_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className="min-h-10"
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function useScrolledPast(offset: number) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [offset]);

  return scrolled;
}

function CommerceActions() {
  const { t } = useT();
  const { user } = useAuth();
  const { cart } = useCart();

  return (
    <>
      {user ? <NotificationBell triggerClassName={headerIconClass} /> : null}
      <Button
        variant="ghost"
        size="icon"
        className={cn("relative", headerIconClass)}
        asChild
      >
        <Link to="/cart" aria-label={t("nav.cart")}>
          <ShoppingCart className="size-5" />
          {cart.itemCount > 0 ? (
            <Badge className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-accent p-0 text-[10px] text-white">
              {cart.itemCount > 99 ? "99+" : cart.itemCount}
            </Badge>
          ) : null}
        </Link>
      </Button>
      {user ? (
        <AccountMenuButton />
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="/login">{t("nav.login")}</Link>
        </Button>
      )}
    </>
  );
}

function MobileMenu() {
  const { t } = useT();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={headerIconClass}
          aria-label={t("nav.menu")}
        >
          <Menu className="size-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex w-full max-w-sm flex-col gap-0 bg-primary-deep p-0 text-white sm:max-w-sm"
      >
        <SheetHeader className="border-b border-white/10 px-6 py-5">
          <SheetTitle className="text-left text-white">
            <img
              src="/brand/logo-white.png"
              alt="WP ALL"
              className="h-9 w-auto mix-blend-screen"
            />
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-6 py-4">
          <ol className="divide-y divide-white/10">
            {SITE_NAV.map((item, index) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-baseline gap-4 py-3 text-2xl font-semibold text-white/90 hover:text-white"
                  activeProps={{ className: "text-white" }}
                >
                  <span className="brand-index text-white/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t(item.key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/partners"
                onClick={() => setOpen(false)}
                className="flex min-h-14 items-baseline gap-4 py-3 text-2xl font-semibold text-white/90 hover:text-white"
              >
                <span className="brand-index text-white/40">05</span>
                {t("nav.partners")}
              </Link>
            </li>
          </ol>
        </nav>
        <div className="space-y-3 border-t border-white/10 px-6 py-5">
          <Button
            size="lg"
            className="h-12 w-full rounded-full bg-accent text-white hover:bg-accent/90"
            asChild
          >
            <Link to="/contact" onClick={() => setOpen(false)}>
              {t("site.cta.contactUs")}
            </Link>
          </Button>
          <div className="flex items-center justify-between gap-3">
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="inline-flex min-h-11 items-center gap-2 text-sm text-white/80 hover:text-white"
            >
              <Phone className="size-4" aria-hidden />
              {siteConfig.phoneDisplay}
            </a>
            <LocaleToggle />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function StorefrontHeader() {
  const { t } = useT();
  const isHome = useLocation({
    select: (location) => location.pathname === "/",
  });
  const floating = useScrolledPast(24);

  return (
    <>
      {isHome ? null : <div aria-hidden className="h-16 lg:h-[72px]" />}
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 text-white transition-[padding] duration-500 ease-out",
          floating && "px-3 pt-3 sm:px-4",
        )}
      >
        <div
          className={cn(
            "mx-auto transition-[max-width,background-color,border-radius,box-shadow] duration-500 ease-out",
            floating
              ? "max-w-6xl rounded-full bg-[oklch(0.33_0.055_182/0.86)] shadow-[0_14px_36px_-14px_rgb(0_0_0/0.45)] ring-1 ring-white/20 backdrop-blur-md"
              : cn(
                  "max-w-full rounded-none",
                  isHome ? "bg-transparent" : "bg-primary",
                ),
          )}
        >
          <div
            className={cn(
              "mx-auto flex max-w-7xl items-center gap-4 transition-[height,padding] duration-500 ease-out",
              floating
                ? "h-14 pr-2 pl-5 sm:pl-6 lg:h-16"
                : "h-16 px-4 sm:px-6 lg:h-[72px] lg:px-8",
            )}
          >
            <Link
              to="/"
              className="flex shrink-0 items-center"
              aria-label={t("nav.home")}
            >
              <img
                src="/brand/logo-white.png"
                alt="WP ALL"
                className="h-9 w-auto object-contain mix-blend-screen lg:h-10"
              />
            </Link>

            <nav
              aria-label="Main"
              className="hidden items-center gap-1 lg:flex"
            >
              {SITE_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group relative inline-flex min-h-11 items-center px-3.5 text-[15px] text-white/80 transition-colors hover:text-white"
                  activeProps={{ className: "text-white" }}
                >
                  {({ isActive }) => (
                    <>
                      {t(item.key)}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3.5 bottom-2 h-px origin-left bg-accent transition-transform duration-300",
                          isActive
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100",
                        )}
                      />
                    </>
                  )}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-1.5">
              <LocaleToggle className="hidden sm:inline-flex" />
              {COMMERCE_ENABLED ? <CommerceActions /> : null}
              <ArrowFillLink to="/contact" className="hidden md:inline-flex">
                {t("site.cta.contactUs")}
              </ArrowFillLink>
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
