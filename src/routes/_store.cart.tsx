import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShoppingCart,
  Tag,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { applyCartCoupon, requestQuotationFromCart } from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_store/cart")({
  component: CartPage,
});

function CartPage() {
  const { t } = useT();
  const { session, user } = useAuth();
  const { cart, loading, updateQty, removeItem, refresh } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);
  const [quoting, setQuoting] = useState(false);

  async function handleRequestQuote() {
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    setQuoting(true);
    try {
      await requestQuotationFromCart({
        data: { sessionId: getOrCreateCartSessionId() },
        ...authServerFnOptions(session),
      });
      toast.success("ส่งคำขอใบเสนอราคาแล้ว — ทีมขายจะติดต่อกลับ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setQuoting(false);
    }
  }

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      await applyCartCoupon({
        data: { code: couponCode, sessionId: getOrCreateCartSessionId() },
        ...authServerFnOptions(session),
      });
      await refresh();
      toast.success("ใช้คูปองแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "คูปองไม่ถูกต้อง");
    } finally {
      setApplying(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 text-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
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
                เลือกสินค้าเข้าตะกร้า
                แล้วกลับมาชำระเงินหรือขอใบเสนอราคาได้ที่นี่
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

  const payableTotal = Math.max(0, cart.subtotal - cart.discount);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28 sm:px-6 lg:pb-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.cart")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            ตรวจสินค้า ตัวเลือก และจำนวนก่อนชำระเงิน
          </p>
        </div>
        <BadgeLikeCount count={cart.itemCount} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-4">
          {cart.items.map((item) => (
            <Card key={item.id} className="border-muted/80 shadow-sm">
              <CardContent className="grid gap-4 p-4 sm:grid-cols-[88px_1fr_auto]">
                <div className="size-20 overflow-hidden rounded-xl bg-muted sm:size-[88px]">
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
                <div className="min-w-0">
                  {item.slug ? (
                    <Link
                      to="/products/$slug"
                      params={{ slug: item.slug }}
                      className="font-semibold hover:text-primary"
                    >
                      {item.productName}
                    </Link>
                  ) : (
                    <p className="font-semibold">{item.productName}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.sku ? `SKU: ${item.sku}` : "ไม่มี SKU"}
                  </p>
                  {item.optionSummary && (
                    <div className="mt-3 rounded-xl bg-primary/5 px-3 py-2 text-sm text-primary">
                      {item.optionSummary}
                    </div>
                  )}
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
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">รวมรายการนี้</p>
                  <p className="text-lg font-bold">
                    {formatPrice(item.lineTotal)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-4">
              <div>
                <h2 className="font-semibold">สรุปคำสั่งซื้อ</h2>
                <p className="text-sm text-muted-foreground">
                  รวม {cart.itemCount} รายการในตะกร้า
                </p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="รหัสคูปอง"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={applying}
                  onClick={() => void handleApplyCoupon()}
                >
                  {applying ? "กำลังใช้..." : "ใช้"}
                </Button>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ยอดสินค้า</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>ส่วนลด</span>
                    <span>-{formatPrice(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold">
                  <span>รวมสุทธิ</span>
                  <span className="text-accent">
                    {formatPrice(payableTotal)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full bg-accent hover:bg-accent/90"
                size="lg"
                asChild
              >
                <Link to={user ? "/checkout" : "/login"} search={undefined}>
                  {user ? "ชำระเงิน" : "เข้าสู่ระบบเพื่อชำระเงิน"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              {user ? (
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  disabled={quoting}
                  onClick={() => void handleRequestQuote()}
                >
                  {quoting ? "กำลังส่ง..." : "ขอใบเสนอราคา"}
                </Button>
              ) : null}
            </CardContent>
          </Card>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">รวมสุทธิ</p>
            <p className="text-lg font-bold text-accent">
              {formatPrice(payableTotal)}
            </p>
          </div>
          <Button className="bg-accent hover:bg-accent/90" asChild>
            <Link to={user ? "/checkout" : "/login"} search={undefined}>
              {user ? "ชำระเงิน" : "เข้าสู่ระบบ"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function BadgeLikeCount({ count }: { count: number }) {
  return (
    <div className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
      {count} รายการ
    </div>
  );
}
