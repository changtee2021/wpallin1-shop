import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/i18n";
import type { ChatProductCardPayload } from "@/lib/chat.types";
import { formatPrice } from "@/lib/format";

type Props = {
  products: ChatProductCardPayload[];
};

export function ChatProductCardRow({ products }: Props) {
  return (
    <div className="mt-2 space-y-2">
      {products.map((p) => (
        <ChatProductCardItem key={p.id} product={p} />
      ))}
    </div>
  );
}

function ChatProductCardItem({ product }: { product: ChatProductCardPayload }) {
  const { t } = useT();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  async function handleAddToCart() {
    setAdding(true);
    try {
      await addItem(product.id, 1);
      toast.success(t("chat.addedToCart"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.sendFailed"));
    } finally {
      setAdding(false);
    }
  }

  async function handleBuyNow() {
    setAdding(true);
    try {
      await addItem(product.id, 1);
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.sendFailed"));
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-background text-foreground shadow-sm">
      <Link
        to="/products/$slug"
        params={{ slug: product.slug }}
        className="flex items-center gap-2.5 p-2 transition-colors hover:bg-muted/40"
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            className="size-14 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="size-14 shrink-0 rounded-lg bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-xs font-medium leading-snug">
            {product.name}
          </p>
          <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice &&
            product.compareAtPrice > product.price ? (
              <span className="text-[10px] text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
      <div className="flex gap-1.5 border-t bg-muted/20 p-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 flex-1 gap-1 text-[11px]"
          disabled={adding}
          onClick={() => void handleAddToCart()}
        >
          <ShoppingCart className="size-3.5" />
          {t("chat.addToCart")}
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 gap-1 text-[11px]"
          disabled={adding}
          onClick={() => void handleBuyNow()}
        >
          <ShoppingBag className="size-3.5" />
          {t("chat.buyNow")}
        </Button>
      </div>
    </div>
  );
}
