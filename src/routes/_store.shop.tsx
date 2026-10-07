import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { COMMERCE_ENABLED, SHOP_URL } from "@/lib/features";

/** The shop lives on its own build; the brand site forwards `/shop` there (or to its price-free catalogue). */
export const Route = createFileRoute("/_store/shop")({
  beforeLoad: ({ location }) => {
    if (COMMERCE_ENABLED) return;
    if (SHOP_URL) {
      throw redirect({
        href: `${SHOP_URL}${location.href}`,
        statusCode: 302,
      });
    }
    throw redirect({ to: "/products", replace: true, statusCode: 301 });
  },
  component: Outlet,
});
