import { Link } from "@tanstack/react-router";

import { useT } from "@/i18n";

const CLOSE_BANNER = "/home/home-close-banner.png";

export function HomeCapabilities() {
  const { t } = useT();

  return (
    <section className="relative w-full overflow-hidden">
      <Link
        to="/shop"
        className="group relative block min-h-[220px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[400px]"
      >
        <img
          src={CLOSE_BANNER}
          alt={`${t("home.close.title")} ${t("home.close.line")}`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover object-[78%_center] transition-transform duration-500 group-hover:scale-[1.015]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-white/20 to-transparent sm:from-white/40 sm:via-white/10" />
        <div className="relative mx-auto flex min-h-[220px] w-full max-w-7xl items-center px-4 py-10 sm:min-h-[280px] sm:px-6 md:min-h-[340px] lg:min-h-[400px] lg:px-8">
          <h2 className="font-bold leading-[1.15] text-foreground">
            <span className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
              {t("home.close.title")}
            </span>
            <span className="mt-1 block text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
              {t("home.close.line")}
            </span>
          </h2>
        </div>
      </Link>
    </section>
  );
}
