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
import { fetchChatUserQuotations } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { quotationStatusLabels } from "@/components/quotations/quotation-document";
import type { QuotationDto } from "@/types/api/quotations";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSend: (quotationId: string, body?: string) => void;
};

export function ChatQuotationPicker({
  open,
  onOpenChange,
  userId,
  onSend,
}: Props) {
  const { t } = useT();
  const { session } = useAuth();
  const [quotes, setQuotes] = useState<QuotationDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      setNote("");
      return;
    }
    setLoading(true);
    void fetchChatUserQuotations({
      data: { userId },
      ...authServerFnOptions(session),
    })
      .then(setQuotes)
      .catch(() => setQuotes([]))
      .finally(() => setLoading(false));
  }, [open, userId, session]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("chat.sendQuotation")}</DialogTitle>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto py-1">
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("chat.loading")}
            </p>
          ) : quotes.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t("chat.noQuotations")}
            </p>
          ) : (
            quotes.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={() => setSelectedId(q.id)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  selectedId === q.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50",
                )}
              >
                <p className="font-semibold">{q.quotationNumber}</p>
                <p className="text-sm font-bold text-primary">
                  {formatPrice(q.grandTotal)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {quotationStatusLabels[q.status] ?? q.status}
                  {q.validUntil ? ` · ${formatDate(q.validUntil)}` : ""}
                </p>
              </button>
            ))
          )}
        </div>

        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("chat.quotationNote")}
          className="text-sm"
        />

        <DialogFooter>
          <Button
            disabled={!selectedId}
            onClick={() => {
              if (selectedId) {
                onSend(selectedId, note.trim() || undefined);
                onOpenChange(false);
              }
            }}
          >
            {t("chat.sendQuotation")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
