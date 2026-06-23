import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { useCompare } from "@/hooks/use-compare";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_store/compare")({
  component: ComparePage,
});

type CompareRow = {
  label: string;
  values: (string | number | null)[];
  highlight?: boolean;
};

function ComparePage() {
  const { items } = useCompare();
  const { addItem } = useCart();

  if (items.length < 2) {
    return (
      <div className="container py-8">
        <PageHeader
          title="เปรียบเทียบสินค้า"
          description="เลือกอย่างน้อย 2 รายการจากหน้าร้าน"
        />
        <Button asChild>
          <Link to="/shop">ไปเลือกสินค้า</Link>
        </Button>
      </div>
    );
  }

  const rows: CompareRow[] = [
    {
      label: "ราคา",
      values: items.map((p) => formatPrice(p.retailPrice)),
      highlight: true,
    },
    {
      label: "หมวดหมู่",
      values: items.map((p) => p.categoryName ?? "—"),
    },
    {
      label: "SKU",
      values: items.map((p) => p.sku),
    },
    {
      label: "สต็อก",
      values: items.map((p) => (p.stock > 0 ? `${p.stock} ชิ้น` : "หมด")),
    },
    {
      label: "ขั้นต่ำสั่ง (MOQ)",
      values: items.map((p) => `${p.moq} ชิ้น`),
    },
    {
      label: "ระยะผลิต",
      values: items.map((p) =>
        p.leadTimeDays ? `${p.leadTimeDays} วัน` : "—",
      ),
    },
  ];

  return (
    <div className="container py-8">
      <PageHeader
        title="เปรียบเทียบสินค้า"
        description={`${items.length} รายการ`}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b p-3 text-left font-medium">รายการ</th>
              {items.map((p) => (
                <th key={p.id} className="border-b p-3 text-left align-top">
                  <div className="space-y-2">
                    <div className="aspect-square w-24 overflow-hidden rounded border bg-muted">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <Link
                      to="/products/$slug"
                      params={{ slug: p.slug }}
                      className="line-clamp--2 font-semibold hover:text-primary"
                    >
                      {p.name}
                    </Link>
                    <div className="flex flex-col gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void addItem(p.id, p.moq)}
                      >
                        <ShoppingCart className="mr-1 size-3" />
                        ใส่ตะกร้า
                      </Button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const unique = new Set(row.values.map(String));
              const differs = unique.size > 1;
              return (
                <tr key={row.label}>
                  <td className="border-b p-3 font-medium text-muted-foreground">
                    {row.label}
                  </td>
                  {row.values.map((val, i) => (
                    <td
                      key={`${row.label}-${i}`}
                      className={cn(
                        "border-b p-3",
                        differs &&
                          row.highlight &&
                          "bg-amber-50 font-semibold text-amber-900",
                        differs && !row.highlight && "bg-muted/40",
                      )}
                    >
                      {val ?? "—"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
