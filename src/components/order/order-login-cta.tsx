import { Link } from "@tanstack/react-router";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";

export function OrderLoginCta() {
  const { t } = useT();

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <LogIn className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-medium">{t("order.loginCtaTitle")}</p>
            <p className="text-xs text-muted-foreground">
              {t("order.loginForHistory")}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link to="/login">{t("nav.login")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
