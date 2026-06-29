import type { SupabaseClient } from "@supabase/supabase-js";

export async function incrementInspirationView(
  supabase: SupabaseClient,
  roomId: string,
): Promise<number> {
  const { data: room, error: readError } = await supabase
    .from("inspiration_rooms")
    .select("view_count")
    .eq("id", roomId)
    .eq("status", "published")
    .maybeSingle();

  if (readError) throw new Error(readError.message);
  if (!room) return 0;

  const next = Number(room.view_count ?? 0) + 1;
  const { error: updateError } = await supabase
    .from("inspiration_rooms")
    .update({ view_count: next })
    .eq("id", roomId);

  if (updateError) throw new Error(updateError.message);
  return next;
}

export async function toggleInspirationRoomLike(
  supabase: SupabaseClient,
  roomId: string,
  visitorId: string,
): Promise<{ liked: boolean; likeCount: number }> {
  const { data: existing, error: readLikeError } = await supabase
    .from("inspiration_room_likes")
    .select("room_id")
    .eq("room_id", roomId)
    .eq("visitor_id", visitorId)
    .maybeSingle();

  if (readLikeError) throw new Error(readLikeError.message);

  const { data: room, error: roomError } = await supabase
    .from("inspiration_rooms")
    .select("like_count")
    .eq("id", roomId)
    .eq("status", "published")
    .maybeSingle();

  if (roomError) throw new Error(roomError.message);
  if (!room) return { liked: false, likeCount: 0 };

  let likeCount = Number(room.like_count ?? 0);
  let liked: boolean;

  if (existing) {
    const { error: deleteError } = await supabase
      .from("inspiration_room_likes")
      .delete()
      .eq("room_id", roomId)
      .eq("visitor_id", visitorId);
    if (deleteError) throw new Error(deleteError.message);
    likeCount = Math.max(0, likeCount - 1);
    liked = false;
  } else {
    const { error: insertError } = await supabase
      .from("inspiration_room_likes")
      .insert({ room_id: roomId, visitor_id: visitorId });
    if (insertError) throw new Error(insertError.message);
    likeCount += 1;
    liked = true;
  }

  const { error: updateError } = await supabase
    .from("inspiration_rooms")
    .update({ like_count: likeCount })
    .eq("id", roomId);

  if (updateError) throw new Error(updateError.message);
  return { liked, likeCount };
}

export async function getVisitorLikedRoomIds(
  supabase: SupabaseClient,
  visitorId: string,
  roomIds: string[],
): Promise<Set<string>> {
  if (!roomIds.length) return new Set();

  const { data, error } = await supabase
    .from("inspiration_room_likes")
    .select("room_id")
    .eq("visitor_id", visitorId)
    .in("room_id", roomIds);

  if (error) throw new Error(error.message);
  return new Set((data ?? []).map((row) => row.room_id as string));
}
