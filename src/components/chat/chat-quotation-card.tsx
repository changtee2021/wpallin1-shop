import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/i18n";
import { respondQuotation } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { ChatQuotationPayload } from "@/lib/chat.types";
import { formatDate, formatPrice } from "@/lib/format";
import { quotationStatusLabels } from "@/components/quotations/quotation-document";
import { cn } from "@/lib/utils";

type Props = {
  quotation: ChatQuotationPayload;
  onResponded?: () => void;
};

export function ChatQuotationCard({ quotation, onResponded }: Props) {
  const { t } = useT();
  const { session, user } = useAuth();
  const [busy, setBusy] = useState(false);

  const viewLink = quotation.publicToken ? (
    <Link to="/quote/$token" params={{ token: quotation.publicToken }}>
      {t("chat.quotationView")}
    </Link>
  ) : (
    <Link to="/account/quotations">{t("chat.quotationView")}</Link>
  );

  const canRespond =
    user && quotation.status === "sent" && !quotation.publicToken;

  async function handleRespond(accept: boolean) {
    if (!session) return;
    setBusy(true);
    try {
      await respondQuotation({
        data: { quotationId: quotation.quotationId, accept },
        ...authServerFnOptions(session),
      });
      toast.success(
        accept ? t("chat.quotationAccepted") : t("chat.quotationRejected"),
      );
      onResponded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.sendFailed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2 w-full min-w-[200px] rounded-xl border bg-background p-3 text-foreground shadow-sm">
      <div className="flex items-start gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <span className="text-lg">📄</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {t("chat.quotationLabel")}
          </p>
          <p className="truncate font-semibold">{quotation.quotationNumber}</p>
          <p className="text-base font-bold text-primary">
            {formatPrice(quotation.grandTotal)}
          </p>
          {quotation.validUntil ? (
            <p className="text-[10px] text-muted-foreground">
              {t("chat.quotationValidUntil")} {formatDate(quotation.validUntil)}
            </p>
          ) : null}
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {quotationStatusLabels[quotation.status] ?? quotation.status}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant="outline"
          className="h-8 flex-1 text-xs"
          asChild
        >
          {viewLink}
        </Button>
        {canRespond ? (
          <>
            <Button
              size="sm"
              className="h-8 flex-1 text-xs"
              disabled={busy}
              onClick={() => void handleRespond(true)}
            >
              {t("chat.quotationAccept")}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={cn("h-8 text-xs text-muted-foreground")}
              disabled={busy}
              onClick={() => void handleRespond(false)}
            >
              {t("chat.quotationDecline")}
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
