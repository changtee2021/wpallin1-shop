import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/signup")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/login", search: { tab: "signup" } });
  },
});
