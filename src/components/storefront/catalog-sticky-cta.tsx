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
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl gap-2 sm:justify-end">
        <Button className="flex-1 sm:flex-none" asChild>
          <Link to="/account/quotations">
            <FileText className="size-4" />
            {t("catalogs.viewer.requestQuote")}
          </Link>
        </Button>
        <Button variant="outline" className="flex-1 sm:flex-none" asChild>
          <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-4" />
            {t("catalogs.viewer.lineChat")}
          </a>
        </Button>
      </div>
    </div>
  );
}
