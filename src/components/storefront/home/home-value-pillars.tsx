import { Factory, Settings2, Store } from "lucide-react";

import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const pillars = [
  {
    icon: Factory,
    image: "/home/pillar-factory.png",
    titleKey: "home.pillars.factory.title" as const,
    descKey: "home.pillars.factory.desc" as const,
  },
  {
    icon: Settings2,
    image: "/home/pillar-custom.png",
    titleKey: "home.pillars.custom.title" as const,
    descKey: "home.pillars.custom.desc" as const,
  },
  {
    icon: Store,
    image: "/home/pillar-dealer.png",
    titleKey: "home.pillars.dealer.title" as const,
    descKey: "home.pillars.dealer.desc" as const,
  },
];

export function HomeValuePillars() {
  const [big, ...rest] = pillars;

  return (
    <div className="grid h-[30rem] grid-cols-2 grid-rows-2 gap-3 sm:h-[26rem] sm:gap-4">
      <PillarCard {...big} className="row-span-2" />
      {rest.map((pillar) => (
        <PillarCard key={pillar.titleKey} {...pillar} />
      ))}
    </div>
  );
}

type PillarCardProps = (typeof pillars)[number] & { className?: string };

function PillarCard({
  icon: Icon,
  image,
  titleKey,
  descKey,
  className,
}: PillarCardProps) {
  const { t } = useT();

  return (
    <article
      className={cn("relative overflow-hidden rounded-2xl", className)}
    >
      <img
        src={image}
        alt={t(titleKey)}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5">
        <span className="mb-2 flex size-9 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm sm:size-10">
          <Icon className="size-5" />
        </span>
        <h3 className="font-semibold text-white sm:text-lg">{t(titleKey)}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/85 sm:text-sm">
          {t(descKey)}
        </p>
      </div>
    </article>
  );
}
