import { useState, type MouseEvent } from "react";

import { ShareSheet } from "@/components/storefront/share-sheet";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { absoluteUrl } from "@/lib/public-url";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";

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
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const url = absoluteUrl(`/products/${slug}`);

  function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size="icon"
        className={cn("size-8 shrink-0", className)}
        onClick={handleClick}
        aria-label={t("share.productAria")}
      >
        <Share2 className="size-4" />
      </Button>
      <ShareSheet
        open={open}
        onOpenChange={setOpen}
        title={name}
        url={url}
        sheetTitle={t("share.titleProduct")}
      />
    </>
  );
}
