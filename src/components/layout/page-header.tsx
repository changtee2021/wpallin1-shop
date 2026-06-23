import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {(badge || actions) && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
      )}
    </div>
  );
}
