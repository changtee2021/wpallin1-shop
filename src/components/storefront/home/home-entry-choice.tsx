import { Link } from "@tanstack/react-router";
import { ShoppingBag, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useT } from "@/i18n";

export function HomeEntryChoice() {
  const { t } = useT();
  const { user } = useAuth();

  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-primary/15 p-3 text-primary">
              <Store className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t("home.entry.b2b.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("home.entry.b2b.desc")}
              </p>
            </div>
          </div>
          <Button
            asChild
            className="mt-auto w-full bg-primary hover:bg-primary/90"
          >
            <Link to="/order">{t("home.entry.b2b.cta")}</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border">
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-muted p-3 text-foreground">
              <ShoppingBag className="size-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t("home.entry.retail.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("home.entry.retail.desc")}
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-auto w-full">
            <Link to="/shop">{t("home.entry.retail.cta")}</Link>
          </Button>
        </CardContent>
      </Card>

      {user ? (
        <p className="text-center text-sm text-muted-foreground sm:col-span-2">
          <Link to="/order" className="font-medium text-primary underline">
            {t("home.entry.loginOrder")}
          </Link>
        </p>
      ) : (
        <p className="text-center text-sm text-muted-foreground sm:col-span-2">
          {t("home.entry.hasAccount")}{" "}
          <Link to="/login" className="font-medium text-primary underline">
            {t("nav.login")}
          </Link>
          {" · "}
          <Link to="/order" className="font-medium text-primary underline">
            {t("home.entry.loginOrder")}
          </Link>
        </p>
      )}
    </section>
  );
}
