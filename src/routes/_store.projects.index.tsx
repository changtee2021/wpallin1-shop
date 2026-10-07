import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import {
  PROJECT_KIND_LABELS,
  PROJECTS,
  type Project,
  type ProjectKind,
} from "@/data/projects";
import { useBi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PROJECT_KINDS = [
  "showcase",
  "dealer",
] as const satisfies readonly ProjectKind[];

const projectsSearchSchema = z.object({
  kind: z.enum(PROJECT_KINDS).optional().catch(undefined),
});

/** Tiles in the first row play the page-entry motion; later rows rise on scroll instead. */
const FIRST_ROW = 4;

export const Route = createFileRoute("/_store/projects/")({
  validateSearch: (search) => projectsSearchSchema.parse(search),
  head: () =>
    pageHead({
      title: "ผลงาน | WP ALL",
      description:
        "ผลงานม่านพิมพ์ลาย งานนิทรรศการ และงานติดตั้งจากตัวแทนจำหน่าย WP ALL ทั่วประเทศ เช่น Colors of Buriram 2025 และ Bangkok Design Week 2025",
      path: "/projects",
    }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const pick = useBi();
  const { kind } = Route.useSearch();
  const visible = kind
    ? PROJECTS.filter((project) => project.kind === kind)
    : PROJECTS;

  const kindOptions: { value: ProjectKind | undefined; label: string }[] = [
    { value: undefined, label: pick({ th: "ทั้งหมด", en: "All" }) },
    ...PROJECT_KINDS.map((value) => ({
      value,
      label: pick(PROJECT_KIND_LABELS[value]),
    })),
  ];

  return (
    <>
      <div
        aria-hidden
        className="scroll-progress pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16">
        <p className="hero-blur-in brand-kicker flex items-center gap-3 text-primary">
          <span aria-hidden className="h-px w-8 bg-accent" />
          Showcase · Dealers
        </p>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h1 className="scroll-fade-away text-[clamp(3.25rem,11vw,8.5rem)] leading-[0.95] font-medium tracking-tight text-foreground">
            <span className="hero-word inline-block">Projects</span>
            <sup
              className="hero-blur-in ml-2 inline-block align-super text-[0.22em] font-normal tracking-normal text-muted-foreground"
              style={{ ["--delay" as string]: "350ms" }}
            >
              ({PROJECTS.length})
            </sup>
          </h1>
          <p
            className="hero-blur-in max-w-sm text-base leading-7 text-pretty text-muted-foreground lg:pb-4 lg:text-right"
            style={{ ["--delay" as string]: "450ms" }}
          >
            {pick({
              th: "งานจริงที่ใช้สินค้าของเรา ตั้งแต่ผ้าม่านพิมพ์ลายในงานนิทรรศการ ไปจนถึงงานติดตั้งของตัวแทนทั่วประเทศ",
              en: "",
            })}
          </p>
        </div>

        <nav
          aria-label="Type"
          className="hero-blur-in mt-12 flex gap-8 border-t border-border pt-6 sm:gap-12 lg:mt-16"
          style={{ ["--delay" as string]: "600ms" }}
        >
          <p className="w-12 pt-3 text-sm text-foreground">Type</p>
          <ul className="flex flex-col">
            {kindOptions.map((option) => {
              const count = option.value
                ? PROJECTS.filter((p) => p.kind === option.value).length
                : PROJECTS.length;
              return (
                <FilterLink
                  key={option.value ?? "all"}
                  active={option.value === kind}
                  kind={option.value}
                >
                  {option.label}
                  <span className="ml-1.5 text-xs text-muted-foreground">
                    {count}
                  </span>
                </FilterLink>
              );
            })}
          </ul>
        </nav>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-10 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        {visible.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            {pick({
              th: "ยังไม่มีผลงานในหมวดนี้",
              en: "No projects in this category yet.",
            })}
          </p>
        ) : (
          <ProjectGallery key={kind ?? "all"} projects={visible} />
        )}
      </section>

      <section className="border-t border-border bg-primary-deep text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="max-w-2xl">
            <p className="brand-kicker text-accent">Have a project?</p>
            <p className="mt-3 text-2xl font-semibold text-balance">
              {pick({
                th: "ส่งแบบหรือขนาดพื้นที่มา ทีมงานช่วยเลือกสินค้าและคำนวณให้",
                en: "Send us drawings or sizes — we'll help pick the products and work out the numbers.",
              })}
            </p>
          </div>
          <Link
            to="/contact"
            search={{ topic: "project" }}
            className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white hover:bg-accent/90"
          >
            {pick({ th: "ปรึกษางานโครงการ", en: "Discuss a project" })}
          </Link>
        </div>
      </section>
    </>
  );
}

function FilterLink({
  active,
  kind,
  children,
}: {
  active: boolean;
  kind: ProjectKind | undefined;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        to="/projects"
        search={kind ? { kind } : {}}
        replace
        resetScroll={false}
        aria-current={active ? "page" : undefined}
        className={cn(
          "inline-flex min-h-11 items-center text-sm transition-colors",
          active
            ? "font-medium text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
      </Link>
    </li>
  );
}

function ProjectGallery({ projects }: { projects: Project[] }) {
  const pick = useBi();

  return (
    <ul className="grid grid-cols-2 gap-1 md:grid-cols-3 lg:grid-cols-4">
      {projects.map((project, index) => {
        const firstRow = index < FIRST_ROW;
        const meta = [
          pick(PROJECT_KIND_LABELS[project.kind]),
          project.location ? pick(project.location) : null,
          project.year,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li
            key={project.slug}
            className={firstRow ? "hero-blur-in" : "scroll-rise"}
            style={
              firstRow
                ? { ["--delay" as string]: `${700 + index * 90}ms` }
                : { ["--i" as string]: index % FIRST_ROW }
            }
          >
            <Link
              to="/projects/$slug"
              params={{ slug: project.slug }}
              className="group relative block overflow-hidden bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="aspect-square overflow-hidden">
                <div className="scroll-zoom size-full">
                  <img
                    src={project.cover}
                    alt={pick(project.title)}
                    loading={firstRow ? "eager" : "lazy"}
                    decoding="async"
                    className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-3 pt-12 text-white transition-opacity duration-300 sm:p-4 sm:pt-16 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100">
                <p className="line-clamp-2 text-sm font-medium sm:text-base">
                  {pick(project.title)}
                </p>
                <p className="mt-0.5 hidden truncate text-xs text-white/75 sm:block">
                  {meta}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
