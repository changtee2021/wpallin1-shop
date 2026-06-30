import { Link } from "@tanstack/react-router";
import { History, Loader2, LogIn, RotateCcw, Star, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate, formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { OrderSummaryDto } from "@/types/api/orders";

type FrequentSku = {
  sku: string;
  productName: string;
  lastQty: number;
  orderCount: number;
};

type OrderShortcutsPanelProps = {
  loggedIn: boolean;
  orders: OrderSummaryDto[];
  ordersLoading: boolean;
  frequentSkus: FrequentSku[];
  frequentLoading: boolean;
  loadingOrderId: string | null;
  resolving: boolean;
  onLoadToPad: (orderId: string) => void;
  onReorder: (orderId: string) => void;
  onFrequentClick: (sku: string, qty: number) => void;
};

function LoginPrompt({ message }: { message: string }) {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center">
      <LogIn className="size-8 text-muted-foreground/70" />
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" asChild>
        <Link to="/login">{t("nav.login")}</Link>
      </Button>
    </div>
  );
}

export function OrderShortcutsPanel({
  loggedIn,
  orders,
  ordersLoading,
  frequentSkus,
  frequentLoading,
  loadingOrderId,
  resolving,
  onLoadToPad,
  onReorder,
  onFrequentClick,
}: OrderShortcutsPanelProps) {
  const { t } = useT();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("order.shortcutsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="history" className="gap-1.5">
              <History className="size-3.5" />
              {t("order.tabHistory")}
            </TabsTrigger>
            <TabsTrigger value="frequent" className="gap-1.5">
              <Star className="size-3.5" />
              {t("order.tabFrequent")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="mt-0">
            {!loggedIn ? (
              <LoginPrompt message={t("order.loginForHistory")} />
            ) : ordersLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("order.historyLoading")}
              </div>
            ) : orders.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
                <History className="mx-auto mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {t("order.historyEmpty")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <Link
                    to="/account/orders"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    {t("order.historyViewAll")}
                  </Link>
                </div>
                <div className="divide-y rounded-lg border">
                  {orders.map((order) => {
                    const busy = loadingOrderId === order.id;
                    return (
                      <div
                        key={order.id}
                        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)} ·{" "}
                            {formatPrice(order.grandTotal)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={busy}
                            onClick={() => onLoadToPad(order.id)}
                          >
                            {busy ? (
                              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                            ) : (
                              <Upload className="mr-1.5 size-3.5" />
                            )}
                            {t("order.loadToPad")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => onReorder(order.id)}
                          >
                            <RotateCcw className="mr-1.5 size-3.5" />
                            {t("order.reorderNow")}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="frequent" className="mt-0">
            {!loggedIn ? (
              <LoginPrompt message={t("order.loginForFrequent")} />
            ) : frequentLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                {t("order.frequentLoading")}
              </div>
            ) : frequentSkus.length === 0 ? (
              <div className="rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
                <Star className="mx-auto mb-2 size-7 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {t("order.frequentEmpty")}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {frequentSkus.map((item) => (
                  <Button
                    key={item.sku}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-auto max-w-full flex-col items-start gap-0.5 px-3 py-2 text-left"
                    disabled={resolving}
                    onClick={() => onFrequentClick(item.sku, item.lastQty)}
                  >
                    <span className="font-mono text-xs">{item.sku}</span>
                    <span className="line-clamp-1 text-[11px] font-normal text-muted-foreground">
                      ×{item.lastQty} · {item.orderCount} ครั้ง
                    </span>
                  </Button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
