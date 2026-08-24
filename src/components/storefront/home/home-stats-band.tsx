import {
  Building2,
  Clock,
  MapPin,
  Package,
  Users,
  Warehouse,
} from "lucide-react";

import { CountUpNumber } from "@/components/storefront/home/count-up-number";
import { HomeValuePillars } from "@/components/storefront/home/home-value-pillars";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { cn } from "@/lib/utils";

type Stat = {
  icon: typeof Users;
  valueKey: TranslationKey;
  labelKey: TranslationKey;
};

const STATS: Stat[] = [
  {
    icon: Clock,
    valueKey: "home.stats.years.value",
    labelKey: "home.stats.years.label",
  },
  {
    icon: Users,
    valueKey: "home.stats.dealers.value",
    labelKey: "home.stats.dealers.label",
  },
  {
    icon: Package,
    valueKey: "home.stats.skus.value",
    labelKey: "home.stats.skus.label",
  },
  {
    icon: MapPin,
    valueKey: "home.stats.coverage.value",
    labelKey: "home.stats.coverage.label",
  },
  {
    icon: Warehouse,
    valueKey: "home.stats.warehouse.value",
    labelKey: "home.stats.warehouse.label",
  },
  {
    icon: Building2,
    valueKey: "home.stats.support.value",
    labelKey: "home.stats.support.label",
  },
];

export function HomeStatsBand() {
  const { t } = useT();

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden pt-8 text-white sm:pt-10">
      <div aria-hidden className="absolute inset-x-0 top-0 bottom-24 bg-primary" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-primary to-transparent"
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-xl font-bold sm:text-2xl">
            {t("home.stats.title")}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-3 sm:gap-y-6 lg:grid-cols-6 lg:gap-y-0">
          {STATS.map(({ icon: Icon, valueKey, labelKey }) => (
            <div
              key={labelKey}
              className={cn(
                "border-l border-white/20 px-4 first:border-l-0 first:pl-0 sm:px-5",
                "max-sm:[&:nth-child(2n+1)]:border-l-0 max-sm:[&:nth-child(2n+1)]:pl-0",
                "sm:max-lg:[&:nth-child(3n+1)]:border-l-0 sm:max-lg:[&:nth-child(3n+1)]:pl-0",
                "max-sm:[&:nth-child(n+3)]:border-t max-sm:[&:nth-child(n+3)]:pt-5",
                "sm:max-lg:[&:nth-child(n+4)]:border-t sm:max-lg:[&:nth-child(n+4)]:pt-6",
              )}
            >
              <Icon className="size-5 text-accent" aria-hidden />
              <CountUpNumber
                value={t(valueKey)}
                className="mt-2 block text-2xl font-bold tabular-nums sm:text-3xl"
              />
              <p className="mt-1 text-xs leading-snug text-white/80 sm:text-sm">
                {t(labelKey)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 sm:mt-10">
          <HomeValuePillars />
        </div>
      </div>
    </section>
  );
}
