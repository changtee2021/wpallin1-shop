import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchWalletSummary,
  fetchWalletTransactions,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { WalletTransactionDto } from "@/services/wallet.service";

export const Route = createFileRoute("/dealer/wallet")({
  component: DealerWalletPage,
});

function DealerWalletPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [balance, setBalance] = useState(0);
  const [txs, setTxs] = useState<WalletTransactionDto[]>([]);

  useEffect(() => {
    void fetchWalletSummary(authServerFnOptions(session)).then((w) =>
      setBalance(w.availableBalance),
    );
    void fetchWalletTransactions(authServerFnOptions(session)).then(setTxs);
  }, [session]);

  return (
    <div>
      <PageHeader
        title={t("dealer.wallet")}
        description="ยอดคงเหลือและประวัติธุรกรรม"
      />
      <Card className="mb-6">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">ยอดใช้ได้</p>
          <p className="text-3xl font-bold text-accent">
            {formatPrice(balance)}
          </p>
        </CardContent>
      </Card>
      <div className="space-y-2">
        {txs.length === 0 ? (
          <p className="text-muted-foreground">ยังไม่มีธุรกรรม</p>
        ) : (
          txs.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="flex items-center justify-between p-3 text-sm">
                <div>
                  <p>{tx.description ?? tx.type}</p>
                  <p className="text-muted-foreground">
                    {formatDate(tx.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{tx.status}</Badge>
                  <p
                    className={
                      tx.direction === "debit"
                        ? "text-destructive"
                        : "text-green-600"
                    }
                  >
                    {tx.direction === "debit" ? "-" : "+"}
                    {formatPrice(tx.amount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
