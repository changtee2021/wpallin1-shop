import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  listUserNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/services/notification.service";

export const fetchNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    listUserNotifications(context.supabase, context.userId),
  );

export const fetchUnreadNotificationCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) =>
    getUnreadCount(context.supabase, context.userId),
  );

export const markNotificationReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await markNotificationRead(context.supabase, context.userId, data.id);
    return { ok: true };
  });

export const markAllNotificationsReadFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await markAllNotificationsRead(context.supabase, context.userId);
    return { ok: true };
  });
