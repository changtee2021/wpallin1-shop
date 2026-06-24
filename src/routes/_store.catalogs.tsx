import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/catalogs")({
  component: CatalogsLayout,
});

function CatalogsLayout() {
  return <Outlet />;
}
