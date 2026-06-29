import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

export function useChatRealtime(
  conversationId: string | undefined,
  userId: string | undefined,
  onChange: () => void,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "wpall_retail",
          table: "chat_messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => onChangeRef.current(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "wpall_retail",
          table: "chat_conversations",
          filter: `id=eq.${conversationId}`,
        },
        () => onChangeRef.current(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);
}

export function useChatPoll(
  conversationId: string | undefined,
  enabled: boolean,
  onChange: () => void,
  intervalMs = 4000,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!conversationId || !enabled) return;
    const id = window.setInterval(() => onChangeRef.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [conversationId, enabled, intervalMs]);
}
