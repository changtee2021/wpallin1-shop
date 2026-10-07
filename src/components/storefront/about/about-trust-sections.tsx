import { Link } from "@tanstack/react-router";
import { ArrowUpRight, MapPin } from "lucide-react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  ABOUT_COMPANY_EXTRA_FACTS,
  ABOUT_MILESTONES,
  ABOUT_STATS,
} from "@/data/about-content";
import { PROJECTS } from "@/data/projects";
import { useBi, type Bi } from "@/lib/bi";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Unconfirmed facts are visible only on the local dev server, never in a production build. */
const SHOW_DRAFTS = import.meta.env.DEV;

function published<T extends { confirmed: boolean }>(items: T[]): T[] {
  return SHOW_DRAFTS ? items : items.filter((item) => item.confirmed);
}

function DraftTag({ confirmed }: { confirmed: boolean }) {
  if (confirmed) return null;
  return (
    <span className="ml-2 inline-flex items-center rounded-full border border-dashed border-amber-500 px-2 py-0.5 align-middle text-[10px] font-semibold tracking-wide text-amber-600 uppercase">
      Draft
    </span>
  );
}

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/** Dark hairline frame around a tile grid, shared with the Smart Motor page look. */
export const tileFrame = "grid gap-1.5 rounded-sm bg-foreground p-1.5";

/**
 * Bento layout for the number tiles, in reading order. A tile with `image` becomes a photo
 * band with the figure laid over it; the rest are solid colour blocks.
 */
const STAT_TILES: {
  className: string;
  image?: string;
  tone: "dark" | "light";
}[] = [
  { className: "bg-neutral-900 lg:col-span-5", tone: "dark" },
  { className: "bg-surface lg:col-span-4", tone: "light" },
  { className: "bg-cream lg:col-span-4", tone: "light" },
  { className: "bg-accent lg:col-span-4", tone: "dark" },
  {
    className: "bg-neutral-900 lg:col-span-7",
    image: "/about/philosophy-drapes.webp",
    tone: "dark",
  },
  { className: "bg-primary-deep lg:col-span-5", tone: "dark" },
];

export function AboutNumbers() {
  const pick = useBi();
  const stats = published(ABOUT_STATS);
  if (!stats.length) return null;

  return (
    <section className="brand-section bg-background">
      <div className={container}>
        <SectionHeading
          hideKicker
          kicker="In numbers"
          title="WP ALL in numbers"
          description={pick({ th: "ความพร้อมของเราในตัวเลข", en: "" })}
        />
        <dl className={cn(tileFrame, "mt-12 sm:grid-cols-2 lg:grid-cols-12")}>
          <div className="scroll-scale-in relative min-h-72 overflow-hidden rounded-sm bg-surface sm:col-span-2 lg:col-span-7 lg:min-h-[26rem]">
            <div className="scroll-zoom absolute inset-0">
              <img
                src="/about/wood-blind-hands.webp"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
              />
            </div>
            <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-foreground">
              {pick({ th: "งานจริงจากสายผลิต", en: "Made on our own lines" })}
            </span>
          </div>
          {stats.map((stat, index) => (
            <StatTile
              key={stat.label.en}
              stat={stat}
              index={index}
              tile={STAT_TILES[index % STAT_TILES.length]}
            />
          ))}
        </dl>
      </div>
    </section>
  );
}

function StatTile({
  stat,
  index,
  tile,
}: {
  stat: (typeof ABOUT_STATS)[number];
  index: number;
  tile: (typeof STAT_TILES)[number];
}) {
  const pick = useBi();
  const [amount, suffix] = splitSuffix(stat.value);
  const dark = tile.tone === "dark";
  const isNumber = /^\d/.test(stat.value);

  return (
    <div
      className={cn(
        "scroll-scale-in relative flex min-h-56 flex-col justify-between gap-8 overflow-hidden rounded-sm p-6 lg:min-h-72 lg:p-8",
        tile.className,
        dark ? "text-white" : "text-foreground",
      )}
      style={{ ["--i" as string]: index % 3 }}
    >
      {tile.image ? (
        <>
          <div className="scroll-zoom absolute inset-0">
            <img
              src={tile.image}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="size-full object-cover opacity-70"
            />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(0_0_0/0.78),rgb(0_0_0/0.15)_75%)]" />
        </>
      ) : null}
      <dt
        className={cn(
          "relative max-w-xs text-sm leading-6 font-medium",
          dark ? "text-white/75" : "text-muted-foreground",
        )}
      >
        {pick(stat.label)}
        <DraftTag confirmed={stat.confirmed} />
      </dt>
      <dd
        className={cn(
          "relative leading-none font-medium tracking-tighter tabular-nums",
          isNumber
            ? "text-[clamp(3.25rem,6.5vw,6rem)]"
            : "text-[clamp(2.5rem,4.5vw,4rem)]",
        )}
      >
        {amount}
        {suffix ? (
          <span className={dark ? "text-white/60" : "text-accent"}>
            {suffix}
          </span>
        ) : null}
      </dd>
    </div>
  );
}

function splitSuffix(value: string): [string, string] {
  return value.endsWith("+") ? [value.slice(0, -1), "+"] : [value, ""];
}

export function AboutTimeline() {
  const pick = useBi();
  const milestones = published(ABOUT_MILESTONES);
  if (!milestones.length) return null;

  return (
    <section className="brand-section overflow-hidden bg-foreground text-white">
      <div className={container}>
        <SectionHeading
          tone="dark"
          hideKicker
          kicker="Our story"
          title="Our story so far"
          description={pick({ th: "เส้นทางของ WP ALL", en: "" })}
        />
        <ol className="mt-12 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((milestone, index) => (
            <li
              key={`${milestone.year}-${milestone.title.en}`}
              className="scroll-slide-right group relative flex min-h-72 flex-col justify-between gap-10 overflow-hidden rounded-sm bg-white/[0.06] p-6 transition-colors hover:bg-white/[0.1] sm:last:odd:col-span-2 lg:min-h-[28rem] lg:p-7 lg:last:odd:col-span-1"
            >
              {milestone.image ? (
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 top-0 z-10 h-[33%] -translate-y-[102%] overflow-hidden transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 motion-reduce:transition-none [@media(hover:none)]:hidden",
                    milestone.imageFit === "contain" && "bg-white",
                  )}
                >
                  <img
                    src={milestone.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={cn(
                      "size-full transition-transform duration-700 group-hover:scale-105",
                      milestone.imageFit === "contain"
                        ? "object-contain p-6"
                        : "object-cover",
                    )}
                  />
                </div>
              ) : null}
              <div className="flex items-start justify-between gap-4">
                <span className="text-sm font-medium text-white/40 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className="mt-1.5 size-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-150"
                />
              </div>
              <div>
                <p className="text-[clamp(3rem,5vw,4.25rem)] leading-none font-medium tracking-tighter text-transparent tabular-nums [-webkit-text-stroke:1.25px_rgb(255_255_255/0.85)]">
                  {milestone.year}
                </p>
                <h3 className="mt-5 text-xl font-medium tracking-tight">
                  {pick(milestone.title)}
                  <DraftTag confirmed={milestone.confirmed} />
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65 text-pretty">
                  {pick(milestone.body)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AboutProof() {
  const pick = useBi();
  const showcase = PROJECTS.filter(
    (project) => project.kind === "showcase",
  ).slice(0, 3);
  if (!showcase.length) return null;

  return (
    <section className="brand-section border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          hideKicker
          kicker="Proof"
          title="Trusted on real projects"
          description={pick({
            th: "ผลงานจริงที่ใช้สินค้าของเรา",
            en: "",
          })}
          action={
            <Link
              to="/projects"
              className="group inline-flex min-h-11 items-center gap-3 text-sm font-medium text-foreground"
            >
              <span className="flex size-11 items-center justify-center rounded-full border border-foreground/30 transition-colors group-hover:bg-foreground group-hover:text-background">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
              {pick({ th: "ดูผลงานทั้งหมด", en: "All projects" })}
            </Link>
          }
        />
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {showcase.map((project, index) => (
            <li
              key={project.slug}
              className={cn(
                "scroll-wipe-up-soft",
                index === 1 && "md:translate-y-10",
              )}
              style={{ ["--i" as string]: index }}
            >
              <Link
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-sm bg-surface">
                  <div className="scroll-zoom size-full">
                    <img
                      src={project.cover}
                      alt={pick(project.title)}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                </div>
                <p className="mt-4 text-xs tracking-wide text-muted-foreground uppercase">
                  {[
                    project.location ? pick(project.location) : null,
                    project.year,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h3 className="mt-1 text-lg font-medium transition-colors group-hover:text-primary">
                  {pick(project.title)}
                </h3>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function AboutCompanyProfile() {
  const pick = useBi();
  const address = pick({
    th: [
      siteConfig.address.line1,
      siteConfig.address.line2,
      siteConfig.address.city,
    ].join(" "),
    en: [
      siteConfig.addressEn.line1,
      siteConfig.addressEn.line2,
      siteConfig.addressEn.city,
    ].join(", "),
  });

  const facts: { label: Bi; value: string; confirmed: boolean }[] = [
    {
      label: { th: "ชื่อบริษัท", en: "Company" },
      value: pick({ th: siteConfig.legalName, en: siteConfig.legalNameEn }),
      confirmed: true,
    },
    ...published(ABOUT_COMPANY_EXTRA_FACTS).map((fact) => ({
      label: fact.label,
      value: pick(fact.value),
      confirmed: fact.confirmed,
    })),
    {
      label: { th: "สำนักงานและโรงงาน", en: "Office & factory" },
      value: address,
      confirmed: true,
    },
    {
      label: { th: "โทรศัพท์", en: "Phone" },
      value: siteConfig.phoneDisplay,
      confirmed: true,
    },
    {
      label: { th: "LINE", en: "LINE" },
      value: siteConfig.lineId,
      confirmed: true,
    },
  ];

  return (
    <section className="bg-primary-deep text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20 lg:px-8 lg:py-28">
        <div className="flex flex-col items-start">
          <SectionHeading
            tone="dark"
            hideKicker
            kicker="Company profile"
            title="Company profile"
            description={pick({
              th: "ข้อมูลบริษัทสำหรับคู่ค้าและงานโครงการ",
              en: "",
            })}
          />
          <div className="scroll-rise mt-10 flex flex-wrap gap-3">
            <a
              href={siteConfig.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10"
            >
              <MapPin className="size-4" aria-hidden />
              {pick({ th: "ดูแผนที่", en: "Open map" })}
            </a>
          </div>
        </div>
        <dl className="divide-y divide-white/15 border-y border-white/15">
          {facts.map((fact, index) => (
            <div
              key={fact.label.en}
              className="scroll-rise grid gap-1 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
              style={{ ["--i" as string]: index % 3 }}
            >
              <dt className="text-sm text-white/60">{pick(fact.label)}</dt>
              <dd className="text-base leading-7 text-white">
                {fact.value}
                <DraftTag confirmed={fact.confirmed} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
