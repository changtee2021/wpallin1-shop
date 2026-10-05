import { Link } from "@tanstack/react-router";

import { SectionHeading } from "@/components/brand/section-heading";
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
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          <SectionHeading
            as="h1"
            kicker="Legal"
            title={content.title}
            description={content.lastUpdated}
          />
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20 lg:px-8 lg:py-16">
        <nav aria-label={content.title} className="hidden lg:block">
          <ol className="sticky top-28 space-y-1">
            {content.sections.map((section, index) => (
              <li key={section.title}>
                <a
                  href={`#legal-${index + 1}`}
                  className="flex min-h-11 items-center gap-3 text-sm text-muted-foreground hover:text-primary"
                >
                  <span className="brand-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="line-clamp-1">{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="max-w-3xl space-y-10">
          {content.sections.map((section, index) => (
            <section
              key={section.title}
              id={`legal-${index + 1}`}
              className="scroll-mt-28"
            >
              <h2 className="text-xl font-semibold">{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-3 text-base leading-7 text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
          <p className="border-t border-border pt-8 text-sm text-muted-foreground">
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("nav.contact")}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
