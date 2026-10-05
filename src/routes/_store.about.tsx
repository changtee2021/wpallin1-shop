import { createFileRoute } from "@tanstack/react-router";

import { AboutView } from "@/components/storefront/about/about-view";

export const Route = createFileRoute("/_store/about")({
  component: AboutPage,
});

function AboutPage() {
  return <AboutView />;
}
