import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/components/legal/legal-page-view";

export const Route = createFileRoute("/_store/cookies")({
  component: CookiesPage,
});

function CookiesPage() {
  return <LegalPageView page="cookies" />;
}
