import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchDealerCatalog } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { DealerProductDto } from "@/services/dealer-catalog.service";

export const Route = createFileRoute("/dealer/catalog")({
  component: DealerCatalogPage,
});

function DealerCatalogPage() {
  const { t } = useT();
  const { session, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<DealerProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    void fetchDealerCatalog(authServerFnOptions(session))
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, session?.access_token]);

  if (authLoading || loading) {
    return <PageLoading variant="grid" />;
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={t("dealer.catalog")}
        description="ราคาส่งตาม tier ของคุณ"
        badge="Wholesale"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  MOQ {p.moq} · สต็อก {p.stock}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  ปลีก {formatPrice(p.retailPrice)}
                </p>
              </div>
              <div className="text-right">
                <Badge>Dealer</Badge>
                <p className="mt-1 font-semibold text-accent">
                  {formatPrice(p.tierPrice ?? p.dealerPrice)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
