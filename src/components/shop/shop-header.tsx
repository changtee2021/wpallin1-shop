import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { AccountMenuButton } from "@/components/account/account-menu-button";
import { ArrowFillButton } from "@/components/brand/arrow-fill-link";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { DealerGateDialog } from "@/components/shop/dealer-gate-dialog";
import { ShopSearchForm } from "@/components/shop/shop-search-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useDealerAccount } from "@/hooks/use-dealer-account";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const iconButtonClass =
  "size-11 rounded-full text-white hover:bg-white/10 hover:text-white";

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

function DealerCodeTag() {
  const { data: account } = useDealerAccount();
  if (!account?.dealerCode) return null;
  return (
    <Link
      to="/dealer"
      className="mr-1 hidden min-h-11 items-center gap-2 rounded-full px-3 text-white/85 transition-colors hover:bg-white/10 hover:text-white sm:inline-flex"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      <span className="brand-index text-xs">{account.dealerCode}</span>
    </Link>
  );
}

export function ShopHeader() {
  const { user, isDealer, loading } = useAuth();
  const { cart } = useCart();
  const returnTo = useLocation({ select: (location) => location.href });
  const floating = useScrolledPast(24);
  const [gateOpen, setGateOpen] = useState(false);

  return (
    <>
      <div aria-hidden className="h-[7.5rem] md:h-16 lg:h-[72px]" />
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 text-white transition-[padding] duration-500 ease-out",
          floating && "lg:px-4 lg:pt-3",
        )}
      >
        <div
          className={cn(
            "mx-auto bg-primary transition-[max-width,background-color,border-radius,box-shadow] duration-500 ease-out",
            floating
              ? "shadow-[0_10px_30px_-18px_rgb(0_0_0/0.5)] lg:max-w-6xl lg:rounded-full lg:bg-[oklch(0.33_0.055_182/0.86)] lg:ring-1 lg:ring-white/20 lg:backdrop-blur-md"
              : "max-w-full",
          )}
        >
          <div
            className={cn(
              "mx-auto flex max-w-7xl items-center gap-3 transition-[height,padding] duration-500 ease-out lg:gap-8",
              floating
                ? "h-16 px-4 sm:px-6 lg:h-16 lg:pr-2 lg:pl-6"
                : "h-16 px-4 sm:px-6 lg:h-[72px] lg:px-8",
            )}
          >
            <Link
              to="/shop"
              className="flex shrink-0 items-center gap-3"
              aria-label="WP ALL Shop — หน้าแรก"
            >
              <img
                src="/brand/logo-white.png"
                alt="WP ALL"
                className="h-9 w-auto object-contain mix-blend-screen lg:h-10"
              />
              <span className="brand-kicker border-l border-white/25 pl-3 text-white/80">
                Shop
              </span>
            </Link>

            <ShopSearchForm className="hidden max-w-xl min-w-0 flex-1 md:flex" />

            <div className="ml-auto flex items-center gap-1">
              <a
                href={siteConfig.websiteUrl}
                className="hidden min-h-11 items-center gap-1 px-3 text-[15px] text-white/75 transition-colors hover:text-white xl:inline-flex"
              >
                wpallin1.com
                <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
              {isDealer ? <DealerCodeTag /> : null}
              {user ? (
                <NotificationBell triggerClassName={iconButtonClass} />
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                className={cn("relative", iconButtonClass)}
                asChild
              >
                <Link to="/cart" aria-label="ตะกร้าสินค้า">
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
                <Link
                  to="/login"
                  search={{ tab: "login", redirect: returnTo }}
                  className="inline-flex min-h-11 items-center whitespace-nowrap px-3 text-[15px] text-white/85 transition-colors hover:text-white"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
              {!loading && !isDealer ? (
                <span className="ml-1 hidden lg:block">
                  <ArrowFillButton onClick={() => setGateOpen(true)}>
                    เปิดบัญชีตัวแทน
                  </ArrowFillButton>
                </span>
              ) : null}
            </div>
          </div>
          <div className="px-4 pb-3 md:hidden">
            <ShopSearchForm />
          </div>
        </div>
      </header>
      <DealerGateDialog open={gateOpen} onOpenChange={setGateOpen} />
    </>
  );
}
