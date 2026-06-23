import { Link } from "@tanstack/react-router";
import { GitCompareArrows, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCompare } from "@/hooks/use-compare";

export function CompareBar() {
  const { items, count, clear, remove } = useCompare();

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur md:bottom-0">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <GitCompareArrows className="size-4 text-primary" />
          <span className="text-sm font-medium">
            เลือกแล้ว {count}/4 รายการ
          </span>
          <div className="flex gap-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative size-10 overflow-hidden rounded border bg-muted"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : null}
                <button
                  type="button"
                  className="absolute -top-1 -right-1 rounded-full bg-destructive p-0.5 text-white"
                  onClick={() => remove(item.id)}
                  aria-label="ลบ"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={clear}>
            ล้าง
          </Button>
          <Button size="sm" asChild disabled={count < 2}>
            <Link to="/compare">เปรียบเทียบ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
