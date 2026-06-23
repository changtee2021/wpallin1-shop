import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  search?: Record<string, unknown>;
  key?: string;
};

export function SidebarNav({
  items,
  title,
  className,
}: {
  items: SidebarNavItem[];
  title: string;
  className?: string;
}) {
  return (
    <aside className={cn("w-full shrink-0 md:w-56", className)}>
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.key ?? `${item.to}-${item.label}`}
            to={item.to}
            search={item.search}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            activeProps={{ className: "bg-muted text-foreground" }}
            activeOptions={{ exact: false, includeSearch: true }}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
