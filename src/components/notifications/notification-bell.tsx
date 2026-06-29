import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsReadFn,
  markNotificationReadFn,
} from "@/lib/api.functions";
import { formatDate } from "@/lib/format";
import { useAuthServerFnOptions } from "@/lib/server-fn-auth";
import { useNotificationsRealtime } from "@/hooks/use-notifications-realtime";
import type { NotificationDto } from "@/services/notification.service";

export function NotificationBell({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const { session, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const authOpts = useAuthServerFnOptions(session);

  const loadUnread = useCallback(async () => {
    if (!user) return;
    const count = await fetchUnreadNotificationCount(authOpts);
    setUnread(count);
  }, [authOpts, user]);

  const loadList = useCallback(async () => {
    if (!user) return;
    const list = await fetchNotifications(authOpts);
    setItems(list);
  }, [authOpts, user]);

  const load = useCallback(async () => {
    if (!user) return;
    const [count, list] = await Promise.all([
      fetchUnreadNotificationCount(authOpts),
      fetchNotifications(authOpts),
    ]);
    setUnread(count);
    setItems(list);
  }, [authOpts, user]);

  useEffect(() => {
    void loadUnread();
    const interval = setInterval(() => void loadUnread(), 60_000);
    return () => clearInterval(interval);
  }, [loadUnread]);

  useEffect(() => {
    if (!open) return;
    void loadList();
  }, [open, loadList]);

  useNotificationsRealtime(user?.id, load);

  async function handleMarkRead(id: string) {
    await markNotificationReadFn({ data: { id }, ...authOpts });
    await load();
  }

  async function handleMarkAll() {
    await markAllNotificationsReadFn(authOpts);
    await load();
  }

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative rounded-full ${triggerClassName ?? ""}`}
        >
          <Bell className="size-5" />
          {unread > 0 ? (
            <Badge className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-accent p-0 text-[9px] text-white">
              {unread > 9 ? "9+" : unread}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">แจ้งเตือน</p>
          {unread > 0 ? (
            <button
              type="button"
              className="text-xs text-primary hover:underline"
              onClick={() => void handleMarkAll()}
            >
              อ่านทั้งหมด
            </button>
          ) : null}
        </div>
        <div className="max-h-72 overflow-y-auto">
          {items.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              ไม่มีแจ้งเตือน
            </p>
          ) : (
            items.slice(0, 8).map((n) => {
              const href =
                typeof n.payload.href === "string" ? n.payload.href : null;
              const content = (
                <div
                  className={`border-b px-3 py-2 text-left last:border-0 ${n.readAt ? "opacity-70" : "bg-muted/30"}`}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body ? (
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  ) : null}
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDate(n.createdAt)}
                  </p>
                </div>
              );
              if (href) {
                return (
                  <a
                    key={n.id}
                    href={href}
                    className="block"
                    onClick={() => {
                      if (!n.readAt) void handleMarkRead(n.id);
                      setOpen(false);
                    }}
                  >
                    {content}
                  </a>
                );
              }
              return (
                <button
                  key={n.id}
                  type="button"
                  className="block w-full"
                  onClick={() => {
                    if (!n.readAt) void handleMarkRead(n.id);
                  }}
                >
                  {content}
                </button>
              );
            })
          )}
        </div>
        <div className="border-t p-2">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link to="/account/notifications" onClick={() => setOpen(false)}>
              ดูทั้งหมด
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
