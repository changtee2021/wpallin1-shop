import { Link } from "@tanstack/react-router";
import { Home, SwatchBook, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type Tab = "rooms" | "materials";

type Props = {
  activeTab: Tab;
};

export function InspirationHubTabs({ activeTab }: Props) {
  const { t } = useT();

  const tabs: {
    id: Tab;
    label: string;
    icon: LucideIcon;
    search: { tab?: Tab };
  }[] = [
    {
      id: "rooms",
      label: t("inspiration.tab.rooms"),
      icon: Home,
      search: {},
    },
    {
      id: "materials",
      label: t("inspiration.tab.materials"),
      icon: SwatchBook,
      search: { tab: "materials" },
    },
  ];

  return (
    <div className="flex gap-1 rounded-xl bg-muted/60 p-1 ring-1 ring-black/5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <Link
            key={tab.id}
            to="/inspiration"
            search={tab.search}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition",
              activeTab === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
