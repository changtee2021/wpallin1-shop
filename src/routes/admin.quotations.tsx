import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/quotations")({
  component: AdminQuotationsLayout,
});

function AdminQuotationsLayout() {
  return <Outlet />;
}
