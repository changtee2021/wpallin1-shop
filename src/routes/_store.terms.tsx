import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/components/legal/legal-page-view";

export const Route = createFileRoute("/_store/terms")({
  component: TermsPage,
});

function TermsPage() {
  return <LegalPageView page="terms" />;
}
