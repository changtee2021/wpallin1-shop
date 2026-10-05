import { Link } from "@tanstack/react-router";
import { Factory, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { CompanyContactDetails } from "@/components/layout/company-contact-details";
import { LazyMapsEmbed } from "@/components/layout/lazy-maps-embed";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import { useT } from "@/i18n";
import {
  ABOUT_CERTS,
  ABOUT_COPY,
  ABOUT_GALLERY,
  ABOUT_IMAGES,
  ABOUT_PARTNER_CHIPS,
  ABOUT_PRODUCTS,
} from "@/data/about-content";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

function useAboutCopy() {
  const { locale } = useT();
  return ABOUT_COPY[locale === "en" ? "en" : "th"];
}

function useHeroParallax() {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = (window.innerHeight / 2 - rect.top) / window.innerHeight;
      el.style.transform = `translate3d(0, ${Math.round(progress * 36)}px, 0) scale(1.06)`;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return ref;
}

const ctaClass = {
  primary:
    "inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground hover:bg-accent/90",
  ghost:
    "inline-flex min-h-11 items-center justify-center rounded-xl border border-white/50 bg-transparent px-5 text-sm font-semibold text-white hover:bg-white/10",
  outline:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold hover:bg-muted/60",
} as const;

export function AboutView() {
  const copy = useAboutCopy();
  const { locale, t } = useT();
  const heroRef = useHeroParallax();
  const gallery = [...ABOUT_GALLERY, ...ABOUT_GALLERY];
  const legalName = locale === "en" ? siteConfig.legalNameEn : siteConfig.legalName;

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden bg-primary">
        <img
          ref={heroRef}
          src={ABOUT_IMAGES.hero}
          alt={copy.heroTitle}
          className="absolute inset-0 size-full origin-center scale-105 object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
        <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20 lg:px-8">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
              {copy.heroKicker}
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold leading-[1.1] text-white text-balance sm:text-5xl md:text-6xl">
              {copy.heroTitle.includes(copy.heroAccent) ? (
                <>
                  {copy.heroTitle.slice(0, copy.heroTitle.indexOf(copy.heroAccent))}
                  <span className="about-accent-underline">{copy.heroAccent}</span>
                  {copy.heroTitle.slice(
                    copy.heroTitle.indexOf(copy.heroAccent) + copy.heroAccent.length,
                  )}
                </>
              ) : (
                copy.heroTitle
              )}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
              {copy.heroBody}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className={ctaClass.primary}>
                {copy.ctaShop}
              </Link>
              <Link to="/dealer/register" className={ctaClass.ghost}>
                {copy.ctaDealer}
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              {copy.storyEyebrow}
            </p>
            <div className="mt-2 h-0.5 w-12 bg-accent" />
            <h2 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">
              {copy.storyTitle}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {copy.storyBody}
            </p>
          </RevealOnScroll>
          <div className="grid gap-3">
            {copy.values.map((value, index) => (
              <RevealOnScroll key={value.en} delayMs={index * 120}>
                <article className="rounded-2xl border border-border bg-white p-5 shadow-sm">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">
                    {value.en}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {value.body}
                  </p>
                </article>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <img
          src={ABOUT_IMAGES.philosophy}
          alt={copy.philosophyTitle}
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-primary/72" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center text-white sm:px-6 sm:py-24">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.18em] text-white/75 uppercase">
              {copy.philosophyEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{copy.philosophyTitle}</h2>
          </RevealOnScroll>
          <div className="mt-10 flex flex-col items-center gap-6 md:flex-row md:items-stretch md:justify-center md:gap-0">
            {copy.cpc.map((item, index) => (
              <div key={`${item.letter}-${item.title}`} className="contents">
                {index > 0 ? (
                  <div
                    aria-hidden
                    className="hidden h-px w-16 self-center bg-white/55 md:block md:origin-left"
                  />
                ) : null}
                <RevealOnScroll delayMs={index * 140} className="w-full max-w-[14rem]">
                  <div
                    className={cn(
                      "mx-auto flex size-24 flex-col items-center justify-center rounded-full border-2 bg-white/10 backdrop-blur-sm sm:size-28",
                      index === 1 ? "border-white" : "border-accent",
                    )}
                  >
                    <span className="text-3xl font-bold">{item.letter}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-white/80">{item.th}</p>
                </RevealOnScroll>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              {copy.productsEyebrow}
            </p>
            <div className="mt-2 h-0.5 w-12 bg-accent" />
            <h2 className="mt-4 text-2xl font-bold text-primary sm:text-3xl">
              {copy.productsTitle}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.productsCaption}</p>
            <ul className="mt-6 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {ABOUT_PRODUCTS.map((product) => {
                const label = locale === "en" ? product.en : product.th;
                return (
                  <li key={product.en} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    {product.shopCategory ? (
                      <Link
                        to="/shop"
                        search={{ category: product.shopCategory }}
                        className="min-h-11 inline-flex items-center font-medium text-foreground hover:text-primary"
                      >
                        {label}
                      </Link>
                    ) : (
                      <span className="min-h-11 inline-flex items-center text-muted-foreground">
                        {label}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </RevealOnScroll>
          <RevealOnScroll direction="right" className="relative hidden min-h-[22rem] lg:block">
            <img
              src={ABOUT_IMAGES.aluminum}
              alt=""
              className="absolute top-0 right-0 w-[78%] rounded-2xl object-cover shadow-lg ring-1 ring-black/5"
            />
            <img
              src={ABOUT_IMAGES.roller}
              alt=""
              className="absolute bottom-0 left-0 w-[70%] rounded-2xl object-cover shadow-xl ring-1 ring-black/10"
            />
          </RevealOnScroll>
        </div>
      </section>

      <section className="overflow-hidden bg-muted/30 py-8 sm:py-10">
        <div className="about-gallery-track gap-4 pl-4 sm:gap-5 sm:pl-6">
          {gallery.map((item, index) => (
            <figure
              key={`${item.en}-${index}`}
              className="w-[10.5rem] shrink-0 sm:w-[13rem]"
            >
              <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
                <img
                  src={item.image}
                  alt={locale === "en" ? item.en : item.th}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[2/3] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs font-semibold">
                {locale === "en" ? item.en : item.th}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="grid md:grid-cols-2">
        <img
          src={ABOUT_IMAGES.print}
          alt={copy.printTitle}
          className="h-64 w-full object-cover md:h-full md:min-h-[28rem]"
        />
        <div className="flex flex-col justify-center bg-white px-4 py-12 sm:px-10 lg:px-16">
          <RevealOnScroll direction="right">
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              {copy.printKicker}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
              {copy.printTitle}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              {copy.printBody}
            </p>
            <Link
              to="/shop"
              search={{ category: "fabric-print" }}
              className={cn(ctaClass.primary, "mt-6 w-fit")}
            >
              {copy.printCta}
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <section className="relative overflow-hidden bg-primary text-white">
        <img
          src={ABOUT_IMAGES.woodHands}
          alt=""
          className="absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover opacity-35 lg:block"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/92 to-primary/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">
              {copy.partnersKicker}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{copy.partnersTitle}</h2>
            <p className="mt-3 max-w-xl text-sm text-white/85 sm:text-base">
              {copy.partnersBody}
            </p>
          </RevealOnScroll>
          <ul className="mt-8 flex flex-wrap gap-2">
            {ABOUT_PARTNER_CHIPS.map((chip, index) => (
              <li key={chip.value}>
                <RevealOnScroll delayMs={index * 40}>
                  <Link
                    to="/dealer/register"
                    className="inline-flex min-h-11 items-center rounded-full border border-white/25 bg-white/10 px-3.5 text-sm font-medium hover:bg-white/20"
                  >
                    {locale === "en" ? chip.en : chip.th}
                  </Link>
                </RevealOnScroll>
              </li>
            ))}
          </ul>
          <RevealOnScroll className="mt-8">
            <Link to="/dealer/register" className={ctaClass.primary}>
              {copy.partnersCta}
            </Link>
          </RevealOnScroll>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
        <RevealOnScroll direction="left">
          <article className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <img
              src={ABOUT_IMAGES.motor}
              alt={copy.motorTitle}
              className="aspect-[16/10] w-full object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-bold text-primary">{copy.motorTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {copy.motorBody}
              </p>
              <Link
                to="/shop"
                search={{ category: "roller-blinds" }}
                className={cn(ctaClass.outline, "mt-5")}
              >
                {copy.motorCta}
              </Link>
            </div>
          </article>
        </RevealOnScroll>
        <RevealOnScroll direction="right">
          <article className="flex h-full flex-col justify-center rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-primary">{copy.certsTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{copy.certHint}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {ABOUT_CERTS.map((cert) => (
                <li key={cert.name}>
                  <a
                    href={cert.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex min-h-11 h-full flex-col items-center rounded-xl border border-border bg-white px-4 py-5 text-center transition-colors hover:border-primary/30"
                  >
                    <img
                      src={cert.logo}
                      alt={cert.name}
                      className="h-28 w-auto max-w-full object-contain"
                    />
                    <p className="mt-3 text-sm font-semibold tracking-wide">{cert.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {locale === "en" ? cert.hint.en : cert.hint.th}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        </RevealOnScroll>
      </section>

      <section className="border-t border-border bg-muted/30">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:px-8">
          <RevealOnScroll>
            <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
              {copy.officeEyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{legalName}</h2>
            <CompanyContactDetails className="mt-5" />
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={siteConfig.lineUrl} target="_blank" rel="noreferrer" className={ctaClass.primary}>
                <MessageCircle className="mr-1.5 size-4" aria-hidden />
                {copy.officeCtaLine}
              </a>
              <Link to="/contact" search={{ topic: "factory-visit" }} className={ctaClass.outline}>
                <Factory className="size-4" aria-hidden />
                {copy.officeCtaVisit}
              </Link>
              <Link to="/contact" search={{ topic: "project" }} className={ctaClass.outline}>
                {copy.officeCtaProject}
              </Link>
            </div>
          </RevealOnScroll>
          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <LazyMapsEmbed
              title={t("footer.mapTitle")}
              src={siteConfig.mapsEmbedUrl}
              loadLabel={t("footer.loadMap")}
              hintLabel="Google Maps"
              className="aspect-[4/3] w-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
