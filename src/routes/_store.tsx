import { createFileRoute, Outlet } from "@tanstack/react-router";

import { CompareBar } from "@/components/storefront/compare-bar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { ShopFooter } from "@/components/shop/shop-footer";
import { ShopHeader } from "@/components/shop/shop-header";
import { CompareProvider } from "@/hooks/use-compare";
import { COMMERCE_ENABLED, DEALER_ONLY_PURCHASE } from "@/lib/features";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

/** The shop header carries cart and account, so the mobile bottom nav is only for the open storefront. */
const SHOW_BOTTOM_NAV = COMMERCE_ENABLED && !DEALER_ONLY_PURCHASE;

function StoreLayout() {
  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {DEALER_ONLY_PURCHASE ? <ShopHeader /> : <StorefrontHeader />}
        <main
          id="main-content"
          className={cn("flex-1", SHOW_BOTTOM_NAV && "pb-20 lg:pb-0")}
        >
          <Outlet />
        </main>
        {DEALER_ONLY_PURCHASE ? <ShopFooter /> : <StorefrontFooter />}
        {SHOW_BOTTOM_NAV ? (
          <>
            <CompareBar />
            <AppBottomNav />
          </>
        ) : null}
      </div>
    </CompareProvider>
  );
}
