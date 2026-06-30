import { createFileRoute, Outlet } from "@tanstack/react-router";

import { RequireAuthGate } from "@/components/auth/require-auth-gate";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { DealerSidebar } from "@/components/layout/dealer-sidebar";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { storeSectionClasses } from "@/components/layout/store-page";
import { PageLoading } from "@/components/loading";

export const Route = createFileRoute("/dealer")({
  ssr: false,
  component: DealerLayout,
});

function DealerLoadingShell() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontHeader />
      <div className="flex-1 bg-muted/20 pb-20 lg:pb-0">
        <div className={storeSectionClasses()}>
          <PageLoading variant="dashboard" />
        </div>
      </div>
      <StorefrontFooter />
      <AppBottomNav />
    </div>
  );
}

function DealerLayout() {
  return (
    <RequireAuthGate requireDealer loadingShell={<DealerLoadingShell />}>
      <div className="flex min-h-screen flex-col bg-background">
        <StorefrontHeader />
        <div className="flex-1 bg-muted/20 pb-20 lg:pb-0">
          <div
            className={storeSectionClasses(
              "grid gap-6 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-8 lg:gap-10",
            )}
          >
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
    </RequireAuthGate>
  );
}
