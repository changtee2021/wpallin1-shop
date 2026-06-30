import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
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
  const { addItem } = useCart();
  const [products, setProducts] = useState<DealerProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);

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

  async function handleAdd(product: DealerProductDto) {
    setAddingId(product.id);
    try {
      await addItem(product.id, product.moq);
      toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "เพิ่มไม่สำเร็จ");
    } finally {
      setAddingId(null);
    }
  }

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
        description="ราคาส่งตาม tier ของคุณ — กดเพิ่มเพื่อสั่งได้ทันที"
        badge="Wholesale"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {products.map((p) => (
          <Card key={p.id}>
            <CardContent className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="font-medium">{p.name}</p>
                {p.sku ? (
                  <p className="font-mono text-xs text-muted-foreground">
                    {p.sku}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  MOQ {p.moq} · สต็อก {p.stock}
                </p>
                <p className="text-xs text-muted-foreground line-through">
                  ปลีก {formatPrice(p.retailPrice)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <Badge>Dealer</Badge>
                <p className="font-semibold text-accent">
                  {formatPrice(p.tierPrice ?? p.dealerPrice)}
                </p>
                <Button
                  size="sm"
                  disabled={addingId === p.id || p.stock < p.moq}
                  onClick={() => void handleAdd(p)}
                >
                  <Plus className="mr-1 size-4" />
                  {addingId === p.id ? "..." : "เพิ่ม"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
