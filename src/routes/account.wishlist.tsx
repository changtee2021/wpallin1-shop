import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { ProductFeed } from "@/components/storefront/product-feed";
import { Button } from "@/components/ui/button";
import { ListEmptyState, ListErrorState } from "@/components/ui/list-query-state";
import { useAuth } from "@/hooks/use-auth";
import { fetchWishlist } from "@/lib/api.functions";
import {
  authServerFnOptions,
  useAuthServerFnOptions,
} from "@/lib/server-fn-auth";
import type { ProductPublicDto } from "@/types/api/products";

export const Route = createFileRoute("/account/wishlist")({
  component: AccountWishlistPage,
});

function AccountWishlistPage() {
  const { session, loading: authLoading } = useAuth();
  const authOpts = useAuthServerFnOptions(session);
  const [products, setProducts] = useState<ProductPublicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (authLoading || !session?.access_token) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchWishlist(authOpts)
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "โหลดไม่สำเร็จ";
        if (!cancelled) setError(message);
        toast.error(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authLoading, authOpts, session?.access_token, reloadKey]);

  const showLoading = authLoading || loading || !session?.access_token;

  return (
    <div>
      <PageHeader title="รายการโปรด" description="สินค้าที่บันทึกไว้" />
      {showLoading ? (
        <PageLoading variant="grid" />
      ) : error ? (
        <ListErrorState
          message={error}
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : products.length === 0 ? (
        <ListEmptyState
          message="ยังไม่มีรายการโปรด"
          action={
            <Button asChild>
              <Link to="/shop">ไปช้อปปิ้ง</Link>
            </Button>
          }
        />
      ) : (
        <ProductFeed products={products} title="รายการโปรด" />
      )}
    </div>
  );
}
