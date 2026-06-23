import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminProducts } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { AdminProductRow } from "@/services/admin-catalog.service";

export const Route = createFileRoute("/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminProducts(authServerFnOptions(session))
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <PageHeader
          title={t("admin.products")}
          description="จัดการสินค้าในร้าน"
        />
        <Button asChild className="bg-primary">
          <Link to="/admin/products/new">
            <Plus className="mr-2 size-4" />
            เพิ่มสินค้า
          </Link>
        </Button>
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>ชื่อ</TableHead>
              <TableHead>หมวด</TableHead>
              <TableHead>ราคาปลีก</TableHead>
              <TableHead>สต็อก</TableHead>
              <TableHead>สถานะ</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  ยังไม่มีสินค้า
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.sku ?? "—"}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.categoryName ?? "—"}</TableCell>
                  <TableCell>{formatPrice(p.retailPrice)}</TableCell>
                  <TableCell>{p.stockQty}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"}>
                      {p.isActive ? "เปิด" : "ปิด"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/admin/products/$id" params={{ id: p.id }}>
                        แก้ไข
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
