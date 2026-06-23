import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";

const CONSENT_KEY = "cookie-consent";

export type CookieConsentValue = "all" | "essential";

function readConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem(CONSENT_KEY);
  if (value === "all" || value === "essential") return value;
  return null;
}

function writeConsent(value: CookieConsentValue) {
  localStorage.setItem(CONSENT_KEY, value);
  window.dispatchEvent(
    new CustomEvent("cookie-consent-changed", { detail: value }),
  );
}

export function CookieConsent() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookie.banner.title")}
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 p-4 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            {t("cookie.banner.title")}
          </p>
          <p className="mt-1">{t("cookie.banner.body")}</p>
          <Link
            to="/cookies"
            className="mt-1 inline-block underline hover:text-foreground"
          >
            {t("footer.cookies")}
          </Link>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              writeConsent("essential");
              setVisible(false);
            }}
          >
            {t("cookie.banner.essentialOnly")}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              writeConsent("all");
              setVisible(false);
            }}
          >
            {t("cookie.banner.acceptAll")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function hasMarketingConsent(): boolean {
  return readConsent() === "all";
}
