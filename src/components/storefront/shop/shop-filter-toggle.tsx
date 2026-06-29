import { PanelLeftClose, PanelLeftOpen, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShopFilterToggleProps = {
  open: boolean;
  activeCount: number;
  onToggle: () => void;
  variant?: "sidebar" | "bar" | "collapsed-tab";
  className?: string;
};

export function ShopFilterToggle({
  open,
  activeCount,
  onToggle,
  variant = "bar",
  className,
}: ShopFilterToggleProps) {
  if (variant === "collapsed-tab") {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="เปิดตัวกรอง"
        className={cn(
          "sticky top-24 z-10 flex flex-col items-center gap-1 rounded-r-lg border border-l-0 border-primary/30 bg-primary px-2 py-4 text-white shadow-md transition-colors hover:bg-primary/90",
          className,
        )}
      >
        <SlidersHorizontal className="size-5" />
        <span
          className="text-[10px] font-semibold tracking-wide"
          style={{ writingMode: "vertical-rl" }}
        >
          ตัวกรอง
        </span>
        {activeCount > 0 ? (
          <Badge className="mt-1 size-5 justify-center rounded-full bg-accent p-0 text-[10px] text-white">
            {activeCount > 9 ? "9+" : activeCount}
          </Badge>
        ) : null}
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant={variant === "bar" ? "default" : "outline"}
      size={variant === "bar" ? "default" : "sm"}
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        variant === "bar" && "bg-primary hover:bg-primary/90 lg:hidden",
        className,
      )}
    >
      {open ? (
        <PanelLeftClose className="size-4" />
      ) : (
        <SlidersHorizontal className="size-4" />
      )}
      <span>ตัวกรอง</span>
      {activeCount > 0 ? (
        <Badge className="ml-1 rounded-full bg-accent px-1.5 text-[10px] text-white">
          {activeCount}
        </Badge>
      ) : null}
    </Button>
  );
}

export function ShopFilterSidebarToggle({
  open,
  onToggle,
  className,
}: {
  open: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        "mb-3 w-full justify-start gap-2 font-semibold text-primary",
        className,
      )}
    >
      {open ? (
        <PanelLeftClose className="size-4" />
      ) : (
        <PanelLeftOpen className="size-4" />
      )}
      {open ? "ซ่อนตัวกรอง" : "แสดงตัวกรอง"}
    </Button>
  );
}
