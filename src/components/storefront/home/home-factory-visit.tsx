import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type HomeFactoryVisitHeroProps = {
  className?: string;
};

/** Warehouse / factory intro — embeddable bottom of the combined factory section. */
export function HomeFactoryVisitHero({ className }: HomeFactoryVisitHeroProps) {
  const { t } = useT();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src="/home/wpall-factory-warehouse.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-white/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      <div className="relative z-10 flex min-h-[22rem] max-w-xl flex-col justify-center gap-3 px-6 py-10 sm:min-h-[26rem] sm:px-10">
        <p className="text-xs font-semibold tracking-[0.18em] text-white/80 uppercase">
          {t("home.factory.eyebrow")}
        </p>
        <h2
          id="factory-visit-heading"
          className="text-balance text-2xl font-bold text-white sm:text-3xl"
        >
          {t("home.factory.title")}
        </h2>
        <p className="text-sm leading-relaxed text-white/85 sm:text-base">
          {t("home.factory.body1")}
        </p>
        <p
          aria-hidden
          className="invisible text-sm leading-relaxed sm:text-base"
        >
          {t("home.factory.body2")}
        </p>
        <Link
          to="/contact"
          search={{ topic: "factory-visit" }}
          className="mt-2 inline-flex min-h-11 w-fit items-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground hover:bg-accent/90 active:bg-accent/80 sm:min-h-9"
        >
          {t("home.factory.cta")}
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

/** Standalone wrapper (legacy) — prefer HomeFactoryTour3D on the home page. */
export function HomeFactoryVisit() {
  return (
    <section className="overflow-hidden rounded-2xl">
      <HomeFactoryVisitHero />
    </section>
  );
}
