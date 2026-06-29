import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { fetchAccountProfileCached } from "@/lib/account-profile-cache";
import { useLocaleControl } from "@/i18n";

export function LocaleSync() {
  const { session, user } = useAuth();
  const { setLocale } = useLocaleControl();

  useEffect(() => {
    if (!session || !user) return;

    let cancelled = false;
    const sync = () => {
      void fetchAccountProfileCached(session)
        .then((profile) => {
          if (cancelled) return;
          if (profile.locale === "en" || profile.locale === "th") {
            setLocale(profile.locale);
          }
        })
        .catch(() => {
          /* keep stored locale */
        });
    };

    const idleId =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(sync, { timeout: 3000 })
        : window.setTimeout(sync, 500);

    return () => {
      cancelled = true;
      if (typeof requestIdleCallback !== "undefined") {
        cancelIdleCallback(idleId as number);
      } else {
        clearTimeout(idleId as number);
      }
    };
  }, [session, user, setLocale]);

  return null;
}
