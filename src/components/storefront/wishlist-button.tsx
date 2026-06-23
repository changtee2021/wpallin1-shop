import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { toggleWishlistFn, fetchWishlistIds } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
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

  async function handleToggle() {
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
      variant="outline"
      size="icon"
      className={cn(className)}
      disabled={loading}
      onClick={() => void handleToggle()}
      aria-label="รายการโปรด"
    >
      <Heart
        className={cn("size-5", wishlisted && "fill-red-500 text-red-500")}
      />
    </Button>
  );
}
