import { Link } from "@tanstack/react-router";
import { BookOpen, Factory, FileText, Handshake, MessageCircle } from "lucide-react";

import { openCookieSettings } from "@/components/cookie-consent";
import { LazyMapsEmbed } from "@/components/layout/lazy-maps-embed";
import { SocialLinks } from "@/components/layout/social-links";
import { useLocaleControl, useT } from "@/i18n";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const ctaClass = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-3.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/90 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted/70 active:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
} as const;

function FooterHeading({ children }: { children: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">
        {children}
      </h3>
      <div className="mt-1 h-0.5 w-10 bg-accent" />
    </div>
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
  const officeLabel =
    locale === "en" ? siteConfig.officeLabelEn : siteConfig.officeLabel;

  return (
    <footer className="mt-auto border-t border-border bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 md:gap-8 lg:grid-cols-[1.15fr_1fr_0.95fr] lg:gap-10">
          <div>
            <div className="flex items-start gap-3">
              <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black p-1.5">
                <img
                  src="/brand/logo-color.png"
                  alt=""
                  width={96}
                  height={56}
                  className="h-10 w-auto object-contain sm:h-14"
                />
              </span>
              <div className="min-w-0">
                <div className="text-lg font-bold tracking-wide text-primary uppercase sm:text-xl">
                  {siteConfig.name}
                </div>
                <div className="text-sm font-semibold leading-5 text-accent">
                  {siteConfig.slogan}
                </div>
                <div className="text-sm font-light leading-5 text-foreground">
                  {siteConfig.sloganSub}
                </div>
              </div>
            </div>
            <div className="mt-4 h-px w-16 bg-accent" />
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground text-pretty">
              {t("footer.description")}
            </p>
            <SocialLinks className="mt-5" />
            <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link
                to="/contact"
                search={{ topic: "quote" }}
                className={ctaClass.primary}
              >
                <FileText className="size-4 shrink-0" strokeWidth={2.1} aria-hidden />
                {t("footer.ctaQuote")}
              </Link>
              <Link to="/catalogs" className={ctaClass.secondary}>
                <BookOpen className="size-4 shrink-0" strokeWidth={2.1} aria-hidden />
                {t("footer.ctaCatalogs")}
              </Link>
              <Link
                to="/contact"
                search={{ topic: "factory-visit" }}
                className={ctaClass.secondary}
              >
                <Factory className="size-4 shrink-0" strokeWidth={2.1} aria-hidden />
                {t("footer.ctaFactory")}
              </Link>
              <Link to="/dealer/register" className={ctaClass.secondary}>
                <Handshake className="size-4 shrink-0" strokeWidth={2.1} aria-hidden />
                {t("footer.ctaDealer")}
              </Link>
              <Link
                to="/contact"
                search={{ topic: "project" }}
                className={cn(ctaClass.secondary, "sm:col-span-2")}
              >
                <MessageCircle className="size-4 shrink-0" strokeWidth={2.1} aria-hidden />
                {t("footer.ctaContact")}
              </Link>
            </div>
          </div>

          <div>
            <FooterHeading>{t("footer.contact")}</FooterHeading>

            <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("footer.officeTel")}
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-muted-foreground">{officeLabel}</span>
                <a
                  href={`tel:${siteConfig.phoneTel}`}
                  className="shrink-0 min-h-11 inline-flex items-center font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                >
                  {siteConfig.phoneDisplay}
                </a>
              </li>
            </ul>

            <div className="mt-5 space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Email</span>
                <br />
                <a
                  href={`mailto:${siteConfig.emailTo}`}
                  className="font-medium break-all text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                >
                  {siteConfig.emailTo}
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">LINE</span>
                <br />
                <a
                  href={siteConfig.lineUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center font-semibold text-[#06C755] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
                >
                  {siteConfig.lineId}
                </a>
              </p>
              <p className="leading-6 text-foreground/80">
                {siteConfig.address.line1}
                <br />
                {siteConfig.address.line2}
                <br />
                {siteConfig.address.city}
              </p>
            </div>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <FooterHeading>{t("footer.location")}</FooterHeading>
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
              <LazyMapsEmbed
                title={t("footer.mapTitle")}
                src={siteConfig.mapsEmbedUrl}
                loadLabel={t("footer.loadMap")}
                hintLabel="Google Maps"
                className="aspect-[4/3] w-full lg:aspect-square"
              />
            </div>
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              {t("footer.openMaps")}
            </a>
          </div>
        </div>
      </div>

      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-background/70 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-0 sm:gap-y-1">
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
          </nav>
          <div className="flex flex-wrap items-center gap-2.5">
            <FooterLocaleToggle />
            <p>
              © {year} {legalName}. {t("footer.rights")}.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
