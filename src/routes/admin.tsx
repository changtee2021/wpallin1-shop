import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AdminCommandPalette } from "@/components/admin/shared/admin-command-palette";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AppBottomNav } from "@/components/layout/app-bottom-nav";
import { StorefrontHeader } from "@/components/layout/storefront-header";
import { requireAdmin } from "@/lib/route-guards";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => requireAdmin(),
  component: AdminLayout,
});

function AdminLayout() {
  return (
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
  );
}
