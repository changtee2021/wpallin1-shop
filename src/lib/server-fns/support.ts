import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireAdmin } from "@/lib/server-auth";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  getAdminSupportTicket,
  listAdminSupportTickets,
  listGuestFeedback,
  updateSupportTicketStatus,
} from "@/services/support.service";

export const fetchAdminSupportTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        status: z
          .enum(["all", "open", "in_progress", "resolved", "closed"])
          .optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listAdminSupportTickets(supabase, { status: data.status });
  });

export const fetchAdminSupportTicketDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ ticketId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return getAdminSupportTicket(supabase, data.ticketId);
  });

export const updateAdminSupportTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        ticketId: z.string().uuid(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]),
        note: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    await updateSupportTicketStatus(supabase, {
      ticketId: data.ticketId,
      status: data.status,
      adminUserId: context.userId,
      note: data.note,
    });
    return { ok: true };
  });

export const fetchAdminGuestFeedback = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listGuestFeedback(supabase);
  });
