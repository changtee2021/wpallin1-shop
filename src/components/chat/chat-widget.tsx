import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";

import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { ChatPremiumBadge } from "@/components/chat/chat-premium-badge";
import { LineMonoIcon } from "@/components/icons/brand/line-mono";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useChatUi } from "@/hooks/use-chat-ui";
import {
  getGuestChatSessionId,
  setStoredConversationId,
} from "@/hooks/use-chat-session";
import { useChatPoll, useChatRealtime } from "@/hooks/use-chat-realtime";
import { useT } from "@/i18n";
import {
  fetchChatSession,
  requestChatHandoff,
  sendChatMessage,
} from "@/lib/api.functions";
import { LINE_OA_URL } from "@/lib/catalog-config";
import type { ChatAiAccess } from "@/lib/chat-ai-eligibility";
import type { ChatAttachment } from "@/lib/chat.types";
import { uploadChatAttachment } from "@/lib/chat-upload";
import type {
  ChatConversationDto,
  ChatMessageDto,
} from "@/services/chat.service";
import type { ChatComposerSendPayload } from "@/components/chat/chat-composer";
export function ChatWidget() {
  const { t, locale } = useT();
  const { user, session } = useAuth();
  const { open, closeChat } = useChatUi();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState<ChatConversationDto | null>(
    null,
  );
  const [messages, setMessages] = useState<ChatMessageDto[]>([]);
  const [aiAccess, setAiAccess] = useState<ChatAiAccess | null>(null);
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [handoffForm, setHandoffForm] = useState({ name: "", phone: "" });

  const guestSessionId = user ? undefined : getGuestChatSessionId();
  const context = { page_url: pathname, locale };

  const reload = useCallback(async () => {
    if (!open) return;
    try {
      const session = await fetchChatSession({
        data: {
          guestSessionId,
          context: { page_url: pathname, locale },
          locale,
        },
      });
      setConversation(session.conversation);
      setMessages(session.messages);
      setAiAccess(session.aiAccess);
      setStoredConversationId(session.conversation.id);
    } catch (err) {
      console.error("[chat] load failed", err);
    }
  }, [open, guestSessionId, pathname, locale]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void reload().finally(() => setLoading(false));
  }, [open, reload]);

  useChatRealtime(conversation?.id, user?.id, reload);
  useChatPoll(
    conversation?.id,
    open &&
      !user &&
      (conversation?.status === "assigned" ||
        conversation?.status === "waiting"),
    reload,
  );

  async function handleSend(payload: ChatComposerSendPayload) {
    if (!conversation) return;
    setSending(true);
    try {
      const metadata = payload.attachments?.length
        ? {
            kind: payload.attachments[0]!.mime.startsWith("image/")
              ? ("image" as const)
              : ("file" as const),
            attachments: payload.attachments,
          }
        : undefined;

      const result = await sendChatMessage({
        data: {
          guestSessionId,
          conversationId: conversation.id,
          body: payload.text,
          metadata,
          context,
          locale,
        },
      });
      setConversation(result.conversation);
      setMessages(result.messages);
      if (
        result.suggestHandoff &&
        conversation.status !== "assigned" &&
        conversation.status !== "waiting"
      ) {
        toast.message(t("chat.attachHandoffHint"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.sendFailed"));
    } finally {
      setSending(false);
    }
  }

  async function handlePickFile(file: File): Promise<ChatAttachment> {
    if (!conversation) throw new Error("No conversation");
    return uploadChatAttachment({
      file,
      conversationId: conversation.id,
      guestSessionId,
      accessToken: session?.access_token ?? null,
    });
  }

  async function handleHandoff() {
    if (!conversation) return;
    if (!user) {
      setHandoffOpen(true);
      return;
    }
    setSending(true);
    try {
      const result = await requestChatHandoff({
        data: {
          guestSessionId,
          conversationId: conversation.id,
          context,
        },
      });
      setConversation(result.conversation);
      setMessages(result.messages);
      toast.success(t("chat.handoffSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.handoffFailed"));
    } finally {
      setSending(false);
    }
  }

  async function submitGuestHandoff() {
    if (!conversation) return;
    setSending(true);
    try {
      const result = await requestChatHandoff({
        data: {
          guestSessionId,
          conversationId: conversation.id,
          guestName: handoffForm.name.trim(),
          guestPhone: handoffForm.phone.trim(),
          context,
        },
      });
      setConversation(result.conversation);
      setMessages(result.messages);
      setHandoffOpen(false);
      toast.success(t("chat.handoffSuccess"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("chat.handoffFailed"));
    } finally {
      setSending(false);
    }
  }

  const isHumanMode =
    conversation?.status === "waiting" || conversation?.status === "assigned";

  if (!open) return null;

  return (
    <>
      <div className="fixed top-16 right-4 z-50 sm:top-[4.5rem]">
        <div className="flex h-[min(32rem,calc(100dvh-5.5rem))] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <div className="flex items-start justify-between gap-2 bg-gradient-to-r from-primary to-[#126B68] px-4 py-3 text-white">
            <div className="min-w-0">
              <p className="font-semibold">{t("chat.title")}</p>
              {aiAccess ? <ChatPremiumBadge aiAccess={aiAccess} /> : null}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-white hover:bg-white/10"
              onClick={closeChat}
              aria-label={t("chat.close")}
            >
              <X className="size-5" />
            </Button>
          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
              {t("chat.loading")}
            </div>
          ) : (
            <ChatMessageList
              messages={messages}
              onQuotationResponded={reload}
            />
          )}

          {isHumanMode ? (
            <div className="border-t bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
              {conversation?.status === "waiting"
                ? t("chat.waitingStaff")
                : t("chat.staffJoined")}
            </div>
          ) : null}

          <ChatComposer
            disabled={loading || sending || conversation?.status === "closed"}
            showQuickReplies={!isHumanMode}
            onSend={(payload) => void handleSend(payload)}
            onHandoff={() => void handleHandoff()}
            onPickFile={handlePickFile}
          />

          <div className="flex items-center justify-center gap-2 border-t px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <a href={LINE_OA_URL} target="_blank" rel="noopener noreferrer">
                <LineMonoIcon className="size-3.5" />
                {t("chat.lineFallback")}
              </a>
            </Button>
            {!isHumanMode ? (
              <Button
                variant="secondary"
                size="sm"
                className="h-8 text-xs"
                disabled={sending}
                onClick={() => void handleHandoff()}
              >
                {t("chat.talkToStaff")}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={handoffOpen} onOpenChange={setHandoffOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("chat.handoffTitle")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="chat-name">{t("chat.name")}</Label>
              <Input
                id="chat-name"
                value={handoffForm.name}
                onChange={(e) =>
                  setHandoffForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="chat-phone">{t("chat.phone")}</Label>
              <Input
                id="chat-phone"
                value={handoffForm.phone}
                onChange={(e) =>
                  setHandoffForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={sending || !handoffForm.name || !handoffForm.phone}
              onClick={() => void submitGuestHandoff()}
            >
              {t("chat.handoffSubmit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
