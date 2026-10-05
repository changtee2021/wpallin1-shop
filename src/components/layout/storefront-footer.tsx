import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { openCookieSettings } from "@/components/cookie-consent";
import { LocaleToggle } from "@/components/layout/storefront-header";
import { SocialLinks } from "@/components/layout/social-links";
import { Button } from "@/components/ui/button";
import { PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { useT } from "@/i18n";
import { useBi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm sm:min-h-9";

const legalLinkClass =
  "inline-flex min-h-11 items-center text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm sm:min-h-0";

function FooterHeading({ children }: { children: string }) {
  return <h3 className="brand-kicker text-white/50">{children}</h3>;
}

export function StorefrontFooter() {
  const { t, locale } = useT();
  const pick = useBi();
  const year = new Date().getFullYear();
  const legalName =
    locale === "en" ? siteConfig.legalNameEn : siteConfig.legalName;
  const address = locale === "en" ? siteConfig.addressEn : siteConfig.address;

  return (
    <footer className="mt-auto bg-primary-deep text-white">
      <div className="relative overflow-hidden border-b border-white/10">
        <div
          className="brand-ribbon pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-30 md:block"
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="brand-kicker text-accent">Start your project</p>
            <p className="brand-heading mt-3">
              {pick({
                th: "ส่งขนาดหน้างานมา เราช่วยเลือกสินค้าและทำใบเสนอราคาให้",
                en: "Send us your sizes — we'll help you choose and prepare a quote.",
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="h-12 rounded-full bg-accent px-6 text-white hover:bg-accent/90"
              asChild
            >
              <Link to="/contact" search={{ topic: "quote" }}>
                {t("site.cta.quote")}
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <a href={siteConfig.lineUrl} target="_blank" rel="noreferrer">
                {t("site.cta.line")} {siteConfig.lineId}
              </a>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <img
            src="/brand/logo-white.png"
            alt="WP ALL"
            className="h-10 w-auto mix-blend-screen"
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/70 text-pretty">
            {t("footer.description")}
          </p>
          <SocialLinks className="mt-5" size={44} />
        </div>

        <div>
          <FooterHeading>{t("nav.products")}</FooterHeading>
          <ul className="mt-3">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.id}>
                <Link
                  to="/products"
                  search={{ category: category.id }}
                  className={linkClass}
                >
                  {pick(category.name)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Company</FooterHeading>
          <ul className="mt-3">
            <li>
              <Link to="/about" className={linkClass}>
                {t("nav.about")}
              </Link>
            </li>
            <li>
              <Link to="/projects" className={linkClass}>
                {t("nav.projects")}
              </Link>
            </li>
            <li>
              <Link to="/partners" className={linkClass}>
                {t("nav.partners")}
              </Link>
            </li>
            <li>
              <Link to="/catalogs" className={linkClass}>
                {t("nav.catalogs")}
              </Link>
            </li>
            <li>
              <Link to="/faq" className={linkClass}>
                {t("nav.faq")}
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                search={{ topic: "factory-visit" }}
                className={linkClass}
              >
                {t("footer.ctaFactory")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4 text-sm">
          <FooterHeading>{t("footer.contact")}</FooterHeading>
          <div>
            <p className="text-white/50">
              {locale === "en"
                ? siteConfig.officeLabelEn
                : siteConfig.officeLabel}
            </p>
            <a
              href={`tel:${siteConfig.phoneTel}`}
              className="inline-flex min-h-11 items-center text-lg font-medium hover:text-accent sm:min-h-9"
            >
              {siteConfig.phoneDisplay}
            </a>
          </div>
          <div className="flex items-start gap-3">
            <img
              src={siteConfig.lineQrSrc}
              alt={`LINE ${siteConfig.lineId}`}
              width={72}
              height={72}
              loading="lazy"
              className="size-[72px] rounded-md bg-white object-cover"
            />
            <div>
              <p className="text-white/50">LINE</p>
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center font-medium hover:text-accent sm:min-h-9"
              >
                {siteConfig.lineId}
              </a>
            </div>
          </div>
          <address className="not-italic leading-6 text-white/70">
            {address.line1}
            <br />
            {address.line2}
            <br />
            {address.city}
          </address>
          <a
            href={siteConfig.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-1 font-medium text-white hover:text-accent sm:min-h-9"
          >
            {pick({ th: "เปิดแผนที่", en: "Open map" })}
            <ArrowUpRight className="size-4" aria-hidden />
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-xs text-white/60 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            © {year} {legalName}. {t("footer.rights")}
          </p>
          <nav className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
            <Link to="/privacy" className={legalLinkClass}>
              {t("footer.privacy")}
            </Link>
            <Link to="/cookies" className={legalLinkClass}>
              {t("footer.cookies")}
            </Link>
            <Link to="/terms" className={legalLinkClass}>
              {t("footer.terms")}
            </Link>
            <button
              type="button"
              onClick={openCookieSettings}
              className={`${legalLinkClass} text-left`}
            >
              {t("footer.cookieSettings")}
            </button>
            <LocaleToggle />
          </nav>
        </div>
      </div>
    </footer>
  );
}
