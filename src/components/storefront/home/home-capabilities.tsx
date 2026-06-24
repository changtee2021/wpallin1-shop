import { Building2, Globe, Settings2, Sparkles } from "lucide-react";

import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";

const items: {
  icon: typeof Globe;
  titleKey: TranslationKey;
  descKey: TranslationKey;
}[] = [
  {
    icon: Globe,
    titleKey: "home.capabilities.global.title",
    descKey: "home.capabilities.global.desc",
  },
  {
    icon: Sparkles,
    titleKey: "home.capabilities.tailor.title",
    descKey: "home.capabilities.tailor.desc",
  },
  {
    icon: Settings2,
    titleKey: "home.capabilities.motorized.title",
    descKey: "home.capabilities.motorized.desc",
  },
  {
    icon: Building2,
    titleKey: "home.capabilities.projects.title",
    descKey: "home.capabilities.projects.desc",
  },
];

export function HomeCapabilities() {
  const { t } = useT();

  return (
    <section>
      <h2 className="mb-6 text-center text-xl font-bold text-primary sm:text-2xl">
        {t("home.capabilities.title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, titleKey, descKey }) => (
          <div
            key={titleKey}
            className="rounded-xl border border-border/60 bg-secondary/50 p-5 transition-shadow hover:shadow-md"
          >
            <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <h3 className="font-semibold text-foreground">{t(titleKey)}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
