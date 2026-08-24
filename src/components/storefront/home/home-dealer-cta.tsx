import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

const DEALER_BANNER = "/home/dealer-business-talk.png";

export function HomeDealerCta() {
  const { t } = useT();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-primary shadow-sm ring-1 ring-black/5">
      <img
        src={DEALER_BANNER}
        alt={t("home.dealer.title")}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-[72%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/15 sm:via-black/45 sm:to-transparent" />

      <div className="relative flex min-h-[220px] flex-col justify-center gap-4 px-5 py-8 sm:min-h-[260px] sm:px-8 sm:py-10 md:min-h-[300px] md:px-10 lg:max-w-[58%]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/80">
          {t("home.dealer.kicker")}
        </p>
        <div>
          <h2 className="text-xl font-bold text-white sm:text-2xl md:text-[1.75rem] md:leading-tight">
            {t("home.dealer.title")}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/90 sm:text-base">
            {t("home.dealer.body")}
          </p>
        </div>
        <ul className="space-y-1 text-sm text-white/85">
          <li>• {t("home.dealer.point1")}</li>
          <li>• {t("home.dealer.point2")}</li>
          <li>• {t("home.dealer.point3")}</li>
        </ul>
        <div>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            asChild
          >
            <Link to="/dealer/register">{t("home.dealer.ctaRegister")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
