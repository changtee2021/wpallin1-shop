import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import {
  getMyDealerApplication,
  type DealerApplicationDto,
} from "@/services/dealer.service";

const LOAD_TIMEOUT_MS = 10_000;

/**
 * Loads the current user's dealer application via the browser Supabase client
 * (RLS owner read). Avoids server-fn auth middleware hangs on this page.
 */
export function useDealerApplication(
  userId: string | undefined,
  isDealer: boolean,
) {
  const [application, setApplication] = useState<DealerApplicationDto | null>(
    null,
  );
  const [loading, setLoading] = useState(Boolean(userId && !isDealer));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || isDealer) {
      setApplication(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        setError("โหลดสถานะช้า — กรอกฟอร์มด้านล่างได้เลย");
      }
    }, LOAD_TIMEOUT_MS);

    void getMyDealerApplication(supabase, userId)
      .then((app) => {
        if (!cancelled) {
          setApplication(app);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "โหลดสถานะใบสมัครไม่สำเร็จ",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          window.clearTimeout(timeoutId);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [userId, isDealer]);

  return { application, loading, error, setApplication };
}
