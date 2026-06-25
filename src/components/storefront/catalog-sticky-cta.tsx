import { FileText, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { LINE_OA_URL } from "@/lib/catalog-config";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function CatalogStickyCta({ className }: Props) {
  const { t } = useT();

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    >
      <Button className="w-full sm:w-auto" asChild>
        <Link to="/account/quotations">
          <FileText className="size-4" />
          {t("catalogs.viewer.requestQuote")}
        </Link>
      </Button>
      <Button variant="outline" className="w-full sm:w-auto" asChild>
        <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="size-4" />
          {t("catalogs.viewer.lineChat")}
        </a>
      </Button>
    </div>
  );
}
