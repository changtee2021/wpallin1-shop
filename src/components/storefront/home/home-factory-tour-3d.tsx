import { useState } from "react";
import {
  Blinds,
  CheckCircle2,
  Gauge,
  Package,
  Palette,
  Rows3,
  Timer,
} from "lucide-react";

import { HomeFactoryVisitHero } from "@/components/storefront/home/home-factory-visit";
import { useT } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { cn } from "@/lib/utils";

type IconComponent = typeof Factory;

type FactoryZoneStat = {
  labelKey: TranslationKey;
  valueKey: TranslationKey;
  icon: IconComponent;
};

type FactoryZoneTheme = {
  chipActive: string;
  chipIdle: string;
  pulseBg: string;
  iconBg: string;
  iconText: string;
};

type FactoryZoneHotspot = {
  x: number;
  y: number;
};

type FactoryZone = {
  id: "blinds" | "fabric" | "tracks";
  icon: IconComponent;
  nameKey: TranslationKey;
  taglineKey: TranslationKey;
  descriptionKey: TranslationKey;
  producingKey: TranslationKey;
  productKeys: TranslationKey[];
  stats: FactoryZoneStat[];
  theme: FactoryZoneTheme;
  hotspot: FactoryZoneHotspot;
};

const FACTORY_IMAGE_SRC = "/home/wpall-factory-isometric-3-zones.png";

const ZONES: FactoryZone[] = [
  {
    id: "blinds",
    icon: Blinds,
    nameKey: "home.factoryTour.zone1.name",
    taglineKey: "home.factoryTour.zone1.tagline",
    descriptionKey: "home.factoryTour.zone1.description",
    producingKey: "home.factoryTour.zone1.producing",
    productKeys: [
      "home.factoryTour.zone1.product1",
      "home.factoryTour.zone1.product2",
      "home.factoryTour.zone1.product3",
      "home.factoryTour.zone1.product4",
    ],
    stats: [
      {
        labelKey: "home.factoryTour.zone1.stat1.label",
        valueKey: "home.factoryTour.zone1.stat1.value",
        icon: Gauge,
      },
      {
        labelKey: "home.factoryTour.zone1.stat2.label",
        valueKey: "home.factoryTour.zone1.stat2.value",
        icon: Package,
      },
      {
        labelKey: "home.factoryTour.zone1.stat3.label",
        valueKey: "home.factoryTour.zone1.stat3.value",
        icon: Timer,
      },
      {
        labelKey: "home.factoryTour.zone1.stat4.label",
        valueKey: "home.factoryTour.zone1.stat4.value",
        icon: CheckCircle2,
      },
    ],
    theme: {
      chipActive: "bg-sky-500 text-white",
      chipIdle: "bg-sky-50 text-sky-700",
      pulseBg: "bg-sky-400",
      iconBg: "bg-sky-100",
      iconText: "text-sky-600",
    },
    hotspot: { x: 15, y: 37 },
  },
  {
    id: "fabric",
    icon: Palette,
    nameKey: "home.factoryTour.zone2.name",
    taglineKey: "home.factoryTour.zone2.tagline",
    descriptionKey: "home.factoryTour.zone2.description",
    producingKey: "home.factoryTour.zone2.producing",
    productKeys: [
      "home.factoryTour.zone2.product1",
      "home.factoryTour.zone2.product2",
      "home.factoryTour.zone2.product3",
      "home.factoryTour.zone2.product4",
    ],
    stats: [
      {
        labelKey: "home.factoryTour.zone2.stat1.label",
        valueKey: "home.factoryTour.zone2.stat1.value",
        icon: Gauge,
      },
      {
        labelKey: "home.factoryTour.zone2.stat2.label",
        valueKey: "home.factoryTour.zone2.stat2.value",
        icon: Package,
      },
      {
        labelKey: "home.factoryTour.zone2.stat3.label",
        valueKey: "home.factoryTour.zone2.stat3.value",
        icon: Timer,
      },
      {
        labelKey: "home.factoryTour.zone2.stat4.label",
        valueKey: "home.factoryTour.zone2.stat4.value",
        icon: CheckCircle2,
      },
    ],
    theme: {
      chipActive: "bg-amber-500 text-white",
      chipIdle: "bg-amber-50 text-amber-700",
      pulseBg: "bg-amber-400",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
    },
    hotspot: { x: 48, y: 50 },
  },
  {
    id: "tracks",
    icon: Rows3,
    nameKey: "home.factoryTour.zone3.name",
    taglineKey: "home.factoryTour.zone3.tagline",
    descriptionKey: "home.factoryTour.zone3.description",
    producingKey: "home.factoryTour.zone3.producing",
    productKeys: [
      "home.factoryTour.zone3.product1",
      "home.factoryTour.zone3.product2",
      "home.factoryTour.zone3.product3",
      "home.factoryTour.zone3.product4",
    ],
    stats: [
      {
        labelKey: "home.factoryTour.zone3.stat1.label",
        valueKey: "home.factoryTour.zone3.stat1.value",
        icon: Gauge,
      },
      {
        labelKey: "home.factoryTour.zone3.stat2.label",
        valueKey: "home.factoryTour.zone3.stat2.value",
        icon: Package,
      },
      {
        labelKey: "home.factoryTour.zone3.stat3.label",
        valueKey: "home.factoryTour.zone3.stat3.value",
        icon: Timer,
      },
      {
        labelKey: "home.factoryTour.zone3.stat4.label",
        valueKey: "home.factoryTour.zone3.stat4.value",
        icon: CheckCircle2,
      },
    ],
    theme: {
      chipActive: "bg-violet-500 text-white",
      chipIdle: "bg-violet-50 text-violet-700",
      pulseBg: "bg-violet-400",
      iconBg: "bg-violet-100",
      iconText: "text-violet-600",
    },
    hotspot: { x: 77, y: 63 },
  },
];

export function HomeFactoryTour3D() {
  const { t } = useT();
  const [activeId, setActiveId] = useState<FactoryZone["id"]>(ZONES[0].id);
  const activeZone = ZONES.find((zone) => zone.id === activeId) ?? ZONES[0];

  return (
    <section aria-labelledby="factory-visit-heading">
      <div className="-mt-8 pb-6 sm:-mt-10 sm:pb-8">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(16rem,1fr)] lg:gap-x-6 lg:gap-y-2">
          <div className="relative lg:col-start-1 lg:row-start-1">
            <img
              src={FACTORY_IMAGE_SRC}
              alt={t("home.factoryTour.title")}
              loading="lazy"
              decoding="async"
              className="block w-full bg-transparent mix-blend-multiply select-none"
            />

            {ZONES.map((zone, index) => {
              const isActive = zone.id === activeId;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => setActiveId(zone.id)}
                  aria-pressed={isActive}
                  aria-controls="factory-tour-panel"
                  aria-label={t(zone.nameKey)}
                  style={{
                    left: `${zone.hotspot.x}%`,
                    top: `${zone.hotspot.y}%`,
                  }}
                  className="absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {isActive ? (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inline-flex size-9 animate-ping rounded-full opacity-60",
                        zone.theme.pulseBg,
                      )}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-full text-sm font-bold shadow-lg ring-4 ring-white transition-transform duration-300",
                      isActive
                        ? cn(zone.theme.chipActive, "scale-110")
                        : cn(zone.theme.chipIdle, "hover:scale-105"),
                    )}
                  >
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="order-last text-center text-xs text-muted-foreground lg:order-none lg:col-start-1 lg:row-start-2">
            {t("home.factoryTour.hint")}
          </p>

          <div className="lg:col-start-2 lg:row-start-1 lg:h-0 lg:min-h-full">
            <div
              key={activeZone.id}
              id="factory-tour-panel"
              role="region"
              aria-label={t(activeZone.nameKey)}
              className="flex h-full min-h-0 flex-col gap-4 rounded-2xl border border-border bg-white/90 p-4 duration-300 animate-in fade-in slide-in-from-right-2 sm:p-5"
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    activeZone.theme.iconBg,
                  )}
                >
                  <activeZone.icon
                    className={cn("size-5", activeZone.theme.iconText)}
                    aria-hidden
                  />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-primary sm:text-lg">
                    {t(activeZone.nameKey)}
                  </h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {t(activeZone.taglineKey)}
                  </p>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 sm:gap-3">
                {activeZone.stats.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={stat.labelKey}
                      className="flex min-h-0 flex-col justify-center rounded-xl border border-border p-3"
                    >
                      <StatIcon
                        className="size-4 text-muted-foreground"
                        aria-hidden
                      />
                      <p className="mt-1.5 text-lg font-bold tabular-nums text-primary sm:text-xl">
                        {t(stat.valueKey)}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                        {t(stat.labelKey)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HomeFactoryVisitHero className="overflow-hidden rounded-2xl" />
    </section>
  );
}
