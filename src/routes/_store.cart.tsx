import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
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
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <p className="text-muted-foreground">ตะกร้าว่าง</p>
            <Button asChild className="bg-primary">
              <Link to="/shop">{t("nav.shop")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold">{t("nav.cart")}</h1>
      <div className="space-y-4">
        {cart.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex gap-4 p-4">
              <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                {item.slug ? (
                  <Link
                    to="/products/$slug"
                    params={{ slug: item.slug }}
                    className="font-medium hover:text-primary"
                  >
                    {item.productName}
                  </Link>
                ) : (
                  <p className="font-medium">{item.productName}</p>
                )}
                <p className="text-sm text-muted-foreground">{item.sku}</p>
                {item.optionSummary && (
                  <p className="text-sm text-muted-foreground">
                    {item.optionSummary}
                  </p>
                )}
                <p className="mt-1 font-semibold text-accent">
                  {formatPrice(item.unitPrice)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      void updateQty(item.id, Math.max(0, item.qty - 1))
                    }
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => void updateQty(item.id, item.qty + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => void removeItem(item.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Separator className="my-6" />
      <div className="mb-4 flex gap-2">
        <Input
          placeholder="รหัสคูปอง"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          disabled={applying}
          onClick={() => void handleApplyCoupon()}
        >
          ใช้คูปอง
        </Button>
      </div>
      {cart.discount > 0 && (
        <div className="mb-2 flex justify-between text-sm text-green-600">
          <span>ส่วนลด</span>
          <span>-{formatPrice(cart.discount)}</span>
        </div>
      )}
      <div className="flex items-center justify-between text-lg font-bold">
        <span>รวม</span>
        <span className="text-accent">
          {formatPrice(Math.max(0, cart.subtotal - cart.discount))}
        </span>
      </div>
      <Button
        className="mt-6 w-full bg-accent hover:bg-accent/90"
        size="lg"
        asChild
      >
        <Link to={user ? "/checkout" : "/login"} search={undefined}>
          {user ? "ชำระเงิน" : "เข้าสู่ระบบเพื่อชำระเงิน"}
        </Link>
      </Button>
      {user ? (
        <Button
          className="mt-2 w-full"
          size="lg"
          variant="outline"
          disabled={quoting}
          onClick={() => void handleRequestQuote()}
        >
          {quoting ? "กำลังส่ง..." : "ขอใบเสนอราคา"}
        </Button>
      ) : null}
    </div>
  );
}
