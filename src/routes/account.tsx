import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AccountProfileSummary } from "@/components/account/account-profile-summary";
import { AccountSidebar } from "@/components/layout/account-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontFooter } from "@/components/layout/storefront-footer";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { requireAuth } from "@/lib/route-guards";

export const Route = createFileRoute("/account")({
  ssr: false,
  beforeLoad: async () => {
    const user = await requireAuth();
    return { user };
  },
  component: AccountLayout,
});

function AccountLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StorefrontHeader />
      <div className="flex-1 bg-muted/20 pb-20 md:pb-0">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[240px_1fr]">
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
  );
}
