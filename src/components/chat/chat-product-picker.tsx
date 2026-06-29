import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";
import { searchChatProducts } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { ChatProductCardPayload } from "@/lib/chat.types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (productIds: string[], body?: string) => void;
};

export function ChatProductPicker({ open, onOpenChange, onSend }: Props) {
  const { t } = useT();
  const { session } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ChatProductCardPayload[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setSelected(new Set());
      setNote("");
      return;
    }

    const timer = window.setTimeout(() => {
      setLoading(true);
      void searchChatProducts({
        data: { q: query },
        ...authServerFnOptions(session),
      })
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [open, query, session]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 8) next.add(id);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("chat.sendProduct")}</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("chat.searchProduct")}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("chat.loading")}
            </p>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("chat.noProducts")}
            </p>
          ) : (
            results.map((p) => {
              const checked = selected.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border p-2 text-left transition-colors",
                    checked
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50",
                  )}
                >
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt=""
                      className="size-11 rounded object-cover"
                    />
                  ) : (
                    <div className="size-11 rounded bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium">{p.name}</p>
                    <p className="text-xs font-semibold text-primary">
                      {formatPrice(p.price)}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("chat.productNote")}
          className="text-sm"
        />

        <DialogFooter>
          <Button
            disabled={!selected.size}
            onClick={() => {
              onSend([...selected], note.trim() || undefined);
              onOpenChange(false);
            }}
          >
            {t("chat.send")} ({selected.size})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
