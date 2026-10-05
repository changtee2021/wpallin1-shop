import { redirect } from "@tanstack/react-router";

import { COMMERCE_ENABLED } from "@/lib/features";

/** `beforeLoad` guard for cart / checkout / account screens while the site runs in brand mode. */
export function requireCommerce() {
  if (!COMMERCE_ENABLED) {
    throw redirect({ to: "/", replace: true });
  }
}
