import { Link } from "@tanstack/react-router";
import { ArrowRight, Factory, Settings2, Store } from "lucide-react";

import { useT } from "@/i18n";

const pillars = [
  {
    icon: Factory,
    titleKey: "home.pillars.factory.title" as const,
    descKey: "home.pillars.factory.desc" as const,
    to: "/about" as const,
  },
  {
    icon: Settings2,
    titleKey: "home.pillars.custom.title" as const,
    descKey: "home.pillars.custom.desc" as const,
    to: "/configurator" as const,
  },
  {
    icon: Store,
    titleKey: "home.pillars.dealer.title" as const,
    descKey: "home.pillars.dealer.desc" as const,
    to: "/dealer/register" as const,
  },
];

export function HomeValuePillars() {
  const { t } = useT();

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary sm:text-2xl">
            {t("home.pillars.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("home.pillars.subtitle")}
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {pillars.map(({ icon: Icon, titleKey, descKey, to }) => (
          <Link
            key={titleKey}
            to={to}
            className="group flex flex-col rounded-2xl border border-border/60 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon className="size-6" />
            </span>
            <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {t(descKey)}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {t("home.pillars.learnMore")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
