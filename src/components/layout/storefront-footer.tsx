import { Link } from "@tanstack/react-router";

import { openCookieSettings } from "@/components/cookie-consent";
import { CompanyContactDetails } from "@/components/layout/company-contact-details";
import { SocialLinks } from "@/components/layout/social-links";
import { useLocaleControl, useT } from "@/i18n";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-sm text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm sm:min-h-9";

function FooterHeading({ children }: { children: string }) {
  return (
    <h3 className="text-sm font-bold tracking-wide text-foreground">{children}</h3>
  );
}

function FooterLocaleToggle() {
  const { locale, setLocale } = useLocaleControl();

  return (
    <div
      className="inline-flex rounded-lg border border-white/20 p-0.5"
      role="group"
      aria-label={locale === "en" ? "Language" : "ภาษา"}
    >
      {(["th", "en"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          aria-pressed={locale === option}
          className={cn(
            "min-h-9 min-w-11 rounded-md px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70",
            locale === option
              ? "bg-white text-foreground"
              : "text-white/70 hover:text-white",
          )}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function StorefrontFooter() {
  const { t, locale } = useT();
  const year = new Date().getFullYear();
  const legalName =
    locale === "en" ? siteConfig.legalNameEn : siteConfig.legalName;

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          <div>
            <div className="text-xl font-bold tracking-wide text-primary uppercase">
              {siteConfig.name}
            </div>
            <p className="mt-1 text-sm font-semibold text-accent">{siteConfig.slogan}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground text-pretty">
              {t("footer.description")}
            </p>
            <SocialLinks className="mt-4" size={44} />
            <div className="mt-4 space-y-2 text-sm">
              <a
                href={`mailto:${siteConfig.emailTo}`}
                className="inline-flex min-h-11 break-all font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm sm:min-h-8"
              >
                {siteConfig.emailTo}
              </a>
              <p className="leading-5 text-foreground/80">
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
                <br />
                {siteConfig.address.city}
                {locale === "en" ? (
                  <>
                    <br />
                    {siteConfig.address.country}
                  </>
                ) : null}
              </p>
            </div>
          </div>

          <div>
            <FooterHeading>{t("footer.links")}</FooterHeading>
            <ul className="mt-3 space-y-0.5">
              <li>
                <Link to="/contact" search={{ topic: "quote" }} className={footerLinkClass}>
                  {t("footer.ctaQuote")}
                </Link>
              </li>
              <li>
                <Link to="/catalogs" className={footerLinkClass}>
                  {t("footer.ctaCatalogs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  search={{ topic: "factory-visit" }}
                  className={footerLinkClass}
                >
                  {t("footer.ctaFactory")}
                </Link>
              </li>
              <li>
                <Link to="/dealer/register" className={footerLinkClass}>
                  {t("footer.ctaDealer")}
                </Link>
              </li>
              <li>
                <Link to="/contact" search={{ topic: "project" }} className={footerLinkClass}>
                  {t("footer.ctaContact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <FooterHeading>{t("footer.contact")}</FooterHeading>
            <CompanyContactDetails
              className="mt-3"
              compact
              showQr={false}
              showChannels={false}
              showEmail={false}
              showAddress={false}
            />
          </div>
        </div>
      </div>

      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3.5 text-xs text-background/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            {siteConfig.name} © {year} – {legalName}. {t("footer.rights")}
          </p>
          <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0">
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm sm:min-h-0"
            >
              {t("footer.privacy")}
            </Link>
            <span className="mx-3 hidden text-background/30 sm:inline" aria-hidden>
              |
            </span>
            <Link
              to="/cookies"
              className="inline-flex min-h-11 items-center hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm sm:min-h-0"
            >
              {t("footer.cookies")}
            </Link>
            <span className="mx-3 hidden text-background/30 sm:inline" aria-hidden>
              |
            </span>
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm sm:min-h-0"
            >
              {t("footer.terms")}
            </Link>
            <span className="mx-3 hidden text-background/30 sm:inline" aria-hidden>
              |
            </span>
            <button
              type="button"
              onClick={openCookieSettings}
              className="inline-flex min-h-11 items-center text-left text-background/70 hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 rounded-sm sm:min-h-0"
            >
              {t("footer.cookieSettings")}
            </button>
            <span className="mx-3 hidden text-background/30 sm:inline" aria-hidden>
              |
            </span>
            <FooterLocaleToggle />
          </nav>
        </div>
      </div>
    </footer>
  );
}
