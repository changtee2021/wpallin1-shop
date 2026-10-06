import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Radio,
  Smartphone,
  ToggleRight,
  type LucideIcon,
} from "lucide-react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  getCatalogProduct,
  type ProductStat,
} from "@/data/products-catalog";
import {
  SMART_MOTOR_CONTROLS,
  SMART_MOTOR_FEATURES,
  SMART_MOTOR_TYPES,
  smartMotorImage,
  type SmartMotorType,
} from "@/data/smart-motor";
import { useBi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** Black hairline between tiles — the "product UI" frame used by every panel grid below. */
const tileFrame = "grid gap-1.5 rounded-sm bg-foreground p-1.5";

const CONTROL_ICONS: Record<string, LucideIcon> = {
  remote: Radio,
  switch: ToggleRight,
  phone: Smartphone,
};

export function SmartMotorHero() {
  const pick = useBi();

  return (
    <section className="bg-background">
      <div className={cn(container, "pt-12 pb-8 lg:pt-16 lg:pb-10")}>
        <p className="hero-blur-in brand-kicker flex items-center gap-3 text-primary">
          <span aria-hidden className="h-px w-8 bg-accent" />
          Every curtain · Every blind
        </p>
        <h1 className="scroll-fade-away mt-5 text-[clamp(3.5rem,14.5vw,13rem)] leading-[0.98] font-medium tracking-tighter text-foreground">
          {["Smart", "Motor"].map((word, index) => (
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
            {pick({
              th: "ม่านและมู่ลี่ทุกแบบ ติดมอเตอร์ได้ เปิด-ปิดจากรีโมท สวิตช์ หรือมือถือ",
              en: "Motors for every curtain and blind, run from a remote, a wall switch or your phone.",
            })}
          </p>
          <ul
            className="hero-blur-in flex flex-wrap gap-2"
            style={{ ["--delay" as string]: "600ms" }}
          >
            {SMART_MOTOR_CONTROLS.map((control) => (
              <li
                key={control.id}
                className="rounded-full border border-border px-4 py-2 text-sm text-foreground/80"
              >
                {control.title}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={cn(container, "pb-4")}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-surface sm:aspect-[16/9] lg:aspect-[21/9]">
          <div className="scroll-zoom size-full">
            <img
              src="/about/philosophy-drapes.webp"
              alt=""
              aria-hidden
              fetchPriority="high"
              className="size-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function BigStat({
  stat,
  className,
  index,
}: {
  stat: ProductStat;
  className?: string;
  index: number;
}) {
  const pick = useBi();
  const [amount, ...unit] = stat.value.split(" ");

  return (
    <div
      className={cn(
        "scroll-scale-in flex min-h-64 flex-col justify-between rounded-sm p-6 lg:min-h-72 lg:p-8",
        className,
      )}
      style={{ ["--i" as string]: index }}
    >
      <p className="text-sm font-medium opacity-70">{pick(stat.label)}</p>
      <p className="flex items-baseline gap-2 font-medium tracking-tighter">
        <span className="text-[clamp(4.5rem,11vw,9rem)] leading-none">
          {amount}
        </span>
        <span className="text-2xl lg:text-3xl">{unit.join(" ")}</span>
      </p>
    </div>
  );
}

export function SmartMotorNumbers() {
  const pick = useBi();
  const nano = getCatalogProduct("wp-nano-power");
  const stats = nano?.stats ?? [];
  const size = nano?.specs?.find((spec) => spec.label.en === "Motor size");

  if (stats.length < 4) return null;

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <SectionHeading
          index="01"
          kicker="By the numbers"
          title={pick({ th: "เล็ก เงียบ แรง", en: "Small. Silent. Strong." })}
          description={pick({
            th: "ตัวเลขจริงจากสเปก WP Nano Power มอเตอร์ม่านไร้แปรงถ่าน",
            en: "Real figures from the WP Nano Power spec sheet, a brushless curtain motor.",
          })}
        />

        <div className={cn(tileFrame, "mt-12 lg:grid-cols-12")}>
          <div className="scroll-scale-in relative min-h-72 overflow-hidden rounded-sm bg-surface lg:col-span-7 lg:min-h-[28rem]">
            <div className="scroll-zoom absolute inset-0">
              <img
                src="/about/motor-hardware.webp"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>
            <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
              {pick({ th: "อุปกรณ์มอเตอร์", en: "Motor hardware" })}
            </span>
          </div>

          <BigStat
            stat={stats[0]}
            index={1}
            className="bg-neutral-900 text-white lg:col-span-5"
          />
          <BigStat
            stat={stats[1]}
            index={0}
            className="bg-surface text-foreground lg:col-span-4"
          />
          <BigStat
            stat={stats[2]}
            index={1}
            className="bg-cream text-foreground lg:col-span-4"
          />
          <BigStat
            stat={stats[3]}
            index={2}
            className="bg-accent text-white lg:col-span-4"
          />

          <div className="scroll-scale-in relative min-h-72 overflow-hidden rounded-sm bg-neutral-900 text-white lg:col-span-12 lg:min-h-[22rem]">
            <div className="scroll-zoom absolute inset-0">
              <img
                src="/projects/charoensap-stage.webp"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="size-full object-cover opacity-70"
              />
            </div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.78),rgb(0_0_0/0.15)_70%)]" />
            <div className="relative flex h-full min-h-72 flex-col justify-end p-6 lg:min-h-[22rem] lg:p-8">
              <p className="text-sm font-medium text-white/70">
                {pick({ th: "ขนาดมอเตอร์", en: "Motor size" })}
              </p>
              <p className="mt-3 text-[clamp(2.5rem,7vw,5.5rem)] leading-none font-medium tracking-tighter">
                {size ? pick(size.value) : "47 × 65 × 80 mm"}
              </p>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/75 lg:text-base">
                {pick({
                  th: "ไร้แปรงถ่าน ขนาดเล็กพอจะซ่อนหลังรางได้สวย",
                  en: "Brushless, and small enough to hide neatly behind the track.",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SmartMotorFeatures() {
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
            index="02"
            kicker="Function"
            title={pick({
              th: "ทำงานอย่างไร",
              en: "How it works",
            })}
            description={pick({
              th: "ฟังก์ชันที่อยู่ในสเปกจริง ไม่ใช่แค่ภาพลักษณ์",
              en: "Functions from the real spec sheet, not just a look.",
            })}
          />
        </div>

        <ol>
          {SMART_MOTOR_FEATURES.map((feature, index) => (
            <li
              key={feature.id}
              className="scroll-line-top flex gap-6 border-t border-border py-8 lg:gap-8 lg:py-10"
              style={{ ["--i" as string]: 0 }}
            >
              <span className="w-14 shrink-0 text-5xl leading-none font-medium tracking-tight text-accent lg:w-20 lg:text-6xl">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="scroll-rise">
                <h3 className="text-xl font-medium tracking-tight text-foreground lg:text-3xl">
                  {pick(feature.title)}
                </h3>
                <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground lg:text-base">
                  {pick(feature.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function SmartMotorControl() {
  const pick = useBi();

  return (
    <section className="brand-section bg-foreground text-white">
      <div className={container}>
        <SectionHeading
          tone="dark"
          index="03"
          kicker="Control"
          title={pick({ th: "สั่งงานได้ 3 วิธี", en: "Three ways to control" })}
        />
        <ul className="mt-12 grid gap-1.5 md:grid-cols-3">
          {SMART_MOTOR_CONTROLS.map((control, index) => {
            const Icon = CONTROL_ICONS[control.id] ?? Radio;
            return (
              <li
                key={control.id}
                className="scroll-slide-right flex min-h-80 flex-col justify-between rounded-sm bg-white/[0.06] p-6 lg:min-h-96 lg:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-full border border-white/25">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <span className="text-5xl leading-none font-medium tracking-tight text-white/25 lg:text-6xl">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="text-3xl font-medium tracking-tight lg:text-4xl">
                    {control.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/65 lg:text-base">
                    {pick(control.body)}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ModelPanel({ slug, flip }: { slug: string; flip?: boolean }) {
  const pick = useBi();
  const product = getCatalogProduct(slug);
  if (!product) return null;

  return (
    <article className={cn(tileFrame, "lg:grid-cols-12")}>
      <div
        className={cn(
          "scroll-scale-in relative min-h-72 overflow-hidden rounded-sm bg-surface lg:col-span-7 lg:min-h-[32rem]",
          flip && "lg:order-2",
        )}
      >
        <div className="scroll-zoom absolute inset-0">
          <img
            src={product.image}
            alt={pick(product.name)}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
          />
        </div>
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
          {product.code}
        </span>
      </div>

      <div
        className={cn(
          "scroll-scale-in flex flex-col rounded-sm bg-neutral-900 p-6 text-white lg:col-span-5 lg:p-8",
          flip && "lg:order-1",
        )}
      >
        <h3 className="text-2xl font-medium tracking-tight lg:text-4xl">
          {pick(product.name)}
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/65 lg:text-base">
          {pick(product.tagline)}
        </p>

        <dl className="mt-8 divide-y divide-white/10 border-t border-white/10 text-sm">
          {(product.specs ?? []).map((spec) => (
            <div
              key={spec.label.en}
              className="flex items-baseline justify-between gap-6 py-3.5"
            >
              <dt className="text-white/55">{pick(spec.label)}</dt>
              <dd className="text-right font-medium tabular-nums">
                {pick(spec.value)}
              </dd>
            </div>
          ))}
        </dl>

        <Link
          to="/products/$slug"
          params={{ slug: product.slug }}
          className="group mt-auto inline-flex min-h-11 items-center gap-3 pt-8 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent text-white transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
            <ArrowUpRight className="size-4" aria-hidden />
          </span>
          {pick({ th: "ดูรายละเอียดรุ่น", en: "View model" })}
        </Link>
      </div>
    </article>
  );
}

export function SmartMotorModels() {
  const pick = useBi();

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <SectionHeading
          index="04"
          kicker="Models"
          title={pick({ th: "รางม่านมอเตอร์ 2 รุ่น", en: "Two motorised tracks" })}
          description={pick({
            th: "WP Nano Power สำหรับม่านชั้นเดียว และ WP N23 สำหรับม่านสองชั้น",
            en: "WP Nano Power for a single curtain, WP N23 for two layers.",
          })}
        />
        <div className="mt-12 space-y-12">
          <ModelPanel slug="wp-nano-power" />
          <ModelPanel slug="wp-n23" flip />
        </div>
      </div>
    </section>
  );
}

function TypeTile({ type, index }: { type: SmartMotorType; index: number }) {
  const pick = useBi();
  const image = smartMotorImage(type);
  const motors = type.motorSlugs
    .map((slug) => getCatalogProduct(slug))
    .filter((product) => product !== undefined);

  return (
    <li
      className="scroll-scale-in flex flex-col overflow-hidden rounded-sm bg-neutral-900 text-white"
      style={{ ["--i" as string]: index }}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="size-full object-cover opacity-90"
          />
        ) : null}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.55),transparent_55%)]" />
        <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
          {type.kind === "blind"
            ? pick({ th: "มู่ลี่ / ม่านม้วน", en: "Blinds" })
            : pick({ th: "ผ้าม่าน", en: "Curtains" })}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-xl font-medium tracking-tight">{type.title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/65">
          {pick(type.description)}
        </p>
        <div className="mt-auto border-t border-white/10 pt-4">
          {motors.length > 0 ? (
            <ul className="flex flex-col">
              {motors.map((product) => (
                <li key={product.slug}>
                  <Link
                    to="/products/$slug"
                    params={{ slug: product.slug }}
                    className="group flex min-h-11 items-center justify-between gap-3 text-sm font-medium transition-colors hover:text-accent"
                  >
                    {pick(product.name)}
                    <ArrowUpRight
                      className="size-4 shrink-0 text-white/50 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-3 text-xs text-white/45">
              {pick({
                th: "ข้อมูลรุ่นและสเปกเร็วๆ นี้",
                en: "Models and specs coming soon",
              })}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

export function SmartMotorTypes() {
  const pick = useBi();

  return (
    <section className="brand-section bg-cream">
      <div className={container}>
        <SectionHeading
          index="05"
          kicker="Compatibility"
          title={pick({
            th: "ใช้ได้กับม่านและมู่ลี่ทุกแบบ",
            en: "Fits every blind and curtain",
          })}
        />
        <ul className={cn(tileFrame, "mt-12 sm:grid-cols-2 lg:grid-cols-4")}>
          {SMART_MOTOR_TYPES.map((type, index) => (
            <TypeTile key={type.id} type={type} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
