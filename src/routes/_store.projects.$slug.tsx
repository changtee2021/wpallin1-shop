import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { BrandPageError } from "@/components/brand/page-states";
import { ProductCard } from "@/components/brand/product-card";
import { SectionHeading } from "@/components/brand/section-heading";
import { RevealOnScroll } from "@/components/storefront/reveal-on-scroll";
import {
  getCatalogProduct,
  type CatalogProduct,
} from "@/data/products-catalog";
import { PROJECT_KIND_LABELS, PROJECTS, getProject } from "@/data/projects";
import { useT } from "@/i18n";
import { useBi } from "@/lib/bi";
import { absoluteUrl } from "@/lib/public-url";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/projects/$slug")({
  loader: ({ params }) => {
    const project = getProject(params.slug);
    if (!project) throw redirect({ to: "/projects", replace: true });
    return { project };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.project) return {};
    const { project } = loaderData;
    return pageHead({
      title: `${project.title.th} | ผลงาน WP ALL`,
      description: project.summary.th,
      path: `/projects/${project.slug}`,
      image: project.cover,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: project.title.th,
        alternateName: project.title.en,
        description: project.summary.th,
        image: [project.cover, ...project.gallery].map((src) =>
          absoluteUrl(src),
        ),
        ...(project.year ? { dateCreated: project.year } : {}),
        creator: { "@type": "Organization", name: "WP ALL" },
      },
    });
  },
  errorComponent: ({ reset }) => <BrandPageError onRetry={reset} />,
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { t } = useT();
  const pick = useBi();
  const { project } = Route.useLoaderData();

  const products = project.productSlugs
    .map((slug) => getCatalogProduct(slug))
    .filter((product): product is CatalogProduct => Boolean(product));
  const index = PROJECTS.findIndex((item) => item.slug === project.slug);
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const facts = [
    {
      label: "Type",
      value: pick(PROJECT_KIND_LABELS[project.kind]),
    },
    project.partner
      ? {
          label: "Delivered by",
          value: pick(project.partner),
        }
      : null,
    project.location
      ? {
          label: "Location",
          value: pick(project.location),
        }
      : null,
    project.year ? { label: "Year", value: project.year } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <article>
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          to="/projects"
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("nav.projects")}
        </Link>
      </div>

      <header className="mx-auto max-w-7xl px-4 pt-6 pb-10 sm:px-6 lg:px-8">
        <p className="brand-kicker text-primary">
          {PROJECT_KIND_LABELS[project.kind].en}
        </p>
        <h1 className="brand-display mt-4 max-w-4xl text-foreground text-balance">
          {pick(project.title)}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
          {pick(project.summary)}
        </p>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface lg:aspect-[21/9]">
          <img
            src={project.cover}
            alt={pick(project.title)}
            fetchPriority="high"
            className="size-full object-cover"
          />
        </div>
      </div>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-20 lg:px-8 lg:py-24">
        <dl className="grid h-fit grid-cols-2 gap-6 border-t border-border pt-6 lg:grid-cols-1">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="brand-kicker text-muted-foreground">
                {fact.label}
              </dt>
              <dd className="mt-1.5 text-sm font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
        <div className="max-w-3xl space-y-6 text-lg leading-8 text-foreground text-pretty">
          {project.story.map((paragraph) => (
            <p key={paragraph.en}>{pick(paragraph)}</p>
          ))}
        </div>
      </section>

      {project.gallery.length ? (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div
            className={
              project.gallery.length === 1
                ? "grid"
                : "grid gap-4 sm:grid-cols-2"
            }
          >
            {project.gallery.map((src, i) => (
              <RevealOnScroll key={src}>
                <div
                  className={
                    project.gallery.length === 3 && i === 0
                      ? "aspect-[4/3] overflow-hidden rounded-sm bg-surface sm:col-span-2 sm:aspect-[21/9]"
                      : "aspect-[4/3] overflow-hidden rounded-sm bg-surface"
                  }
                >
                  <img
                    src={src}
                    alt={`${pick(project.title)} ${i + 2}`}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover"
                  />
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </section>
      ) : null}

      {products.length ? (
        <section className="brand-section border-t border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              kicker="Products used"
              title="In this project"
              description={pick({ th: "สินค้าในงานนี้", en: "" })}
            />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {next && next.slug !== project.slug ? (
        <Link
          to="/projects/$slug"
          params={{ slug: next.slug }}
          className="group block border-t border-border bg-primary-deep text-white"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-12 sm:px-6 lg:px-8">
            <div>
              <p className="brand-kicker text-accent">Next project</p>
              <p className="mt-2 text-2xl font-semibold text-balance">
                {pick(next.title)}
              </p>
            </div>
            <ArrowRight
              className="size-8 shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </div>
        </Link>
      ) : null}
    </article>
  );
}
