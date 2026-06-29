import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/page-header";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/inspiration")({
  component: AdminInspirationLayout,
});

const TABS = [
  { to: "/admin/inspiration" as const, label: "ภาพห้อง", exact: true },
  {
    to: "/admin/inspiration/materials" as const,
    label: "วัสดุ",
    exact: false,
  },
];

function AdminInspirationLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isRoomEditor = pathname.includes("/admin/inspiration/rooms/");
  const isMaterialEditor =
    pathname.includes("/admin/inspiration/materials/") &&
    pathname !== "/admin/inspiration/materials";

  if (isRoomEditor || isMaterialEditor) {
    return <Outlet />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="แรงบันดาลใจ (Inspiration)"
        description="จัดการภาพห้องและวัสดุสำหรับหน้าร้าน"
      />

      <div className="flex gap-1 rounded-xl bg-muted/60 p-1 ring-1 ring-black/5">
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.to || pathname === `${tab.to}/`
            : pathname.startsWith(tab.to);
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                "flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium transition",
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
