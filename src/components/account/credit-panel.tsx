import { useEffect, useState } from "react";

import { DefaultPageSkeleton } from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchCreditSummary } from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { CreditSummaryDto } from "@/services/credit.service";

export function CreditPanel() {
  const { session } = useAuth();
  const [summary, setSummary] = useState<CreditSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCreditSummary(authServerFnOptions(session))
      .then(setSummary)
      .finally(() => setLoading(false));
  }, [session]);

  if (loading) return <DefaultPageSkeleton />;

  if (!summary?.account) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          คุณยังไม่มีวงเงินเครดิต กรุณาติดต่อแอดมินเพื่อขอเปิดวงเงิน
          (ต้องอัปโหลดเอกสาร KYC ให้ครบและได้รับการอนุมัติก่อน)
        </CardContent>
      </Card>
    );
  }

  const { account, invoices } = summary;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">วงเงิน</p>
            <p className="text-lg font-semibold">
              {formatPrice(account.creditLimit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">คงเหลือ</p>
            <p className="text-lg font-semibold text-primary">
              {formatPrice(account.availableCredit)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">เครดิตเทอม</p>
            <p className="text-lg font-semibold">
              {account.creditTermDays} วัน
            </p>
            <p className="text-xs text-muted-foreground">
              ขั้นต่ำ/บิล {formatPrice(account.minOrderAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 p-4">
          <h3 className="font-semibold">บิลเครดิต</h3>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีบิล</p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">
                    {inv.orderNumber ?? inv.orderId}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ครบกำหนด {formatDate(inv.dueDate)}
                  </p>
                </div>
                <div className="text-right">
                  <p>{formatPrice(inv.remaining)}</p>
                  <Badge
                    variant={inv.daysOverdue > 0 ? "destructive" : "outline"}
                  >
                    {inv.status}
                    {inv.daysOverdue > 0 ? ` (+${inv.daysOverdue}d)` : ""}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
