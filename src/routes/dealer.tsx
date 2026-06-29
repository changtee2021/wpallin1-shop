import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { DealerSidebar } from "@/components/layout/dealer-sidebar";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { requireDealer } from "@/lib/route-guards";

export const Route = createFileRoute("/dealer")({
  ssr: false,
  beforeLoad: async () => requireDealer(),
  component: DealerLayout,
});

function DealerLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontHeader />
      <div className="flex-1 bg-muted/20 pb-20 md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[260px_1fr]">
          <div className="hidden md:block">
            <DealerSidebar />
          </div>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
      <StorefrontFooter />
      <AppBottomNav />
    </div>
  );
}
