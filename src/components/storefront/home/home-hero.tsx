import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export function HomeHero() {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 12px, rgba(255,255,255,0.15) 12px, rgba(255,255,255,0.15) 24px)",
        }}
      />
      <div className="relative grid gap-8 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="max-w-xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            {t("app.tagline")}
          </p>
          <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            {t("home.hero.title")}
          </h1>
          <p className="text-sm leading-relaxed text-white/90 sm:text-base">
            {t("home.hero.subtitle")}
          </p>
          <p className="text-sm leading-relaxed text-white/80">
            {t("home.hero.body")}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              asChild
            >
              <Link to="/shop">{t("home.hero.ctaShop")}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link to="/contact">{t("home.hero.ctaContact")}</Link>
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm">
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
              <img
                src="/brand/logo-color.png"
                alt="WP ALL"
                className="h-24 w-auto object-contain drop-shadow-lg"
              />
              <p className="text-center text-sm font-medium text-white/90">
                CENTER OF CURTAIN
              </p>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 size-32 rounded-full bg-accent/30 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
