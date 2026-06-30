import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminCommandPalette } from "@/components/admin/shared/admin-command-palette";
import { RequireAuthGate } from "@/components/auth/require-auth-gate";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { PageLoading } from "@/components/loading";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLoadingShell() {
  return (
    <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
      <StorefrontHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageLoading variant="dashboard" />
      </div>
      <AppBottomNav />
    </div>
  );
}

function AdminLayout() {
  return (
    <RequireAuthGate requireAdmin loadingShell={<AdminLoadingShell />}>
      <div className="min-h-screen bg-muted/30 pb-20 md:pb-0">
        <StorefrontHeader />
        <AdminCommandPalette />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-[220px_1fr]">
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
