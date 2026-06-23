import { Share2 } from "lucide-react";
import { type MouseEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/public-url";
import { cn } from "@/lib/utils";

export function ProductShareButton({
  slug,
  name,
  className,
  variant = "ghost",
}: {
  slug: string;
  name: string;
  className?: string;
  variant?: "outline" | "ghost";
}) {
  async function handleShare(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    const url = absoluteUrl(`/products/${slug}`);

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("คัดลอกลิงก์แล้ว");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        toast.success("คัดลอกลิงก์แล้ว");
      } catch {
        toast.error("แชร์ไม่สำเร็จ");
      }
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="icon"
      className={cn("size-8 shrink-0", className)}
      onClick={(e) => void handleShare(e)}
      aria-label="แชร์สินค้า"
    >
      <Share2 className="size-4" />
    </Button>
  );
}
