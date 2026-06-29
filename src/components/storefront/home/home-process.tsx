import {
  Headphones,
  MessageSquare,
  Package,
  Ruler,
  Wrench,
} from "lucide-react";

import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";

const steps: { icon: typeof MessageSquare; labelKey: TranslationKey }[] = [
  { icon: MessageSquare, labelKey: "home.process.consult" },
  { icon: Ruler, labelKey: "home.process.measure" },
  { icon: Package, labelKey: "home.process.produce" },
  { icon: Wrench, labelKey: "home.process.install" },
  { icon: Headphones, labelKey: "home.process.support" },
];

export function HomeProcess() {
  const { t } = useT();

  return (
    <section className="rounded-2xl bg-muted/40 px-4 py-8 sm:px-8 sm:py-10">
      <h2 className="mb-8 text-center text-xl font-bold text-primary sm:text-2xl">
        {t("home.process.title")}
      </h2>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
        {steps.map(({ icon: Icon, labelKey }, index) => (
          <div
            key={labelKey}
            className="relative flex flex-col items-center text-center"
          >
            <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Icon className="size-5" />
            </span>
            <span className="text-xs font-medium text-foreground sm:text-sm">
              {t(labelKey)}
            </span>
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className="absolute top-6 left-[calc(50%+1.5rem)] hidden h-px w-[calc(100%-3rem)] bg-primary/20 md:block"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
