import { Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

const EXAMPLE_KEYS = [
  "shop.smartSearch.example1",
  "shop.smartSearch.example2",
  "shop.smartSearch.example3",
] as const;

type SmartProductSearchProps = {
  defaultValue?: string;
  isPending?: boolean;
  onSearch: (query: string) => void;
  className?: string;
  compact?: boolean;
};

export function SmartProductSearch({
  defaultValue = "",
  isPending = false,
  onSearch,
  className,
  compact = false,
}: SmartProductSearchProps) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(defaultValue);
  const hasActiveQuery = Boolean(defaultValue.trim());

  useEffect(() => {
    if (!open) setQuery(defaultValue);
  }, [defaultValue, open]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    onSearch(q);
    setOpen(false);
  }

  return (
    <>
      <Button
        type="button"
        variant={hasActiveQuery ? "default" : "outline"}
        className={cn(
          "relative gap-2 border-primary/25 bg-white hover:bg-primary/5",
          compact && "px-3",
          hasActiveQuery && "border-primary bg-primary/10 text-primary",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="size-4 text-accent" />
        <span className={cn(compact ? "inline" : "hidden sm:inline")}>
          {compact ? "AI" : t("shop.smartSearch.openButton")}
        </span>
        {hasActiveQuery && compact ? (
          <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-background" />
        ) : null}
        {hasActiveQuery && !compact ? (
          <Badge
            variant="secondary"
            className="ml-0.5 max-w-[8rem] truncate bg-accent/15 text-[10px] text-accent"
          >
            {defaultValue}
          </Badge>
        ) : null}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:rounded-xl">
          <div className="border-b bg-gradient-to-br from-primary/5 to-accent/5 px-5 py-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="flex items-center gap-2 text-base">
                <Sparkles className="size-5 text-accent" />
                {t("shop.smartSearch.title")}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {t("shop.smartSearch.subtitle")}
              </DialogDescription>
            </DialogHeader>
          </div>

          <form onSubmit={submit} className="space-y-4 p-5">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("shop.smartSearch.placeholder")}
              rows={3}
              autoFocus
              disabled={isPending}
              className="min-h-[88px] w-full resize-none rounded-lg border border-primary/20 bg-white px-3 py-2.5 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:opacity-60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <Button
              type="submit"
              disabled={isPending || !query.trim()}
              className="w-full bg-accent hover:bg-accent/90"
            >
              {isPending
                ? t("shop.smartSearch.analyzing")
                : t("shop.smartSearch.search")}
            </Button>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  disabled={isPending}
                  className="rounded-full border border-primary/20 bg-white px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                  onClick={() => {
                    const text = t(key);
                    setQuery(text);
                  }}
                >
                  {t(key)}
                </button>
              ))}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
