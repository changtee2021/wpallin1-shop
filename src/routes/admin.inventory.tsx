import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchLowStockProducts,
  updateProductStockFn,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { LowStockProductDto } from "@/services/inventory.service";

export const Route = createFileRoute("/admin/inventory")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<LowStockProductDto[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});

  async function reload() {
    setItems(
      await fetchLowStockProducts({
        data: { threshold: 10 },
        ...authServerFnOptions(session),
      }),
    );
  }

  useEffect(() => {
    void reload();
  }, [session]);

  async function saveStock(productId: string) {
    const qty = Number(editing[productId]);
    if (Number.isNaN(qty)) return;
    try {
      await updateProductStockFn({
        data: { productId, stockQty: qty },
        ...authServerFnOptions(session),
      });
      toast.success("อัปเดตสต็อกแล้ว");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  return (
    <div>
      <PageHeader title="สต็อกสินค้า" description="สินค้าที่สต็อกต่ำ (≤10)" />
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            ไม่มีสินค้าสต็อกต่ำ
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    SKU: {item.sku ?? "-"} · คงเหลือ {item.stockQty}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-24"
                    defaultValue={item.stockQty}
                    onChange={(e) =>
                      setEditing({ ...editing, [item.id]: e.target.value })
                    }
                  />
                  <Button size="sm" onClick={() => void saveStock(item.id)}>
                    บันทึก
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
