import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type Props = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder?: string;
  children?: ReactNode;
  action?: ReactNode;
};

export function AdminListToolbar({
  query,
  onQueryChange,
  placeholder = "ค้นหา…",
  children,
  action,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            placeholder={placeholder}
            className="pl-9"
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        {children ? (
          <div className="flex flex-wrap items-center gap-2">{children}</div>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      ) : null}
    </div>
  );
}
