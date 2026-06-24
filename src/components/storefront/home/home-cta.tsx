import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export function HomeCta() {
  const { t } = useT();

  return (
    <section className="rounded-2xl bg-gradient-to-r from-primary to-primary/90 px-6 py-10 text-center text-white sm:px-10 sm:py-12">
      <h2 className="text-xl font-bold sm:text-2xl">{t("home.cta.title")}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-white/90 sm:text-base">
        {t("home.cta.body")}
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          size="lg"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          asChild
        >
          <Link to="/contact">{t("home.cta.primary")}</Link>
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link to="/configurator">{t("home.cta.secondary")}</Link>
        </Button>
      </div>
    </section>
  );
}
