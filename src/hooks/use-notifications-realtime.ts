import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

export function useNotificationsRealtime(
  userId: string | undefined,
  onChange: () => void,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "wpall_retail",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => onChangeRef.current(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
