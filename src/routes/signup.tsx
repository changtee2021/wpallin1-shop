import { createFileRoute, redirect } from "@tanstack/react-router";

import { requireCommerce } from "@/lib/commerce-guard";

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: () => {
    requireCommerce();
    throw redirect({ to: "/login", search: { tab: "signup" } });
  },
});
