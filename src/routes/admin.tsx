import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminCommandPalette } from "@/components/admin/shared/admin-command-palette";
import { RequireAuthGate } from "@/components/auth/require-auth-gate";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { storeSectionClasses } from "@/components/layout/store-page";
import { PageLoading } from "@/components/loading";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLoadingShell() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20 lg:pb-0">
      <StorefrontHeader />
      <div className={storeSectionClasses("max-w-7xl")}>
        <PageLoading variant="dashboard" />
      </div>
      <AppBottomNav />
    </div>
  );
}

function AdminLayout() {
  return (
    <RequireAuthGate requireAdmin loadingShell={<AdminLoadingShell />}>
      <div className="min-h-screen bg-muted/30 pb-20 lg:pb-0">
        <StorefrontHeader />
        <AdminCommandPalette />
        <div
          className={storeSectionClasses(
            "max-w-7xl grid gap-6 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-8 lg:gap-10",
          )}
        >
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
        <AppBottomNav />
      </div>
    </RequireAuthGate>
  );
}
