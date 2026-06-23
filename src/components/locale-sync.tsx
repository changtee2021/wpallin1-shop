import { useEffect } from "react";

import { useAuth } from "@/hooks/use-auth";
import { fetchAccountProfile } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useLocaleControl } from "@/i18n";

export function LocaleSync() {
  const { session, user } = useAuth();
  const { setLocale } = useLocaleControl();

  useEffect(() => {
    if (!session || !user) return;
    void fetchAccountProfile(authServerFnOptions(session))
      .then((profile) => {
        if (profile.locale === "en" || profile.locale === "th") {
          setLocale(profile.locale);
        }
      })
      .catch(() => {
        /* keep stored locale */
      });
  }, [session, user, setLocale]);

  return null;
}
