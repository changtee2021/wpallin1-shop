import { Link } from "@tanstack/react-router";
import { ArrowRight, Factory, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import { CompanyContactDetails } from "@/components/layout/company-contact-details";
import { LazyMapsEmbed } from "@/components/layout/lazy-maps-embed";
import {
  ABOUT_CPC,
  ABOUT_IMAGES,
  ABOUT_INTRO,
  ABOUT_PROCESS,
  ABOUT_VALUES,
} from "@/data/about-content";
import { PRODUCT_CATEGORIES } from "@/data/products-catalog";
import { useT } from "@/i18n";
import { useBi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function AboutView() {
  const { locale, t } = useT();
  const pick = useBi();
  const legalName =
    locale === "en" ? siteConfig.legalNameEn : siteConfig.legalName;

  return (
    <div>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />
      <section className="scroll-hero-shrink relative isolate overflow-hidden bg-primary-deep text-white">
        <div className="scroll-parallax absolute inset-0 -z-10">
          <img
            src={ABOUT_IMAGES.hero}
            alt=""
            aria-hidden
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover object-[center_35%]"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/60 to-primary-deep/10"
            aria-hidden
          />
        </div>
        <div className="scroll-fade-away mx-auto flex min-h-[calc(88svh-4.5rem)] max-w-7xl flex-col justify-end px-4 pt-28 pb-14 sm:px-6 lg:px-8 lg:pb-20">
          <p className="hero-blur-in brand-kicker text-accent">
            {siteConfig.slogan}
          </p>
          <h1 className="brand-display mt-4 max-w-4xl text-white text-balance">
            {pick(ABOUT_INTRO.title)
              .split(" ")
              .map((word, index) => (
                <span
                  key={`${word}-${index}`}
                  className="hero-word inline-block"
                  style={{ ["--i" as string]: index }}
                >
                  {word}
                  {"\u00a0"}
                </span>
              ))}
          </h1>
          <p
            className="hero-blur-in mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8"
            style={{ ["--delay" as string]: "600ms" }}
          >
            {pick({
              th: "แบรนด์ผ้าม่าน มู่ลี่ และระบบมอเตอร์ สำหรับบ้านและงานโครงการ",
              en: "A brand of curtains, blinds and motorised systems for homes and projects.",
            })}
          </p>
        </div>
      </section>

      <section className="brand-section">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20 lg:px-8">
          <div>
            <SectionHeading
              index="01"
              kicker={ABOUT_INTRO.kicker.en}
              title={pick({
                th: "ออกแบบเพื่อพื้นที่จริง",
                en: "Designed for real spaces",
              })}
            />
            <p className="scroll-rise mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
              {pick(ABOUT_INTRO.body)}
            </p>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {ABOUT_VALUES.map((value, index) => (
              <li
                key={value.title.en}
                className="scroll-slide-right group grid grid-cols-[3rem_minmax(0,1fr)] gap-4 py-6"
              >
                <span className="brand-index text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="transition-transform duration-300 group-hover:translate-x-1.5">
                  <h3 className="text-lg font-medium">{pick(value.title)}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {pick(value.body)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-hidden
        className="overflow-hidden border-y border-border bg-surface py-8 lg:py-12"
      >
        <p className="scroll-marquee-left whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] leading-none font-medium tracking-tight text-transparent uppercase [-webkit-text-stroke:1.5px_var(--color-primary)]">
          {siteConfig.slogan} · {siteConfig.slogan} · {siteConfig.slogan}
        </p>
        <p className="scroll-marquee-right mt-2 whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] leading-none font-medium tracking-tight text-primary/15 uppercase lg:mt-4">
          {siteConfig.sloganSub} · {siteConfig.sloganSub}
        </p>
      </section>

      <section className="relative isolate overflow-hidden bg-primary text-white">
        <img
          src={ABOUT_IMAGES.philosophy}
          alt=""
          aria-hidden
          loading="lazy"
          className="scroll-drift-down absolute inset-x-0 -top-[14%] -z-10 h-[128%] w-full object-cover opacity-20"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <SectionHeading
            index="02"
            tone="dark"
            kicker="Our Business Philosophy"
            title={pick({
              th: "ปรัชญาธุรกิจ C-P-C",
              en: "The C-P-C philosophy",
            })}
          />
          <ol className="mt-14 grid gap-px overflow-hidden rounded-sm bg-white/15 md:grid-cols-3">
            {ABOUT_CPC.map((item, index) => (
              <li
                key={item.title}
                className="scroll-rise bg-primary/90 p-6 backdrop-blur-sm lg:p-10"
                style={{ ["--i" as string]: index }}
              >
                <span
                  className="scroll-scale-in block origin-left text-6xl font-medium text-accent lg:text-7xl"
                  style={{ ["--i" as string]: index }}
                >
                  {item.letter}
                </span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {pick(item.body)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="brand-section">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            index="03"
            kicker="Craftsmanship"
            title={pick({
              th: "จากวัสดุถึงมือคุณ ใน 6 ขั้น",
              en: "From raw material to you, in six steps",
            })}
            description={pick({
              th: "ทุกออเดอร์ผ่านขั้นตอนเดียวกัน ด้วยมาตรฐานเดียวกัน",
              en: "Every order follows the same steps, to the same standard.",
            })}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ABOUT_IMAGES.factory.map((src, index) => (
              <div
                key={src}
                className={cn(
                  "scroll-wipe-up-soft group aspect-[4/3] overflow-hidden rounded-sm bg-surface",
                  index === 0 && "sm:col-span-2 sm:row-span-2 sm:aspect-auto",
                )}
                style={{ ["--i" as string]: index % 2 }}
              >
                <div className="scroll-zoom size-full">
                  <img
                    src={src}
                    alt={pick({
                      th: `ขั้นตอนการผลิต WP ALL ${index + 1}`,
                      en: `WP ALL craftsmanship ${index + 1}`,
                    })}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </div>
            ))}
          </div>
          <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {ABOUT_PROCESS.map((step, index) => (
              <li
                key={step.title.en}
                className="scroll-line-top scroll-rise border-t border-border pt-5"
                style={{ ["--i" as string]: index % 3 }}
              >
                <span className="brand-index text-accent">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-lg font-medium">{pick(step.title)}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {pick(step.body)}
                </p>
              </li>
            ))}
          </ol>
          <Link
            to="/contact"
            search={{ topic: "factory-visit" }}
            className="mt-12 inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold hover:border-primary hover:text-primary"
          >
            <Factory className="size-4" aria-hidden />
            {pick({ th: "นัดเยี่ยมชม WP ALL", en: "Book a visit" })}
          </Link>
        </div>
      </section>

      <section className="brand-section border-t border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              index="04"
              kicker="What we make"
              title={pick({ th: "5 หมวดสินค้า", en: "Five product families" })}
              action={
                <Link
                  to="/products"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary"
                >
                  {t("site.cta.viewAll")}
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              }
            />
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {PRODUCT_CATEGORIES.map((category) => (
              <li key={category.id} className="scroll-slide-right">
                <Link
                  to="/products"
                  search={{ category: category.id }}
                  className="group flex min-h-16 items-center gap-6 py-5 transition-[padding] duration-300 hover:pl-3 hover:text-primary"
                >
                  <span className="brand-index text-muted-foreground">
                    {category.index}
                  </span>
                  <span className="flex-1">
                    <span className="block text-lg font-medium">
                      {pick(category.name)}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {pick(category.description)}
                    </span>
                  </span>
                  <ArrowRight
                    className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid border-t border-border md:grid-cols-2">
        <Feature
          image={ABOUT_IMAGES.print}
          kicker="Specialist customised"
          title={pick({ th: "พิมพ์ผ้าตามแบบ", en: "Custom print fabric" })}
          body={pick({
            th: "พิมพ์ลายหรือภาพของคุณลงผ้าม่าน ม่านม้วน และผ้าโนเรน จากสายผลิตของเราเอง",
            en: "Your pattern or image printed onto curtains, roller blinds and noren — on our own line.",
          })}
          cta={
            <Link
              to="/products"
              search={{ category: "custom-print" }}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              {pick({ th: "ดูงานพิมพ์ผ้า", en: "See custom printing" })}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
        <Feature
          image={ABOUT_IMAGES.motor}
          kicker="Smart blinds & motor systems"
          title={pick({ th: "ระบบม่านมอเตอร์", en: "Motorised systems" })}
          body={pick({
            th: "มอเตอร์ม่าน WP Nano Power และระบบม่านสองชั้น WP N23 ควบคุมได้ทั้งรีโมท สวิตช์ และมือถือ",
            en: "WP Nano Power and the two-layer WP N23 system, controlled by remote, wall switch or phone.",
          })}
          cta={
            <Link
              to="/products/$slug"
              params={{ slug: "wp-nano-power" }}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
            >
              {pick({ th: "ดูระบบมอเตอร์", en: "See motor systems" })}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          }
        />
      </section>

      <section className="border-t border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:px-8 lg:py-20">
          <div className="scroll-rise">
            <p className="brand-kicker text-primary">Head office</p>
            <h2 className="brand-heading mt-4">{legalName}</h2>
            <CompanyContactDetails className="mt-6" />
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={siteConfig.lineUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
              >
                <MessageCircle className="size-4" aria-hidden />
                {t("site.cta.line")}
              </a>
              <Link
                to="/contact"
                search={{ topic: "project" }}
                className="inline-flex min-h-12 items-center rounded-full border border-border px-6 text-sm font-semibold hover:border-primary hover:text-primary"
              >
                {pick({ th: "ติดต่องานโครงการ", en: "Project enquiry" })}
              </Link>
            </div>
          </div>
          <div className="scroll-wipe-up overflow-hidden rounded-sm border border-border">
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

function Feature({
  image,
  kicker,
  title,
  body,
  cta,
}: {
  image: string;
  kicker: string;
  title: string;
  body: string;
  cta: ReactNode;
}) {
  return (
    <article className="group border-border md:odd:border-r">
      <div className="scroll-wipe-up aspect-[16/10] overflow-hidden bg-surface">
        <div className="scroll-zoom size-full">
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </div>
      <div className="scroll-rise p-6 sm:p-10">
        <p className="brand-kicker text-muted-foreground">{kicker}</p>
        <h2 className="mt-3 text-2xl font-medium">{title}</h2>
        <p className="mt-3 max-w-md text-base leading-7 text-muted-foreground">
          {body}
        </p>
        <div className="mt-4">{cta}</div>
      </div>
    </article>
  );
}
