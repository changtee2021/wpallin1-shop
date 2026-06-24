import { Link } from "@tanstack/react-router";

import { Separator } from "@/components/ui/separator";
import { useT } from "@/i18n";

export function StorefrontFooter() {
  const { t } = useT();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div>
          <p className="font-semibold">{t("app.name")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("app.tagline")}
          </p>
        </div>
        <div className="text-sm text-muted-foreground md:text-right">
          <div className="flex flex-col gap-2 md:items-end">
            <Link to="/about" className="hover:text-foreground">
              {t("nav.about")}
            </Link>
            <Link to="/contact" className="hover:text-foreground">
              {t("nav.contact")}
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              {t("footer.terms")}
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              {t("footer.cookies")}
            </Link>
            <Link to="/dealer/register" className="hover:text-foreground">
              สมัครตัวแทนจำหน่าย
            </Link>
          </div>
        </div>
      </div>
      <Separator />
      <p className="px-4 py-4 text-center text-xs text-muted-foreground">
        © {year} {t("app.name")}. {t("footer.rights")}.
      </p>
    </footer>
  );
}
