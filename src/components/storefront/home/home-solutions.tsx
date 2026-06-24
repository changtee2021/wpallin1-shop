import { Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Home, Settings2, Sun } from "lucide-react";

import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";

type SolutionItem = {
  icon: typeof Home;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  to: "/shop" | "/configurator" | "/contact";
  search?: { category: string };
};

const items: SolutionItem[] = [
  {
    icon: Home,
    titleKey: "home.solutions.indoor.title",
    descKey: "home.solutions.indoor.desc",
    to: "/shop",
    search: { category: "curtains" },
  },
  {
    icon: Sun,
    titleKey: "home.solutions.outdoor.title",
    descKey: "home.solutions.outdoor.desc",
    to: "/shop",
    search: { category: "roller-blinds" },
  },
  {
    icon: Settings2,
    titleKey: "home.solutions.motorized.title",
    descKey: "home.solutions.motorized.desc",
    to: "/configurator",
  },
  {
    icon: Building2,
    titleKey: "home.solutions.commercial.title",
    descKey: "home.solutions.commercial.desc",
    to: "/contact",
  },
];

export function HomeSolutions() {
  const { t } = useT();

  return (
    <section>
      <h2 className="mb-6 text-xl font-bold text-primary sm:text-2xl">
        {t("home.solutions.title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ icon: Icon, titleKey, descKey, to, search }) => (
          <Link
            key={titleKey}
            to={to}
            search={search}
            className="group flex items-start gap-4 rounded-xl border border-border/60 bg-white p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
              <Icon className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t(descKey)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
