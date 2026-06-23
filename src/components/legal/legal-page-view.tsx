import { Link } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/page-header";
import { getLegalPage } from "@/lib/legal-content";
import { useT } from "@/i18n";
import type { Locale } from "@/i18n/types";

type LegalPageProps = {
  page: "terms" | "privacy" | "cookies";
};

export function LegalPageView({ page }: LegalPageProps) {
  const { locale, t } = useT();
  const content = getLegalPage(page, locale as Locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader title={content.title} description={content.lastUpdated} />
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold">{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="mt-2 text-muted-foreground leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        <Link to="/contact" className="underline hover:text-foreground">
          {t("nav.contact")}
        </Link>
      </p>
    </div>
  );
}
