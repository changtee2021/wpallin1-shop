import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  CartItemOptionChip,
  CartItemOptionsSheet,
} from "@/components/cart/cart-item-options-sheet";
import { PageLoading } from "@/components/loading";
import { RecentlyViewedSection } from "@/components/storefront/recently-viewed-section";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import {
  calcSelectedQty,
  calcSelectedSubtotal,
  filterCartItems,
  loadStoredSelection,
  saveStoredSelection,
  serializeItemIds,
} from "@/lib/cart-selection";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";
import type { CartItemDto } from "@/types/api/cart";

export const Route = createFileRoute("/_store/cart/")({
  component: CartPage,
});

function CartPage() {
  const { t } = useT();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cart, loading, updateQty, removeItem, updateItemOptions } = useCart();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<CartItemDto | null>(null);

  useEffect(() => {
    if (!cart.items.length) {
      setSelectedIds([]);
      saveStoredSelection([]);
      return;
    }
    const stored = loadStoredSelection();
    const validStored = stored.filter((id) =>
      cart.items.some((item) => item.id === id),
    );
    setSelectedIds(
      validStored.length ? validStored : cart.items.map((item) => item.id),
    );
  }, [cart.items]);

  const selectedItems = useMemo(
    () => filterCartItems(cart.items, selectedIds),
    [cart.items, selectedIds],
  );
  const selectedSubtotal = calcSelectedSubtotal(selectedItems);
  const selectedQty = calcSelectedQty(selectedItems);
  const allSelected =
    cart.items.length > 0 && selectedIds.length === cart.items.length;
  const someSelected =
    selectedIds.length > 0 && selectedIds.length < cart.items.length;
  const cartProductIds = useMemo(
    () => cart.items.map((item) => item.productId).filter(Boolean) as string[],
    [cart.items],
  );

  function updateSelection(next: string[]) {
    setSelectedIds(next);
    saveStoredSelection(next);
  }

  function toggleItem(itemId: string, checked: boolean) {
    updateSelection(
      checked
        ? [...new Set([...selectedIds, itemId])]
        : selectedIds.filter((id) => id !== itemId),
    );
  }

  function toggleAll(checked: boolean) {
    updateSelection(checked ? cart.items.map((item) => item.id) : []);
  }

  function handleOrder() {
    if (!selectedIds.length) {
      toast.error("กรุณาเลือกสินค้าที่ต้องการสั่ง");
      return;
    }
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสั่งซื้อ");
      void navigate({ to: "/login" });
      return;
    }
    void navigate({
      to: "/cart/summary",
      search: { items: serializeItemIds(selectedIds) },
    });
  }

  if (loading) {
    return <PageLoading variant="cart" />;
  }

  if (!cart.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">{t("nav.cart")}</h1>
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <ShoppingCart className="size-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">ตะกร้ายังว่างอยู่</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                เลือกสินค้าเข้าตะกร้า แล้วกลับมาเลือกรายการที่ต้องการสั่ง
              </p>
            </div>
            <Button asChild className="bg-primary" size="lg">
              <Link to="/shop">
                {t("nav.shop")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{t("nav.cart")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          เลือกสินค้าที่ต้องการสั่ง แล้วกดสั่งสินค้าเพื่อไปหน้าสรุปยอด
        </p>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
        <Checkbox
          id="select-all"
          checked={allSelected ? true : someSelected ? "indeterminate" : false}
          onCheckedChange={(checked) => toggleAll(checked === true)}
          aria-label="เลือกทั้งหมด"
        />
        <label
          htmlFor="select-all"
          className="cursor-pointer text-sm font-medium"
        >
          เลือกทั้งหมด ({cart.items.length})
        </label>
      </div>

      <div className="space-y-3">
        {cart.items.map((item) => {
          const checked = selectedIds.includes(item.id);
          return (
            <Card
              key={item.id}
              className={`border-muted/80 shadow-sm transition-opacity ${checked ? "" : "opacity-80"}`}
            >
              <CardContent className="flex gap-3 p-4">
                <div className="flex shrink-0 items-start pt-1">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      toggleItem(item.id, value === true)
                    }
                    aria-label={`เลือก ${item.productName}`}
                  />
                </div>
                <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-24">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <PackageCheck className="size-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.slug ? (
                        <Link
                          to="/products/$slug"
                          params={{ slug: item.slug }}
                          className="line-clamp-2 font-semibold hover:text-primary"
                        >
                          {item.productName}
                        </Link>
                      ) : (
                        <p className="line-clamp-2 font-semibold">
                          {item.productName}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.sku ? `SKU: ${item.sku}` : "ไม่มี SKU"}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-bold">
                      {formatPrice(item.lineTotal)}
                    </p>
                  </div>
                  {item.optionSummary || item.optionsEditable ? (
                    <CartItemOptionChip
                      item={item}
                      onEdit={() => setEditingItem(item)}
                    />
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-accent">
                      {formatPrice(item.unitPrice)}
                    </p>
                    <div className="flex items-center overflow-hidden rounded-full border bg-background">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none"
                        aria-label="ลดจำนวน"
                        onClick={() =>
                          void updateQty(item.id, Math.max(0, item.qty - 1))
                        }
                      >
                        <Minus className="size-4" />
                      </Button>
                      <span className="w-10 text-center text-sm font-medium">
                        {item.qty}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 rounded-none"
                        aria-label="เพิ่มจำนวน"
                        onClick={() => void updateQty(item.id, item.qty + 1)}
                      >
                        <Plus className="size-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => void removeItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                      ลบ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <RecentlyViewedSection
        title="สินค้าที่คุณเคยดู"
        excludeProductIds={cartProductIds}
        showCompare={false}
        className="mt-10 border-t pt-8"
      />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-lg backdrop-blur md:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={
                allSelected ? true : someSelected ? "indeterminate" : false
              }
              onCheckedChange={(checked) => toggleAll(checked === true)}
              aria-label="เลือกทั้งหมด"
            />
            <span className="hidden text-sm sm:inline">ทั้งหมด</span>
          </div>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-xs text-muted-foreground">
              รวม {selectedQty} ชิ้น
            </p>
            <p className="text-lg font-bold text-accent">
              {formatPrice(selectedSubtotal)}
            </p>
          </div>
          <Button
            className="shrink-0 bg-accent px-6 hover:bg-accent/90"
            size="lg"
            disabled={!selectedIds.length}
            onClick={handleOrder}
          >
            สั่งสินค้า
          </Button>
        </div>
      </div>

      <CartItemOptionsSheet
        item={editingItem}
        open={Boolean(editingItem)}
        onOpenChange={(open) => {
          if (!open) setEditingItem(null);
        }}
        onSave={updateItemOptions}
      />
    </div>
  );
}
