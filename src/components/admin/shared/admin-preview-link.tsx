import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export function AdminPreviewLink({
  href,
  label = "ดูตัวอย่าง",
  className,
  disabled,
  onClick,
}: Props) {
  function handleClick() {
    onClick?.();
    if (disabled) return;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(className)}
      disabled={disabled}
      onClick={handleClick}
    >
      <ExternalLink className="size-4" />
      {label}
    </Button>
  );
}
