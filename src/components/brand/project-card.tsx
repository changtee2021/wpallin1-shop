import { Link } from "@tanstack/react-router";

import { PROJECT_KIND_LABELS, type Project } from "@/data/projects";
import { useBi } from "@/lib/bi";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
  className?: string;
  imageClassName?: string;
};

export function ProjectCard({
  project,
  className,
  imageClassName,
}: ProjectCardProps) {
  const pick = useBi();
  const meta = [
    pick(PROJECT_KIND_LABELS[project.kind]),
    project.location ? pick(project.location) : null,
    project.year,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      to="/projects/$slug"
      params={{ slug: project.slug }}
      className={cn(
        "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 rounded-sm",
        className,
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-sm bg-surface",
          imageClassName ?? "aspect-[4/3]",
        )}
      >
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
        {meta}
      </p>
      <h3 className="mt-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
        {pick(project.title)}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {pick(project.summary)}
      </p>
    </Link>
  );
}
