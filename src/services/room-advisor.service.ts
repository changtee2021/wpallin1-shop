import type { SupabaseClient } from "@supabase/supabase-js";

import { findSimilarInspirationRooms } from "@/lib/inspiration-similar";
import { analyzeRoomPhotos } from "@/lib/room-advisor-ai.server";
import { listConfiguratorCatalog } from "@/services/configurator.service";
import { listPublicInspirationRooms } from "@/services/inspiration.service";
import type {
  RoomAdvisorSessionDto,
  RoomAdvisorSessionSummaryDto,
  RoomAdvisorStatus,
  RoomAnalysisDto,
  StyleRecommendationDto,
} from "@/types/api/room-advisor";
import type { InspirationRoomDto } from "@/types/api/inspiration";

type SessionRow = {
  id: string;
  share_token: string;
  client_name: string | null;
  client_phone: string | null;
  room_type_hint: string | null;
  customer_notes: string | null;
  status: RoomAdvisorStatus;
  analysis_json: RoomAnalysisDto | null;
  recommendations_json: StyleRecommendationDto[];
  similar_room_slugs: string[];
  share_expires_at: string | null;
  customer_selected_ranks: number[];
  customer_feedback: string | null;
  customer_viewed_at: string | null;
  customer_responded_at: string | null;
  created_at: string;
  updated_at: string;
};

type PhotoRow = {
  id: string;
  public_url: string;
  room_label: string | null;
  sort_order: number;
  is_hero: boolean;
};

function mapSession(
  row: SessionRow,
  photos: PhotoRow[],
): RoomAdvisorSessionDto {
  return {
    id: row.id,
    shareToken: row.share_token,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    roomTypeHint: row.room_type_hint,
    customerNotes: row.customer_notes,
    status: row.status,
    analysis: row.analysis_json,
    recommendations: row.recommendations_json ?? [],
    similarRoomSlugs: row.similar_room_slugs ?? [],
    shareExpiresAt: row.share_expires_at,
    customerSelectedRanks: row.customer_selected_ranks ?? [],
    customerFeedback: row.customer_feedback,
    customerViewedAt: row.customer_viewed_at,
    customerRespondedAt: row.customer_responded_at,
    photos: photos.map((p) => ({
      id: p.id,
      publicUrl: p.public_url,
      roomLabel: p.room_label,
      sortOrder: p.sort_order,
      isHero: p.is_hero,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function syntheticRoomFromAnalysis(
  analysis: RoomAnalysisDto,
): InspirationRoomDto {
  return {
    id: "synthetic",
    slug: "",
    title: analysis.roomType,
    description: analysis.reasoning,
    imageUrl: "",
    roomType: analysis.roomType,
    styleTags: analysis.styleTags,
    moodTags: analysis.moodTags,
    sortOrder: 0,
    isFeatured: false,
    status: "published",
    viewCount: 0,
    likeCount: 0,
    detailImages: [],
    hotspots: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function createRoomAdvisorSession(
  supabase: SupabaseClient,
  input: {
    userId?: string | null;
    guestSessionId?: string | null;
    createdByUserId?: string | null;
    clientName?: string | null;
    clientPhone?: string | null;
    roomTypeHint?: string | null;
    customerNotes?: string | null;
    photos: Array<{
      storagePath: string;
      publicUrl: string;
      roomLabel?: string | null;
      sortOrder: number;
      isHero: boolean;
    }>;
  },
): Promise<RoomAdvisorSessionDto> {
  const { data: session, error } = await supabase
    .from("room_advisor_sessions")
    .insert({
      user_id: input.userId ?? null,
      guest_session_id: input.guestSessionId ?? null,
      created_by_user_id: input.createdByUserId ?? input.userId ?? null,
      client_name: input.clientName?.trim() || null,
      client_phone: input.clientPhone?.trim() || null,
      room_type_hint: input.roomTypeHint?.trim() || null,
      customer_notes: input.customerNotes?.trim() || null,
      status: "draft",
    })
    .select("*")
    .single();

  if (error || !session) throw new Error(error?.message ?? "สร้างเซสชันไม่สำเร็จ");

  if (input.photos.length > 0) {
    const { error: photoErr } = await supabase.from("room_advisor_photos").insert(
      input.photos.map((p) => ({
        session_id: session.id,
        storage_path: p.storagePath,
        public_url: p.publicUrl,
        room_label: p.roomLabel ?? null,
        sort_order: p.sortOrder,
        is_hero: p.isHero,
      })),
    );
    if (photoErr) throw new Error(photoErr.message);
  }

  return getRoomAdvisorSessionById(supabase, session.id);
}

export async function analyzeRoomAdvisorSession(
  supabase: SupabaseClient,
  sessionId: string,
): Promise<RoomAdvisorSessionDto> {
  const session = await getRoomAdvisorSessionById(supabase, sessionId);
  if (!session.photos.length) throw new Error("ไม่มีรูปในเซสชัน");

  await supabase
    .from("room_advisor_sessions")
    .update({ status: "analyzing" })
    .eq("id", sessionId);

  const imageUrls = session.photos
    .sort((a, b) => (a.isHero ? -1 : b.isHero ? 1 : a.sortOrder - b.sortOrder))
    .map((p) => p.publicUrl);

  const catalog = await listConfiguratorCatalog(supabase);
  const { analysis, recommendations } = await analyzeRoomPhotos(
    {
      imageUrls,
      roomTypeHint: session.roomTypeHint,
      customerNotes: session.customerNotes,
    },
    catalog,
  );

  const allRooms = await listPublicInspirationRooms(supabase);
  const similar = findSimilarInspirationRooms(
    syntheticRoomFromAnalysis(analysis),
    allRooms,
    6,
  );

  const { error } = await supabase
    .from("room_advisor_sessions")
    .update({
      status: "ready",
      analysis_json: analysis,
      recommendations_json: recommendations,
      similar_room_slugs: similar.map((r) => r.slug),
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
  await enableRoomAdvisorShare(supabase, sessionId, 7);
  return getRoomAdvisorSessionById(supabase, sessionId);
}

export async function getRoomAdvisorSessionById(
  supabase: SupabaseClient,
  id: string,
): Promise<RoomAdvisorSessionDto> {
  const { data: session, error } = await supabase
    .from("room_advisor_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!session) throw new Error("NOT_FOUND");

  const { data: photos } = await supabase
    .from("room_advisor_photos")
    .select("id, public_url, room_label, sort_order, is_hero")
    .eq("session_id", id)
    .order("sort_order");

  return mapSession(session as SessionRow, (photos ?? []) as PhotoRow[]);
}

export async function getRoomAdvisorSessionByToken(
  supabase: SupabaseClient,
  token: string,
): Promise<RoomAdvisorSessionDto | null> {
  const { data: session, error } = await supabase
    .from("room_advisor_sessions")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!session) return null;

  if (!session.share_expires_at) return null;
  if (new Date(session.share_expires_at) < new Date()) return null;

  const { data: photos } = await supabase
    .from("room_advisor_photos")
    .select("id, public_url, room_label, sort_order, is_hero")
    .eq("session_id", session.id)
    .order("sort_order");

  return mapSession(session as SessionRow, (photos ?? []) as PhotoRow[]);
}

export async function enableRoomAdvisorShare(
  supabase: SupabaseClient,
  sessionId: string,
  expiresInDays = 7,
): Promise<RoomAdvisorSessionDto> {
  const expires = new Date();
  expires.setDate(expires.getDate() + expiresInDays);

  const { error } = await supabase
    .from("room_advisor_sessions")
    .update({
      status: "shared",
      share_expires_at: expires.toISOString(),
    })
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
  return getRoomAdvisorSessionById(supabase, sessionId);
}

export async function recordRoomAdvisorCustomerView(
  supabase: SupabaseClient,
  token: string,
): Promise<void> {
  await supabase
    .from("room_advisor_sessions")
    .update({ customer_viewed_at: new Date().toISOString() })
    .eq("share_token", token)
    .is("customer_viewed_at", null);
}

export async function submitRoomAdvisorCustomerResponse(
  supabase: SupabaseClient,
  token: string,
  input: { selectedRanks: number[]; feedback?: string | null },
): Promise<RoomAdvisorSessionDto> {
  const { error } = await supabase
    .from("room_advisor_sessions")
    .update({
      status: "customer_responded",
      customer_selected_ranks: input.selectedRanks,
      customer_feedback: input.feedback?.trim() || null,
      customer_responded_at: new Date().toISOString(),
    })
    .eq("share_token", token);

  if (error) throw new Error(error.message);
  const session = await getRoomAdvisorSessionByToken(supabase, token);
  if (!session) throw new Error("NOT_FOUND");
  return session;
}

export async function listRoomAdvisorSessions(
  supabase: SupabaseClient,
  opts: { userId?: string | null; guestSessionId?: string | null; admin?: boolean },
): Promise<RoomAdvisorSessionSummaryDto[]> {
  let query = supabase
    .from("room_advisor_sessions")
    .select(
      "id, share_token, client_name, room_type_hint, status, recommendations_json, similar_room_slugs, customer_selected_ranks, share_expires_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (!opts.admin) {
    if (opts.userId) {
      query = query.or(
        `user_id.eq.${opts.userId},created_by_user_id.eq.${opts.userId}`,
      );
    } else if (opts.guestSessionId) {
      query = query.eq("guest_session_id", opts.guestSessionId);
    } else {
      return [];
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const ids = data.map((r) => r.id);
  const { data: photos } = await supabase
    .from("room_advisor_photos")
    .select("session_id, public_url, is_hero, sort_order")
    .in("session_id", ids)
    .order("sort_order");

  const heroBySession = new Map<string, string>();
  for (const p of photos ?? []) {
    const sid = p.session_id as string;
    if (!heroBySession.has(sid) || p.is_hero) {
      heroBySession.set(sid, p.public_url as string);
    }
  }

  return data.map((row) => ({
    id: row.id,
    shareToken: row.share_token,
    clientName: row.client_name,
    roomTypeHint: row.room_type_hint,
    status: row.status as RoomAdvisorStatus,
    heroPhotoUrl: heroBySession.get(row.id) ?? null,
    recommendationCount: Array.isArray(row.recommendations_json)
      ? row.recommendations_json.length
      : 0,
    customerSelectedRanks: row.customer_selected_ranks ?? [],
    shareExpiresAt: row.share_expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateRoomAdvisorSessionMeta(
  supabase: SupabaseClient,
  sessionId: string,
  input: {
    clientName?: string | null;
    clientPhone?: string | null;
  },
): Promise<RoomAdvisorSessionDto> {
  const patch: Record<string, string | null> = {};
  if (input.clientName !== undefined) patch.client_name = input.clientName?.trim() || null;
  if (input.clientPhone !== undefined) patch.client_phone = input.clientPhone?.trim() || null;

  const { error } = await supabase
    .from("room_advisor_sessions")
    .update(patch)
    .eq("id", sessionId);

  if (error) throw new Error(error.message);
  return getRoomAdvisorSessionById(supabase, sessionId);
}
