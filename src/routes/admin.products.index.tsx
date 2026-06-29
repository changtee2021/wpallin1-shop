import { createFileRoute, Link } from "@tanstack/react-router";
import { ImageIcon, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminListToolbar } from "@/components/admin/shared/admin-list-toolbar";
import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminProducts } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { AdminProductRow } from "@/services/admin-catalog.service";

export const Route = createFileRoute("/admin/products/")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void fetchAdminProducts(authServerFnOptions(session))
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [session]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.categoryName?.toLowerCase().includes(q) ?? false),
    );
  }, [products, query]);

  return (
    <div>
      <PageHeader
        title={t("admin.products")}
        description="จัดการสินค้าในร้าน"
        actions={
          <Button asChild className="bg-primary">
            <Link to="/admin/products/new">
              <Plus className="mr-2 size-4" />
              เพิ่มสินค้า
            </Link>
          </Button>
        }
      />

      <div className="mb-4">
        <AdminListToolbar
          query={query}
          onQueryChange={setQuery}
          placeholder="ค้นหาชื่อ, SKU, slug…"
        />
      </div>

      {loading ? (
        <PageLoading variant="table" />
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">รูป</TableHead>
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {products.length === 0 ? "ยังไม่มีสินค้า" : "ไม่พบสินค้า"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt=""
                          className="size-10 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="flex size-10 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
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
      )}
    </div>
  );
}
