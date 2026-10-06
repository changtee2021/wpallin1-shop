import { Link } from "@tanstack/react-router";
import { Factory } from "lucide-react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  ABOUT_IMAGES,
  ABOUT_INTRO,
  ABOUT_PROCESS,
  ABOUT_VALUES,
} from "@/data/about-content";
import { WpallValuesPinned } from "@/components/storefront/wpall-values";
import { useBi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function AboutView() {
  const pick = useBi();
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

      <WpallValuesPinned index="02" />

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

      <section className="brand-section">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:px-8">
          <div className="scroll-wipe-up-soft overflow-hidden rounded-sm bg-surface">
            <div className="scroll-zoom">
              <img
                src="/about/ready-stock-containers.webp"
                alt={pick({
                  th: "ตู้คอนเทนเนอร์หลากสีซ้อนกันเป็นชั้น สื่อถึงสินค้าที่เตรียมพร้อมส่ง",
                  en: "Colourful shipping containers stacked in tiers, suggesting stock ready to ship",
                })}
                width={1024}
                height={682}
                loading="lazy"
                decoding="async"
                className="aspect-[3/2] w-full object-cover"
              />
            </div>
          </div>
          <div>
            <SectionHeading
              index="04"
              kicker="Ready to supply"
              title={pick({
                th: "สินค้าพร้อมขาย พร้อมส่งถึงมือร้านค้า",
                en: "Stock ready to sell, ready to ship",
              })}
            />
            <p className="scroll-rise mt-6 text-base leading-7 text-muted-foreground text-pretty lg:text-lg lg:leading-8">
              {pick({
                th: "ตั้งแต่มู่ลี่ ม่านม้วน ฉากกั้นห้อง ราง ไปจนถึงมอเตอร์และอุปกรณ์ WP ALL เตรียมสินค้าให้ครบในที่เดียว เพื่อให้ร้านม่านและตัวแทนสั่งต่อเนื่องได้ ไม่ต้องไล่หาจากหลายแหล่ง",
                en: "From blinds, rollers and partitions to tracks, motors and hardware, WP ALL keeps the range together in one place, so curtain shops and dealers can reorder steadily without chasing several suppliers.",
              })}
            </p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-primary-deep text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-20 lg:px-8 lg:py-28">
          <div>
            <SectionHeading
              index="05"
              tone="dark"
              kicker="Trade promotion"
              title={pick({
                th: "จากโรงงานไทย สู่เวทีการค้าระดับประเทศ",
                en: "From a Thai workshop to the trade-show floor",
              })}
            />
            <p className="scroll-rise mt-6 max-w-xl text-base leading-7 text-white/80 text-pretty lg:text-lg lg:leading-8">
              {pick({
                th: "WP ALL เคยร่วมออกงานการค้ากับกรมส่งเสริมการค้าระหว่างประเทศ (DITP) นำสินค้าม่านและงานฝีมือที่ผลิตในไทยไปแสดงให้ผู้ซื้อได้เห็นคุณภาพจริงในเวทีที่กว้างกว่าหน้าร้าน",
                en: "WP ALL has exhibited alongside the Department of International Trade Promotion (DITP), taking curtain products made in Thailand to the trade-show floor, where buyers can judge the quality first-hand.",
              })}
            </p>
          </div>
          <figure className="scroll-rise rounded-sm bg-white p-8 text-primary-deep sm:p-10 lg:p-12">
            <img
              src="/about/ditp-logo.webp"
              alt={pick({
                th: "โลโก้กรมส่งเสริมการค้าระหว่างประเทศ (DITP)",
                en: "Department of International Trade Promotion (DITP) logo",
              })}
              width={601}
              height={117}
              loading="lazy"
              decoding="async"
              className="mx-auto h-auto w-full max-w-sm"
            />
            <figcaption className="mt-6 border-t border-border pt-4 text-center text-sm text-muted-foreground">
              {pick({
                th: "ร่วมออกงานกับ กรมส่งเสริมการค้าระหว่างประเทศ",
                en: "Exhibited with the Department of International Trade Promotion",
              })}
            </figcaption>
          </figure>
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
        />
        <Feature
          image={ABOUT_IMAGES.motor}
          kicker="Smart blinds & motor systems"
          title={pick({ th: "ระบบม่านมอเตอร์", en: "Motorised systems" })}
          body={pick({
            th: "มอเตอร์ม่าน WP Nano Power และระบบม่านสองชั้น WP N23 ควบคุมได้ทั้งรีโมท สวิตช์ และมือถือ",
            en: "WP Nano Power and the two-layer WP N23 system, controlled by remote, wall switch or phone.",
          })}
        />
      </section>
    </div>
  );
}

function Feature({
  image,
  kicker,
  title,
  body,
}: {
  image: string;
  kicker: string;
  title: string;
  body: string;
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
      </div>
    </article>
  );
}
