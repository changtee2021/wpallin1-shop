import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

function removeChannelSafe(
  channel: ReturnType<typeof supabase.channel>,
) {
  try {
    void channel.unsubscribe();
  } catch {
    // ignore — channel may already be torn down
  }
  void supabase.removeChannel(channel);
}

/**
 * Live notification inserts for the signed-in user.
 * Uses a unique channel topic per mount so React re-runs / HMR cannot
 * call `.on()` after an existing channel has already subscribed.
 */
export function useNotificationsRealtime(
  userId: string | undefined,
  onChange: () => void,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!userId) return;

    const topic = `notifications:${userId}:${crypto.randomUUID()}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "wpall_retail",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            void onChangeRef.current();
          },
        )
        .subscribe();
    } catch (err) {
      console.warn("[notifications-realtime] subscribe failed:", err);
      return;
    }

    return () => {
      if (channel) removeChannelSafe(channel);
    };
  }, [userId]);
}
