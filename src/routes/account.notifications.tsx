import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchNotifications,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/lib/api.functions";
import { formatDate } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { NotificationDto } from "@/services/notification.service";

export const Route = createFileRoute("/account/notifications")({
  component: AccountNotificationsPage,
});

function AccountNotificationsPage() {
  const { session } = useAuth();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const authOpts = authServerFnOptions(session);

  useEffect(() => {
    void fetchNotifications(authOpts).then(setItems);
  }, [session]);

  async function markRead(id: string) {
    await markNotificationReadFn({ data: { id }, ...authOpts });
    setItems((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readAt: new Date().toISOString() } : n,
      ),
    );
  }

  async function markAll() {
    await markAllNotificationsReadFn(authOpts);
    setItems((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })),
    );
    toast.success("อ่านทั้งหมดแล้ว");
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <PageHeader title="แจ้งเตือน" description="ข้อความจากระบบและทีมขาย" />
        <Button variant="outline" size="sm" onClick={() => void markAll()}>
          อ่านทั้งหมด
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              ไม่มีแจ้งเตือน
            </CardContent>
          </Card>
        ) : (
          items.map((n) => {
            const href =
              typeof n.payload.href === "string" ? n.payload.href : null;
            return (
              <Card key={n.id} className={n.readAt ? "opacity-80" : ""}>
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.readAt ? <Badge>ใหม่</Badge> : null}
                    </div>
                    {n.body ? (
                      <p className="text-sm text-muted-foreground">{n.body}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(n.createdAt)}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="mt-2 inline-block text-sm text-primary underline"
                        onClick={() => {
                          if (!n.readAt) void markRead(n.id);
                        }}
                      >
                        ดูรายละเอียด
                      </a>
                    ) : null}
                  </div>
                  {!n.readAt ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void markRead(n.id)}
                    >
                      อ่านแล้ว
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
