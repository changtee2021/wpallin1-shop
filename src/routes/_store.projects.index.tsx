import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

import { ProjectCard } from "@/components/brand/project-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import {
  PROJECT_KIND_LABELS,
  PROJECTS,
  type ProjectKind,
} from "@/data/projects";
import { useT } from "@/i18n";
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
  const { t } = useT();
  const pick = useBi();
  const { kind } = Route.useSearch();
  const visible = kind
    ? PROJECTS.filter((project) => project.kind === kind)
    : PROJECTS;
  const [lead, ...rest] = visible;

  const tabs: {
    value: ProjectKind | undefined;
    label: string;
    count: number;
  }[] = [
    {
      value: undefined,
      label: pick({ th: "ทั้งหมด", en: "All" }),
      count: PROJECTS.length,
    },
    ...PROJECT_KINDS.map((value) => ({
      value,
      label: pick(PROJECT_KIND_LABELS[value]),
      count: PROJECTS.filter((project) => project.kind === value).length,
    })),
  ];

  return (
    <>
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 pt-14 pb-10 sm:px-6 lg:px-8 lg:pt-20">
          <SectionHeading
            as="h1"
            kicker={t("nav.projects")}
            title={pick({
              th: "งานจริงที่ใช้สินค้าของเรา",
              en: "Work built with our products",
            })}
            description={pick({
              th: "ตั้งแต่ผ้าม่านพิมพ์ลายผืนใหญ่ในงานนิทรรศการ ไปจนถึงงานติดตั้งของตัวแทนจำหน่ายทั่วประเทศ",
              en: "From large printed curtains at exhibitions to installations by our dealers across Thailand.",
            })}
          />
          <nav
            aria-label={pick({ th: "กรองผลงาน", en: "Filter projects" })}
            className="mt-10 flex flex-wrap gap-2"
          >
            {tabs.map((tab) => {
              const active = tab.value === kind;
              return (
                <Link
                  key={tab.value ?? "all"}
                  to="/projects"
                  search={tab.value ? { kind: tab.value } : {}}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:border-primary hover:text-primary",
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "text-xs",
                      active
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {tab.count}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {lead ? (
          <RevealOnScroll>
            <ProjectCard
              project={lead}
              imageClassName="aspect-[4/3] lg:aspect-[21/9]"
            />
          </RevealOnScroll>
        ) : null}
        {rest.length ? (
          <div className="mt-16 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        ) : null}
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
