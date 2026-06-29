import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import { LINE_OA_URL } from "@/lib/catalog-config";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "outline" | "default" | "ghost";
  size?: "default" | "sm" | "icon";
};

export function ContactSalesButton({
  className,
  variant = "outline",
  size = "sm",
}: Props) {
  const { t } = useT();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-1.5", className)}
      asChild
    >
      <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="size-4" />
        {t("catalogs.viewer.lineChat")}
      </a>
    </Button>
  );
}
