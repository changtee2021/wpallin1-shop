import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

export function InspirationHero() {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#126B68] px-6 py-10 text-white sm:px-10 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.12) 10px, rgba(255,255,255,0.12) 20px)",
        }}
      />
      <div className="relative max-w-2xl space-y-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-white/85">
          <Sparkles className="size-3.5" />
          WP Inspiration
        </p>
        <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
          {t("inspiration.title")}
        </h1>
        <p className="text-sm leading-relaxed text-white/90 sm:text-base">
          {t("inspiration.subtitle")}
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Button
            size="sm"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link to="/configurator">{t("home.hero.ctaConfigurator")}</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link to="/room-advisor">อัปโหลดรูปห้อง</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/40 bg-transparent text-white hover:bg-white/10"
            asChild
          >
            <Link to="/shop">{t("home.hero.ctaShop")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
