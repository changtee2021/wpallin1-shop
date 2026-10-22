import { createFileRoute, redirect } from "@tanstack/react-router";

import { requireCommerce } from "@/lib/commerce-guard";
import { noIndexHead } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: noIndexHead,
  beforeLoad: () => {
    requireCommerce();
    throw redirect({ to: "/login", search: { tab: "signup" } });
  },
});
