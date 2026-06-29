import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/inspiration")({
  component: InspirationLayout,
});

function InspirationLayout() {
  return <Outlet />;
}
