import { useEffect, useRef } from "react";

import { ChatMessageContent } from "@/components/chat/chat-message-content";
import { cn } from "@/lib/utils";
import type { ChatMessageDto } from "@/services/chat.service";

type Props = {
  messages: ChatMessageDto[];
  onQuotationResponded?: () => void;
};

export function ChatMessageList({ messages, onQuotationResponded }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-3">
      {messages.map((msg) => {
        const isVisitor = msg.senderType === "visitor";
        const isSystem = msg.senderType === "system";

        return (
          <div
            key={msg.id}
            className={cn(
              "flex",
              isVisitor ? "justify-end" : "justify-start",
              isSystem && "justify-center",
            )}
          >
            <div
              className={cn(
                "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                isVisitor && "bg-primary text-primary-foreground",
                msg.senderType === "bot" && "bg-muted text-foreground",
                msg.senderType === "staff" && "bg-accent/15 text-foreground",
                isSystem &&
                  "max-w-full bg-transparent px-0 py-0 text-center text-xs text-muted-foreground",
              )}
            >
              <ChatMessageContent
                body={msg.body}
                metadata={msg.metadata}
                isVisitor={isVisitor}
                onQuotationResponded={onQuotationResponded}
              />
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
