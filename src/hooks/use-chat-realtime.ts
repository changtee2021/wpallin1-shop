import { useEffect, useRef } from "react";

import { supabase } from "@/integrations/supabase/client";

function removeChannelSafe(
  channel: ReturnType<typeof supabase.channel>,
) {
  try {
    void channel.unsubscribe();
  } catch {
    // ignore
  }
  void supabase.removeChannel(channel);
}

export function useChatRealtime(
  conversationId: string | undefined,
  userId: string | undefined,
  onChange: () => void,
) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!conversationId || !userId) return;

    const topic = `chat:${conversationId}:${crypto.randomUUID()}`;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "wpall_retail",
            table: "chat_messages",
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            void onChangeRef.current();
          },
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "wpall_retail",
            table: "chat_conversations",
            filter: `id=eq.${conversationId}`,
          },
          () => {
            void onChangeRef.current();
          },
        )
        .subscribe();
    } catch (err) {
      console.warn("[chat-realtime] subscribe failed:", err);
      return;
    }

    return () => {
      if (channel) removeChannelSafe(channel);
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
