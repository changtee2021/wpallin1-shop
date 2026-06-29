import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { PageLoading } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  CustomAdminProvider,
  useCustomAdmin,
} from "@/components/admin/custom/custom-admin-context";

export const Route = createFileRoute("/admin/custom")({
  component: AdminCustomLayout,
});

const TABS = [
  { to: "/admin/custom" as const, label: "ภาพรวม", exact: true },
  { to: "/admin/custom/projects" as const, label: "Projects", exact: false },
  { to: "/admin/custom/rules" as const, label: "Preview Rules", exact: false },
  { to: "/admin/custom/fabrics" as const, label: "ผ้า", exact: false },
];

function AdminCustomLayout() {
  return (
    <CustomAdminProvider>
      <AdminCustomLayoutInner />
    </CustomAdminProvider>
  );
}

function AdminCustomLayoutInner() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const { loading } = useCustomAdmin();

  if (loading) {
    return <PageLoading variant="form" />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          title="Custom Configurator"
          description="สร้างสินค้า Custom + กำหนดภาพ Preview ตามเงื่อนไข"
        />
        <Button variant="outline" size="sm" asChild>
          <Link to="/configurator" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-4" />
            ดู Configurator
          </Link>
        </Button>
      </div>

      <ol className="grid gap-2 text-sm sm:grid-cols-4">
        {[
          "1. สร้าง Project",
          "2. เลือกหมวด",
          "3. กฎ + อัปรูป",
          "4. บันทึก",
        ].map((step) => (
          <li
            key={step}
            className="rounded-lg border bg-muted/30 px-3 py-2 text-center text-xs font-medium sm:text-sm"
          >
            {step}
          </li>
        ))}
      </ol>

      <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted/60 p-1 ring-1 ring-black/5">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.to || pathname === `${tab.to}/`
            : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition",
                active
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
