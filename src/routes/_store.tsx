import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";

import { CompareBar } from "@/components/storefront/compare-bar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { CompareProvider } from "@/hooks/use-compare";
import { captureAffiliateRefFromUrl } from "@/lib/affiliate-cookie";

export const Route = createFileRoute("/_store")({
  component: StoreLayout,
});

function StoreLayout() {
  useEffect(() => {
    captureAffiliateRefFromUrl();
  }, []);

  return (
    <CompareProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <StorefrontHeader />
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
        <StorefrontFooter />
        <CompareBar />
        <AppBottomNav />
      </div>
    </CompareProvider>
  );
}
