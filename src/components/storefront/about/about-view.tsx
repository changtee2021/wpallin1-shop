import { SectionHeading } from "@/components/brand/section-heading";
import {
  AboutCompanyProfile,
  AboutNumbers,
  AboutProof,
  AboutTimeline,
  tileFrame,
} from "@/components/storefront/about/about-trust-sections";
import {
  ABOUT_IMAGES,
  ABOUT_INTRO,
  ABOUT_PROCESS,
  ABOUT_VALUES,
  WPALL_TAGLINE,
} from "@/data/about-content";
import { WpallValuesPinned } from "@/components/storefront/wpall-values";
import { useBi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** Photo per production step, in ABOUT_PROCESS order. */
const PROCESS_IMAGES = [
  "/brand/process-prep.webp",
  "/brand/process-cut.webp",
  "/brand/process-drill.webp",
  "/brand/process-assemble.webp",
  "/brand/process-colors.webp",
  "/brand/process-qc.webp",
];

/**
 * Company story, laid out like the Smart Motor page: big-type hero → bento numbers →
 * sticky heading lists → dark story cards → alternating image panels. Motion is CSS scroll-timeline only.
 */
export function AboutView() {
  const pick = useBi();
  return (
    <div>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />

      <AboutHero />
      <AboutNumbers />
      <AboutWhoWeAre />
      <AboutTimeline />

      <section
        aria-hidden
        className="overflow-hidden border-b border-border bg-surface py-8 lg:py-12"
      >
        <p className="scroll-marquee-left whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] leading-none font-medium tracking-tight text-transparent uppercase [-webkit-text-stroke:1.5px_var(--color-primary)]">
          {siteConfig.slogan} · {siteConfig.slogan} · {siteConfig.slogan}
        </p>
        <p className="scroll-marquee-right mt-2 whitespace-nowrap text-[clamp(3.5rem,11vw,9rem)] leading-none font-medium tracking-tight text-primary/15 uppercase lg:mt-4">
          {siteConfig.sloganSub} · {siteConfig.sloganSub}
        </p>
      </section>

      <WpallValuesPinned hideKicker englishTitle />

      <AboutCraft />

      <section className="brand-section bg-background">
        <div className={cn(container, "space-y-12")}>
          <SectionHeading
            hideKicker
            kicker="Supply & trade"
            title="Ready to supply, here and abroad"
            description={pick({
              th: "สต๊อกพร้อมส่ง และเวทีการค้าระดับนานาชาติ",
              en: "",
            })}
          />
          <StockPanel />
          <TradePanel />
        </div>
      </section>

      <AboutProof />

      <section className="brand-section bg-cream">
        <div className={container}>
          <SectionHeading
            hideKicker
            kicker="Specialist"
            title="Specialist lines"
            description={pick({ th: "งานเฉพาะทางจากสายผลิตของเรา", en: "" })}
          />
          <div className={cn(tileFrame, "mt-12 md:grid-cols-2")}>
            <Feature
              image={ABOUT_IMAGES.print}
              index={0}
              kicker="Specialist customised"
              title="Custom print fabric"
              body={pick({
                th: "พิมพ์ลายหรือภาพของคุณลงผ้าม่าน ม่านม้วน และผ้าโนเรน จากสายผลิตของเราเอง",
                en: "Your pattern or image printed onto curtains, roller blinds and noren — on our own line.",
              })}
            />
            <Feature
              image={ABOUT_IMAGES.motor}
              index={1}
              kicker="Smart blinds & motor systems"
              title="Motorised systems"
              body={pick({
                th: "มอเตอร์ม่าน WP Nano Power และระบบม่านสองชั้น WP N23 ควบคุมได้ทั้งรีโมท สวิตช์ และมือถือ",
                en: "WP Nano Power and the two-layer WP N23 system, controlled by remote, wall switch or phone.",
              })}
            />
          </div>
        </div>
      </section>

      <AboutCompanyProfile />
    </div>
  );
}

function AboutHero() {
  const pick = useBi();

  return (
    <section className="bg-background">
      <div className={cn(container, "pt-12 pb-8 lg:pt-16 lg:pb-10")}>
        <h1 className="scroll-fade-away text-[clamp(3.25rem,12vw,11rem)] leading-[0.98] font-medium tracking-tighter text-foreground">
          {["Center", "of", "Curtain"].map((word, index) => (
            <span
              key={word}
              className="hero-word inline-block pr-[0.18em]"
              style={{ ["--i" as string]: index }}
            >
              {word}
            </span>
          ))}
        </h1>
        <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="hero-blur-in max-w-xl text-base leading-7 text-muted-foreground text-pretty lg:text-lg lg:leading-8"
            style={{ ["--delay" as string]: "450ms" }}
          >
            {pick(WPALL_TAGLINE)}
            <br />
            {pick({
              th: "ม่าน มู่ลี่ ราง ฉากกั้นห้อง และระบบมอเตอร์ ครบในที่เดียว",
              en: "Curtains, blinds, tracks, partitions and motors, all in one place.",
            })}
          </p>
        </div>
      </div>

      <div className={cn(container, "pb-4")}>
        <div
          className="hero-blur-in relative aspect-[4/3] overflow-hidden rounded-sm bg-surface sm:aspect-[16/9] lg:aspect-[21/9]"
          style={{ ["--delay" as string]: "750ms" }}
        >
          <div className="scroll-zoom size-full">
            <img
              src={ABOUT_IMAGES.hero}
              alt=""
              aria-hidden
              fetchPriority="high"
              className="size-full object-cover object-[center_35%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutWhoWeAre() {
  const pick = useBi();

  return (
    <section className="brand-section bg-cream">
      <div
        className={cn(
          container,
          "grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20",
        )}
      >
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            hideKicker
            kicker={ABOUT_INTRO.kicker.en}
            title="Designed for real spaces"
          />
          <p className="scroll-rise mt-6 max-w-lg text-base leading-7 text-muted-foreground text-pretty lg:text-lg lg:leading-8">
            {pick(ABOUT_INTRO.body)}
          </p>
        </div>
        <ol>
          {ABOUT_VALUES.map((value, index) => (
            <li
              key={value.title.en}
              className="scroll-line-top flex gap-6 border-t border-border py-8 lg:gap-8 lg:py-10"
            >
              <span className="w-14 shrink-0 text-5xl leading-none font-medium tracking-tight text-accent lg:w-20 lg:text-6xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="scroll-rise">
                <h3 className="text-xl font-medium tracking-tight text-foreground lg:text-3xl">
                  {value.title.en}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground lg:text-base">
                  {pick(value.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AboutCraft() {
  const pick = useBi();
  const [lead, ...rest] = ABOUT_IMAGES.factory;

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <SectionHeading
          hideKicker
          kicker="Craftsmanship"
          title="From raw material to you, in six steps"
          description={pick({
            th: "ทุกออเดอร์ผ่านขั้นตอนเดียวกัน ด้วยมาตรฐานเดียวกัน",
            en: "",
          })}
        />
        <div className={cn(tileFrame, "mt-12 sm:grid-cols-2 lg:grid-cols-12")}>
          <CraftImage
            src={lead}
            index={0}
            className="sm:col-span-2 lg:col-span-7 lg:row-span-2 lg:min-h-[32rem]"
          />
          {rest.map((src, index) => (
            <CraftImage
              key={src}
              src={src}
              index={index + 1}
              className={cn(
                "lg:col-span-5",
                index === 2 && "sm:col-span-2 lg:col-span-12 lg:min-h-80",
              )}
            />
          ))}
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="scroll-rise text-[clamp(5rem,14vw,11rem)] leading-none font-medium tracking-tighter text-accent">
              06
            </p>
            <p className="scroll-rise mt-2 text-lg font-medium text-foreground">
              {pick({ th: "ขั้นตอนในทุกชิ้นงาน", en: "steps in every piece" })}
            </p>
          </div>
          <ol>
            {ABOUT_PROCESS.map((step, index) => (
              <li
                key={step.title.en}
                className="scroll-line-top group flex items-start gap-6 border-t border-border py-6 lg:gap-8 lg:py-8"
              >
                <span className="w-10 shrink-0 pt-1.5 text-sm font-medium text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="scroll-rise min-w-0 flex-1">
                  <h3 className="text-xl font-medium tracking-tight text-foreground lg:text-2xl">
                    {pick(step.title)}
                    <span className="ml-3 text-sm font-normal text-muted-foreground">
                      {step.title.en}
                    </span>
                  </h3>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-muted-foreground lg:text-base">
                    {pick(step.body)}
                  </p>
                </div>
                {PROCESS_IMAGES[index] ? (
                  <div className="scroll-scale-in hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-sm bg-surface sm:block lg:w-36">
                    <img
                      src={PROCESS_IMAGES[index]}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function CraftImage({
  src,
  index,
  className,
}: {
  src: string;
  index: number;
  className?: string;
}) {
  const pick = useBi();
  return (
    <div
      className={cn(
        "scroll-scale-in group relative min-h-56 overflow-hidden rounded-sm bg-surface lg:min-h-64",
        className,
      )}
      style={{ ["--i" as string]: index % 2 }}
    >
      <div className="scroll-zoom absolute inset-0">
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
  );
}

function StockPanel() {
  const pick = useBi();
  return (
    <article className={cn(tileFrame, "lg:grid-cols-12")}>
      <div className="scroll-scale-in relative min-h-72 overflow-hidden rounded-sm bg-surface lg:col-span-7 lg:min-h-[28rem]">
        <div className="scroll-zoom absolute inset-0">
          <img
            src="/about/ready-stock-containers.webp"
            alt={pick({
              th: "ตู้คอนเทนเนอร์หลากสีซ้อนกันเป็นชั้น สื่อถึงสินค้าที่เตรียมพร้อมส่ง",
              en: "Colourful shipping containers stacked in tiers, suggesting stock ready to ship",
            })}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
          Ready to supply
        </span>
      </div>
      <div className="scroll-scale-in flex flex-col justify-end rounded-sm bg-neutral-900 p-6 text-white lg:col-span-5 lg:p-10">
        <h3 className="text-3xl font-medium tracking-tight text-balance lg:text-4xl">
          Stock ready to sell, ready to ship
        </h3>
        <p className="mt-4 text-sm leading-7 text-white/70 text-pretty lg:text-base">
          {pick({
            th: "ตั้งแต่มู่ลี่ ม่านม้วน ฉากกั้นห้อง ราง ไปจนถึงมอเตอร์และอุปกรณ์ WP ALL เตรียมสินค้าให้ครบในที่เดียว เพื่อให้ร้านม่านและตัวแทนสั่งต่อเนื่องได้ ไม่ต้องไล่หาจากหลายแหล่ง",
            en: "From blinds, rollers and partitions to tracks, motors and hardware, WP ALL keeps the range together in one place, so curtain shops and dealers can reorder steadily without chasing several suppliers.",
          })}
        </p>
      </div>
    </article>
  );
}

function TradePanel() {
  const pick = useBi();
  return (
    <article className={cn(tileFrame, "lg:grid-cols-12")}>
      <div className="scroll-scale-in flex flex-col justify-end rounded-sm bg-primary-deep p-6 text-white lg:order-2 lg:col-span-7 lg:min-h-[24rem] lg:p-10">
        <p className="text-sm font-medium text-accent">WP ALL x HD Expo 2026</p>
        <h3 className="mt-3 text-3xl font-medium tracking-tight text-balance lg:text-4xl">
          From a Thai workshop to the trade-show floor
        </h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/75 text-pretty lg:text-base">
          {pick({
            th: "WP ALL ร่วมออกงาน HD Expo 2026 กับกรมส่งเสริมการค้าระหว่างประเทศ (DITP) นำสินค้าม่านและงานฝีมือที่ผลิตในไทยไปแสดงให้ผู้ซื้อได้เห็นคุณภาพจริงในเวทีที่กว้างกว่าหน้าร้าน",
            en: "WP ALL exhibited at HD Expo 2026 with the Department of International Trade Promotion (DITP), taking curtain products made in Thailand to the trade-show floor, where buyers can judge the quality first-hand.",
          })}
        </p>
      </div>
      <figure className="scroll-scale-in flex flex-col items-center justify-center rounded-sm bg-white p-8 lg:order-1 lg:col-span-5 lg:p-12">
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
          className="h-auto w-full max-w-sm"
        />
        <figcaption className="mt-6 w-full border-t border-border pt-4 text-center text-sm text-muted-foreground">
          {pick({
            th: "ร่วมกับ กรมส่งเสริมการค้าระหว่างประเทศ",
            en: "With the Department of International Trade Promotion",
          })}
        </figcaption>
      </figure>
    </article>
  );
}

function Feature({
  image,
  index,
  kicker,
  title,
  body,
}: {
  image: string;
  index: number;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <article
      className="scroll-scale-in group flex flex-col overflow-hidden rounded-sm bg-neutral-900 text-white"
      style={{ ["--i" as string]: index }}
    >
      <div className="aspect-[16/10] overflow-hidden">
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
      <div className="p-6 sm:p-8">
        <p className="brand-kicker text-accent">{kicker}</p>
        <h3 className="mt-3 text-2xl font-medium tracking-tight lg:text-3xl">
          {title}
        </h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-white/70 lg:text-base">
          {body}
        </p>
      </div>
    </article>
  );
}
