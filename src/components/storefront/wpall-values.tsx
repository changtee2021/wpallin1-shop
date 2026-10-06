import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SectionHeading } from "@/components/brand/section-heading";
import {
  ABOUT_PROCESS,
  WPALL_TAGLINE,
  WPALL_VALUES,
  type WpallValue,
} from "@/data/about-content";
import { useBi } from "@/lib/bi";
import { cn } from "@/lib/utils";

const container = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const pad = (value: number) => String(value).padStart(2, "0");

/** Chips naming the production steps (or partner service) that back a value up. */
function useEvidenceChips() {
  const pick = useBi();
  return (value: WpallValue): string[] => {
    if (value.steps.length === 0) {
      return [pick({ th: "ทีมขายดูแลประจำ", en: "Dedicated sales contact" })];
    }
    return value.steps.map(
      (step) => pad(step) + " " + pick(ABOUT_PROCESS[step - 1].title),
    );
  };
}

/**
 * Each value in turn (About and Home). A pinned stage shows the active letter while its
 * promise and the production evidence behind it scroll through the middle of the screen.
 * `linkToAbout` adds a "Meet WP ALL" link beside the heading (used on the home page).
 */
export function WpallValuesPinned({
  index,
  linkToAbout = false,
}: {
  index?: string;
  linkToAbout?: boolean;
}) {
  const pick = useBi();
  const evidenceChips = useEvidenceChips();
  const [active, setActive] = useState(0);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = itemRefs.current.filter((node): node is HTMLLIElement =>
      Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="brand-section relative isolate bg-background">
      <div className={container}>
        <SectionHeading
          index={index}
          kicker="How we work"
          title={pick({
            th: "W-P-A-L-L หลักการทำงานของเรา",
            en: "W-P-A-L-L: how we work",
          })}
          description={pick({
            th: "ค่านิยม 5 ข้อที่เราแปลงเป็นคำมั่นต่อลูกค้า พร้อมหลักฐานจากขั้นตอนการทำงานจริง",
            en: "Five values turned into commitments to our customers, each backed by what happens on the production line.",
          })}
          action={
            linkToAbout ? (
              <Link
                to="/about"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary"
              >
                {pick({ th: "รู้จัก WP ALL", en: "Meet WP ALL" })}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ) : undefined
          }
        />

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <div
            aria-hidden
            className="relative hidden min-h-[30rem] overflow-hidden rounded-md bg-primary-deep text-white lg:sticky lg:top-28 lg:block"
          >
            <div className="absolute inset-x-8 top-7 flex items-center justify-between">
              <div className="flex gap-3 text-2xl font-medium">
                {WPALL_VALUES.map((value, i) => (
                  <span
                    key={value.name}
                    className={cn(
                      "transition-colors duration-500",
                      i === active ? "text-accent" : "text-white/25",
                    )}
                  >
                    {value.letter}
                  </span>
                ))}
              </div>
              <span className="brand-index text-white/60">
                {pad(active + 1)} / {pad(WPALL_VALUES.length)}
              </span>
            </div>

            {WPALL_VALUES.map((value, i) => {
              const on = i === active;
              return (
                <div
                  key={value.name}
                  className={cn(
                    "absolute inset-0 flex flex-col justify-center gap-4 px-10 pt-10 transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-none",
                    on
                      ? "translate-y-0 opacity-100 blur-0"
                      : "pointer-events-none translate-y-8 opacity-0 blur-sm",
                  )}
                >
                  <span className="text-[11rem] leading-[0.85] font-medium text-accent xl:text-[13rem]">
                    {value.letter}
                  </span>
                  <p className="text-3xl font-medium tracking-tight">
                    {value.name}
                  </p>
                  <p className="text-base text-white/70">
                    {pick(value.tagline)}
                  </p>
                </div>
              );
            })}

            <div className="absolute inset-x-8 bottom-7 flex gap-1.5">
              {WPALL_VALUES.map((value, i) => (
                <span
                  key={value.name}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-white/20"
                >
                  <span
                    className={cn(
                      "block h-full origin-left bg-accent transition-transform duration-700 ease-out motion-reduce:transition-none",
                      i <= active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              ))}
            </div>
          </div>

          <ol>
            {WPALL_VALUES.map((value, i) => {
              const on = i === active;
              return (
                <li
                  key={value.name}
                  ref={(node) => {
                    itemRefs.current[i] = node;
                  }}
                  data-index={i}
                  className="border-t border-border py-8 first:border-t-0 first:pt-0 lg:flex lg:min-h-[46svh] lg:flex-col lg:justify-center lg:py-0"
                >
                  <div
                    className={cn(
                      "transition-opacity duration-500",
                      on ? "opacity-100" : "opacity-100 lg:opacity-35",
                    )}
                  >
                    <div className="flex items-baseline gap-4 lg:hidden">
                      <span className="text-5xl leading-none font-medium text-accent">
                        {value.letter}
                      </span>
                      <div>
                        <p className="text-lg font-medium tracking-tight">
                          {value.name}
                        </p>
                        <p className="text-sm text-primary">
                          {pick(value.tagline)}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xl leading-9 font-medium tracking-tight text-foreground text-balance lg:mt-0 lg:text-3xl lg:leading-[1.5]">
                      {pick(value.promise)}
                    </p>
                    <div className="mt-5 border-l-2 border-accent pl-4">
                      <p className="brand-kicker text-muted-foreground">
                        {pick({
                          th: "หลักฐานจากการทำงานจริง",
                          en: "Seen in how we work",
                        })}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground lg:text-base">
                        {pick(value.evidence)}
                      </p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {evidenceChips(value).map((chip) => (
                          <li
                            key={chip}
                            className="rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground"
                          >
                            {chip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-lg font-medium tracking-tight text-foreground text-balance lg:text-2xl">
          {pick(WPALL_TAGLINE)}
        </p>
      </div>
    </section>
  );
}
