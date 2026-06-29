import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ChatAdminComposer } from "@/components/chat/chat-admin-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useChatRealtime } from "@/hooks/use-chat-realtime";
import { useT } from "@/i18n";
import {
  assignAdminChat,
  closeAdminChat,
  fetchAdminChatConversations,
  fetchAdminChatDetail,
  sendStaffChatMessage,
  sendStaffChatProducts,
  sendStaffChatQuotation,
} from "@/lib/api.functions";
import { formatDate } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { ChatAttachment } from "@/lib/chat.types";
import { uploadChatAttachment } from "@/lib/chat-upload";
import type { ChatComposerSendPayload } from "@/components/chat/chat-composer";
import type {
  ChatConversationDto,
  ChatMessageDto,
} from "@/services/chat.service";

const searchSchema = z.object({
  conversation: z.string().uuid().optional(),
});

export const Route = createFileRoute("/admin/chat")({
  validateSearch: (search) => searchSchema.parse(search),
  component: AdminChatPage,
});

const STATUS_LABELS: Record<string, string> = {
  bot: "บอท",
  waiting: "รอตอบ",
  assigned: "กำลังคุย",
  closed: "ปิด",
};

function AdminChatPage() {
  const { t } = useT();
  const { session, user } = useAuth();
  const search = Route.useSearch();
  const [tab, setTab] = useState<"waiting" | "mine" | "closed">("waiting");
  const [list, setList] = useState<ChatConversationDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(
    search.conversation ?? null,
  );
  const [detail, setDetail] = useState<{
    conversation: ChatConversationDto;
    messages: ChatMessageDto[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadList = useCallback(async () => {
    const status =
      tab === "waiting" ? "waiting" : tab === "closed" ? "closed" : "all";
    const data = await fetchAdminChatConversations({
      data: {
        status: tab === "mine" ? "assigned" : status,
        mine: tab === "mine",
      },
      ...authServerFnOptions(session),
    });
    setList(data);
  }, [session, tab]);

  const loadDetail = useCallback(
    async (conversationId: string) => {
      const data = await fetchAdminChatDetail({
        data: { conversationId },
        ...authServerFnOptions(session),
      });
      setDetail(data);
    },
    [session],
  );

  const reloadDetail = useCallback(() => {
    if (selectedId) void loadDetail(selectedId);
  }, [loadDetail, selectedId]);

  useChatRealtime(selectedId ?? undefined, user?.id, reloadDetail);

  useEffect(() => {
    setLoading(true);
    void loadList().finally(() => setLoading(false));
  }, [loadList]);

  useEffect(() => {
    if (search.conversation) setSelectedId(search.conversation);
  }, [search.conversation]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function handleAssign() {
    if (!selectedId) return;
    try {
      await assignAdminChat({
        data: { conversationId: selectedId },
        ...authServerFnOptions(session),
      });
      toast.success("รับแชทแล้ว");
      await loadList();
      await loadDetail(selectedId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  async function handleStaffSend(payload: ChatComposerSendPayload) {
    if (!selectedId) return;
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

      await sendStaffChatMessage({
        data: {
          conversationId: selectedId,
          body: payload.text,
          metadata,
        },
        ...authServerFnOptions(session),
      });
      await loadDetail(selectedId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleStaffPickFile(file: File): Promise<ChatAttachment> {
    if (!selectedId) throw new Error("No conversation");
    return uploadChatAttachment({
      file,
      conversationId: selectedId,
      accessToken: session?.access_token ?? null,
    });
  }

  async function handleSendProducts(productIds: string[], body?: string) {
    if (!selectedId) return;
    setSending(true);
    try {
      await sendStaffChatProducts({
        data: { conversationId: selectedId, productIds, body },
        ...authServerFnOptions(session),
      });
      await loadDetail(selectedId);
      toast.success("ส่งสินค้าแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleSendQuotation(quotationId: string, body?: string) {
    if (!selectedId) return;
    setSending(true);
    try {
      await sendStaffChatQuotation({
        data: { conversationId: selectedId, quotationId, body },
        ...authServerFnOptions(session),
      });
      await loadDetail(selectedId);
      toast.success("ส่งใบเสนอราคาแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSending(false);
    }
  }

  async function handleClose() {
    if (!selectedId) return;
    try {
      await closeAdminChat({
        data: { conversationId: selectedId },
        ...authServerFnOptions(session),
      });
      toast.success("ปิดเคสแล้ว");
      await loadList();
      await loadDetail(selectedId);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  if (loading && !list.length) {
    return <PageLoading variant="table" />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.chat.title")}
        description="ตอบแชทลูกค้าจากเว็บแบบ realtime"
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="waiting">{t("admin.chat.waiting")}</TabsTrigger>
          <TabsTrigger value="mine">{t("admin.chat.mine")}</TabsTrigger>
          <TabsTrigger value="closed">{t("admin.chat.closed")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
            <Card className="max-h-[32rem] overflow-y-auto">
              <CardContent className="space-y-2 p-2">
                {list.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    ไม่มีแชท
                  </p>
                ) : (
                  list.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                        selectedId === item.id
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">
                          {item.guestName ?? "ลูกค้า"}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {STATUS_LABELS[item.status] ?? item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDate(item.updatedAt)}
                      </p>
                      {item.linkedTicketId ? (
                        <Link
                          to="/admin/support"
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ดู ticket
                        </Link>
                      ) : null}
                    </button>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="flex min-h-[32rem] flex-col">
              {!detail ? (
                <CardContent className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">
                  เลือกแชทจากรายการ
                </CardContent>
              ) : (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
                    <div>
                      <p className="font-semibold">
                        {detail.conversation.guestName ?? "ลูกค้า"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        โหมด {detail.conversation.mode} ·{" "}
                        {typeof detail.conversation.context.page_url ===
                        "string"
                          ? detail.conversation.context.page_url
                          : "—"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {detail.conversation.status === "waiting" ? (
                        <Button size="sm" onClick={() => void handleAssign()}>
                          {t("admin.chat.assign")}
                        </Button>
                      ) : null}
                      {detail.conversation.status !== "closed" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleClose()}
                        >
                          {t("admin.chat.closeChat")}
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col">
                    <ChatMessageList
                      messages={detail.messages}
                      onQuotationResponded={reloadDetail}
                    />
                  </div>

                  {detail.conversation.status !== "closed" ? (
                    <ChatAdminComposer
                      disabled={sending}
                      customerUserId={detail.conversation.userId}
                      onSendText={handleStaffSend}
                      onSendProducts={handleSendProducts}
                      onSendQuotation={handleSendQuotation}
                      onPickFile={handleStaffPickFile}
                    />
                  ) : null}
                </>
              )}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
