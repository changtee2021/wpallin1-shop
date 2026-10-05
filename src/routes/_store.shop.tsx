import { createFileRoute, redirect } from "@tanstack/react-router";

/** Old storefront URL — the brand site lists products at `/products`. */
export const Route = createFileRoute("/_store/shop")({
  beforeLoad: () => {
    throw redirect({ to: "/products", replace: true, statusCode: 301 });
  },
});
