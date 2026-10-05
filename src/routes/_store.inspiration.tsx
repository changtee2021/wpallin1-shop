import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { COMMERCE_ENABLED } from "@/lib/features";

export const Route = createFileRoute("/_store/inspiration")({
  beforeLoad: () => {
    // Room hotspots link to DB product slugs that only exist on the commerce storefront.
    if (!COMMERCE_ENABLED) throw redirect({ to: "/projects", replace: true });
  },
  component: InspirationLayout,
});

function InspirationLayout() {
  return <Outlet />;
}
