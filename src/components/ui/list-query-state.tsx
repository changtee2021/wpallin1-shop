import { AlertCircle, Inbox, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function StateFrame({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      {children}
    </div>
  );
}

export function ListEmptyState({
  message,
  action,
  className,
}: {
  message: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <StateFrame icon={<Inbox className="size-5" aria-hidden />} className={className}>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action}
    </StateFrame>
  );
}

export function ListNoResultsState({
  message = "ไม่พบรายการที่ตรงกับตัวกรอง",
  onClear,
  clearLabel = "ล้างตัวกรอง",
  className,
}: {
  message?: string;
  onClear?: () => void;
  clearLabel?: string;
  className?: string;
}) {
  return (
    <StateFrame icon={<SearchX className="size-5" aria-hidden />} className={className}>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onClear ? (
        <Button type="button" variant="outline" onClick={onClear}>
          {clearLabel}
        </Button>
      ) : null}
    </StateFrame>
  );
}

export function ListErrorState({
  message = "โหลดไม่สำเร็จ",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <StateFrame
      icon={<AlertCircle className="size-5 text-destructive" aria-hidden />}
      className={className}
    >
      <p className="text-sm text-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry}>
          ลองใหม่
        </Button>
      ) : null}
    </StateFrame>
  );
}
