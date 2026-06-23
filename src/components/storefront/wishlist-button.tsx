import { Heart } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toggleWishlistFn, fetchWishlistIds } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
  variant = "outline",
  iconClassName,
}: {
  productId: string;
  className?: string;
  variant?: "outline" | "ghost";
  iconClassName?: string;
}) {
  const { session } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) {
      setWishlisted(false);
      return;
    }
    void fetchWishlistIds(authServerFnOptions(session))
      .then((ids) => setWishlisted(ids.includes(productId)))
      .catch(() => undefined);
  }, [productId, session]);

  async function handleToggle(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    setLoading(true);
    try {
      const result = await toggleWishlistFn({
        data: { productId },
        ...authServerFnOptions(session),
      });
      setWishlisted(result.wishlisted);
      toast.success(result.wishlisted ? "เพิ่มในรายการโปรด" : "ลบออกแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn("size-8 shrink-0", className)}
      disabled={loading}
      onClick={(e) => void handleToggle(e)}
      aria-label="รายการโปรด"
    >
      <Heart
        className={cn(
          "size-4",
          iconClassName,
          wishlisted && "fill-red-500 text-red-500",
        )}
      />
    </Button>
  );
}
