import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";

export function HomeDealerCta() {
  const { t } = useT();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-white to-accent/5">
      <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <Store className="size-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {t("home.dealer.title")}
            </h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t("home.dealer.body")}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
              <li>• {t("home.dealer.point1")}</li>
              <li>• {t("home.dealer.point2")}</li>
              <li>• {t("home.dealer.point3")}</li>
            </ul>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/dealer/register">{t("home.dealer.ctaRegister")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/order">{t("home.dealer.ctaQuickOrder")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
