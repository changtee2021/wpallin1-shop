import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireCommerce } from "@/lib/commerce-guard";

export const Route = createFileRoute("/_store/cart")({
  beforeLoad: requireCommerce,
  component: CartLayout,
});

function CartLayout() {
  return <Outlet />;
}
