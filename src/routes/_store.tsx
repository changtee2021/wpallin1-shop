import { createFileRoute, Outlet } from "@tanstack/react-router";

import { CompareBar } from "@/components/storefront/compare-bar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { CompareProvider } from "@/hooks/use-compare";
import { COMMERCE_ENABLED } from "@/lib/features";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <StorefrontHeader />
        <main
          id="main-content"
          className={cn("flex-1", COMMERCE_ENABLED && "pb-20 lg:pb-0")}
        >
          <Outlet />
        </main>
        <StorefrontFooter />
        {COMMERCE_ENABLED ? (
          <>
            <CompareBar />
            <AppBottomNav />
          </>
        ) : null}
      </div>
    </CompareProvider>
  );
}
