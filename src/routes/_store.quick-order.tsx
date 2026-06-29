import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { fetchPriceList, quickOrderBySku } from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";

export const Route = createFileRoute("/_store/quick-order")({
  component: QuickOrderPage,
});

function QuickOrderPage() {
  const { session } = useAuth();
  const { refresh } = useCart();
  const [linesText, setLinesText] = useState("SKU001,2\nSKU002,1");
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const lines = linesText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const [sku, qtyRaw] = line.split(/[,\t ]+/);
        return { sku: sku.trim(), qty: Number(qtyRaw) || 1 };
      });

    if (!lines.length) {
      toast.error("กรุณาใส่ SKU");
      return;
    }

    setSubmitting(true);
    try {
      const result = await quickOrderBySku({
        data: { sessionId: getOrCreateCartSessionId(), lines },
        ...authServerFnOptions(session),
      });
      const failed = result.results.filter((r) => !r.ok);
      if (failed.length) {
        toast.error(failed.map((f) => `${f.sku}: ${f.message}`).join("\n"));
      } else {
        toast.success("เพิ่มลงตะกร้าแล้ว");
      }
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDownloadPriceList() {
    setDownloading(true);
    try {
      const data = await fetchPriceList(authServerFnOptions(session));
      const header = ["SKU", "Name", "Category", "MOQ", "Price", "Retail"].join(
        ",",
      );
      const rows = data.rows.map((r) =>
        [
          r.sku,
          `"${r.name.replace(/"/g, '""')}"`,
          r.category ?? "",
          r.moq,
          r.price,
          r.retailPrice,
        ].join(","),
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `price-list-${data.tierName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="container py-8">
      <PageHeader
        title="สั่งด่วน (Quick Order)"
        description="พิมพ์ SKU และจำนวน ทีละบรรทัด — รูปแบบ: SKU,จำนวน"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
              <div>
                <Label>รายการ SKU</Label>
                <Textarea
                  rows={8}
                  value={linesText}
                  onChange={(e) => setLinesText(e.target.value)}
                  placeholder={"WR-CUR-001,2\nWR-ROL-001,5"}
                />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "กำลังเพิ่ม..." : "เพิ่มลงตะกร้า"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="font-semibold">Price List</h2>
            <p className="text-sm text-muted-foreground">
              ดาวน์โหลดราคาตาม tier ของคุณเป็น CSV (เปิดใน Excel ได้)
            </p>
            <Button
              variant="outline"
              disabled={downloading}
              onClick={() => void handleDownloadPriceList()}
            >
              {downloading ? "กำลังสร้าง..." : "ดาวน์โหลด Price List"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
