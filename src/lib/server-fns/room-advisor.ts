import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { enforceRateLimit, RateLimitError } from "@/lib/rate-limit";
import { getAdminClient } from "@/lib/server-fns/_shared";
import { requireAdmin, optionalSupabaseAuth } from "@/lib/server-auth";
import {
  analyzeRoomAdvisorSession,
  createRoomAdvisorSession,
  enableRoomAdvisorShare,
  getRoomAdvisorSessionById,
  getRoomAdvisorSessionByToken,
  listRoomAdvisorSessions,
  recordRoomAdvisorCustomerView,
  submitRoomAdvisorCustomerResponse,
  updateRoomAdvisorSessionMeta,
} from "@/services/room-advisor.service";

const photoInputSchema = z.object({
  storagePath: z.string().min(1),
  publicUrl: z.string().url(),
  roomLabel: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0),
  isHero: z.boolean(),
});

const createSessionSchema = z.object({
  guestSessionId: z.string().uuid().optional(),
  clientName: z.string().max(120).nullable().optional(),
  clientPhone: z.string().max(30).nullable().optional(),
  roomTypeHint: z.string().max(80).nullable().optional(),
  customerNotes: z.string().max(2000).nullable().optional(),
  photos: z.array(photoInputSchema).min(1).max(5),
});

export const createRoomAdvisorSessionFn = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) => createSessionSchema.parse(input))
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    const userId = context.userId ?? null;

    return createRoomAdvisorSession(supabase, {
      userId,
      guestSessionId: data.guestSessionId ?? null,
      createdByUserId: userId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      roomTypeHint: data.roomTypeHint,
      customerNotes: data.customerNotes,
      photos: data.photos,
    });
  });

export const analyzeRoomAdvisorSessionFn = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        guestSessionId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const rateKey = context.userId ?? data.guestSessionId ?? data.sessionId;
    try {
      await enforceRateLimit("room-advisor-analyze", rateKey, {
        requests: 5,
        window: "1 h",
      });
    } catch (err) {
      if (err instanceof RateLimitError) {
        throw new Error("เรียก AI บ่อยเกินไป กรุณารอสักครู่");
      }
      throw err;
    }

    const supabase = await getAdminClient();
    return analyzeRoomAdvisorSession(supabase, data.sessionId);
  });

export const fetchRoomAdvisorSessionFn = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ sessionId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return getRoomAdvisorSessionById(supabase, data.sessionId);
  });

export const fetchRoomAdvisorByTokenFn = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(8) }).parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    const session = await getRoomAdvisorSessionByToken(supabase, data.token);
    if (!session) throw new Error("NOT_FOUND");
    await recordRoomAdvisorCustomerView(supabase, data.token);
    return session;
  });

export const enableRoomAdvisorShareFn = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        expiresInDays: z.number().int().min(1).max(30).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return enableRoomAdvisorShare(
      supabase,
      data.sessionId,
      data.expiresInDays ?? 7,
    );
  });

export const submitRoomAdvisorResponseFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(8),
        selectedRanks: z.array(z.number().int().min(1).max(3)),
        feedback: z.string().max(2000).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return submitRoomAdvisorCustomerResponse(supabase, data.token, {
      selectedRanks: data.selectedRanks,
      feedback: data.feedback,
    });
  });

export const updateRoomAdvisorMetaFn = createServerFn({ method: "POST" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        sessionId: z.string().uuid(),
        clientName: z.string().max(120).nullable().optional(),
        clientPhone: z.string().max(30).nullable().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = await getAdminClient();
    return updateRoomAdvisorSessionMeta(supabase, data.sessionId, {
      clientName: data.clientName,
      clientPhone: data.clientPhone,
    });
  });

export const listMyRoomAdvisorSessionsFn = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ guestSessionId: z.string().uuid().optional() }).parse(input ?? {}),
  )
  .handler(async ({ data, context }) => {
    const supabase = await getAdminClient();
    return listRoomAdvisorSessions(supabase, {
      userId: context.userId ?? null,
      guestSessionId: data.guestSessionId ?? null,
    });
  });

export const listAdminRoomAdvisorSessionsFn = createServerFn({ method: "GET" })
  .middleware([optionalSupabaseAuth])
  .handler(async ({ context }) => {
    if (!context.userId) throw new Error("Unauthorized");
    await requireAdmin(context.userId);
    const supabase = await getAdminClient();
    return listRoomAdvisorSessions(supabase, { admin: true });
  });
