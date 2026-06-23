import { Badge } from "@/components/ui/badge";

export function PageHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        )}
      </div>
      {badge && <Badge variant="outline">{badge}</Badge>}
    </div>
  );
}
