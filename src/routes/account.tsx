import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AccountProfileSummary } from "@/components/account/account-profile-summary";
import { RequireAuthGate } from "@/components/auth/require-auth-gate";
import { AccountSidebar } from "@/components/layout/account-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { storeSectionClasses } from "@/components/layout/store-page";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { PageLoading } from "@/components/loading";

export const Route = createFileRoute("/account")({
  ssr: false,
  component: AccountLayout,
});

function AccountLoadingShell() {
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

function AccountLayout() {
  return (
    <RequireAuthGate loadingShell={<AccountLoadingShell />}>
      <div className="flex min-h-screen flex-col bg-background">
        <StorefrontHeader />
        <div className="flex-1 bg-muted/20 pb-20 lg:pb-0">
          <div
            className={storeSectionClasses(
              "grid gap-6 md:grid-cols-[minmax(0,15rem)_1fr] md:gap-8 lg:grid-cols-[minmax(0,16rem)_1fr] lg:gap-10",
            )}
          >
            <div className="hidden md:block">
              <AccountSidebar />
            </div>
            <div className="min-w-0">
              <div className="mb-6 md:hidden">
                <AccountProfileSummary showNav={false} />
              </div>
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
