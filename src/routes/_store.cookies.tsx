import { createFileRoute } from "@tanstack/react-router";

import { LegalPageView } from "@/components/legal/legal-page-view";
import { DEFAULT_LOCALE } from "@/i18n";
import { legalPageMeta } from "@/lib/legal-content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/cookies")({
  head: ({ match }) => {
    const locale = match.context.locale ?? DEFAULT_LOCALE;
    const meta = legalPageMeta("cookies", locale);
    return pageHead({ locale, ...meta, path: "/cookies" });
  },
  component: CookiesPage,
});

function CookiesPage() {
  return <LegalPageView page="cookies" />;
}
