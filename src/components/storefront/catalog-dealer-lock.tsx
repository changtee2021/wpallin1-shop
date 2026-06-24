import { Lock, Store } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";
import type { MarketingCatalogDto } from "@/types/api/marketing-catalogs";

type Props = {
  catalog: MarketingCatalogDto;
};

export function CatalogDealerLock({ catalog }: Props) {
  const { t } = useT();

  return (
    <Card className="overflow-hidden border-amber-200 bg-amber-50/50">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
        {catalog.coverImageUrl ? (
          <img
            src={catalog.coverImageUrl}
            alt={catalog.title}
            className="max-h-48 rounded-lg shadow-md"
          />
        ) : (
          <div className="rounded-full bg-amber-100 p-4 text-amber-700">
            <Lock className="size-8" />
          </div>
        )}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{catalog.title}</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {t("catalogs.dealerLock.body")}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/dealer/register">
              <Store className="size-4" />
              {t("catalogs.dealerLock.register")}
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/login">{t("catalogs.dealerLock.login")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
