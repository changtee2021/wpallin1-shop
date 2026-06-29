import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  to?: string;
  label: string;
  icon: LucideIcon;
  search?: Record<string, unknown>;
  key?: string;
  onClick?: () => void;
};

export type SidebarNavGroup = {
  label: string;
  items: SidebarNavItem[];
};

const navItemClass =
  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

function SidebarNavLink({ item }: { item: SidebarNavItem }) {
  if (item.onClick) {
    return (
      <button type="button" onClick={item.onClick} className={navItemClass}>
        <item.icon className="size-4 shrink-0" />
        {item.label}
      </button>
    );
  }

  if (!item.to) return null;

  return (
    <Link
      to={item.to}
      search={item.search}
      preload={false}
      className={navItemClass}
      activeProps={{ className: "bg-muted text-foreground" }}
      activeOptions={{ exact: item.to === "/admin", includeSearch: true }}
    >
      <item.icon className="size-4 shrink-0" />
      {item.label}
    </Link>
  );
}

export function SidebarNav({
  items,
  groups,
  title,
  className,
}: {
  items?: SidebarNavItem[];
  groups?: SidebarNavGroup[];
  title: string;
  className?: string;
}) {
  const navGroups = groups ?? (items ? [{ label: "", items }] : []);

  return (
    <aside className={cn("w-full shrink-0 md:w-56", className)}>
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <nav className="flex flex-col gap-4">
        {navGroups.map((group) => (
          <div key={group.label || "default"}>
            {group.label ? (
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </p>
            ) : null}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <SidebarNavLink
                  key={item.key ?? `${item.to}-${item.label}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
