import { Share2 } from "lucide-react";
import { useState, type MouseEvent } from "react";

import { ShareSheet } from "@/components/storefront/share-sheet";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { absoluteUrl } from "@/lib/public-url";
import { cn } from "@/lib/utils";

export function InspirationShareButton({
  slug,
  title,
  sharePath,
  className,
  variant = "ghost",
  compact = false,
}: {
  slug: string;
  title: string;
  sharePath?: string;
  className?: string;
  variant?: "outline" | "ghost";
  compact?: boolean;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const url = absoluteUrl(sharePath ?? `/inspiration/${slug}`);

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
        className={cn(
          compact
            ? "size-6 shrink-0"
            : "size-8 shrink-0 bg-white/90 shadow-sm backdrop-blur-sm",
          className,
        )}
        onClick={handleClick}
        aria-label={t("inspiration.share.aria")}
      >
        <Share2 className={cn(compact ? "size-3.5" : "size-4")} />
      </Button>
      <ShareSheet
        open={open}
        onOpenChange={setOpen}
        title={title}
        url={url}
        sheetTitle={t("inspiration.share.title")}
      />
    </>
  );
}
