import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/cart")({
  component: CartLayout,
});

function CartLayout() {
  return <Outlet />;
}
