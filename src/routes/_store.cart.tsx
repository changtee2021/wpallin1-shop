import { createFileRoute, Outlet } from "@tanstack/react-router";

import { requireCommerce } from "@/lib/commerce-guard";
import { noIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/cart")({
  beforeLoad: requireCommerce,
  head: noIndexHead,
  component: CartLayout,
});

function CartLayout() {
  return <Outlet />;
}
