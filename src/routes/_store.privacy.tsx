import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/components/legal/legal-page-view";

export const Route = createFileRoute("/_store/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return <LegalPageView page="privacy" />;
}
