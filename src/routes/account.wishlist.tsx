import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { ProductFeed } from "@/components/storefront/product-feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchWishlist } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { ProductPublicDto } from "@/types/api/products";

export const Route = createFileRoute("/account/wishlist")({
  component: AccountWishlistPage,
});

function AccountWishlistPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<ProductPublicDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchWishlist(authServerFnOptions(session))
      .then(setProducts)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
      )
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div>
      <PageHeader title="รายการโปรด" description="สินค้าที่บันทึกไว้" />
      {loading ? (
        <p className="text-muted-foreground">กำลังโหลด...</p>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="text-muted-foreground">ยังไม่มีรายการโปรด</p>
            <Button asChild>
              <Link to="/shop">ไปช้อปปิ้ง</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProductFeed products={products} title="รายการโปรด" />
      )}
    </div>
  );
}
