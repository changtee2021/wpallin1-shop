import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_store/quick-order")({
  beforeLoad: () => {
    throw redirect({ to: "/order" });
  },
});
