import { useCallback, useEffect, useState } from "react";

import {
  incrementInspirationViewFn,
  toggleInspirationRoomLikeFn,
} from "@/lib/api.functions";
import {
  bumpLocalView,
  getInspirationVisitorId,
  getLocalEngagementCounts,
  hasViewedInspirationSession,
  markInspirationViewedSession,
  readInspirationLikedIds,
  toggleLocalLike,
} from "@/lib/inspiration-engagement-local";

export function useInspirationEngagement(
  roomId: string,
  base: { viewCount: number; likeCount: number },
) {
  const [counts, setCounts] = useState(() =>
    getLocalEngagementCounts(roomId, base),
  );
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setCounts(getLocalEngagementCounts(roomId, base));
    setLiked(readInspirationLikedIds().has(roomId));
  }, [roomId, base.viewCount, base.likeCount]);

  const recordView = useCallback(async () => {
    if (hasViewedInspirationSession(roomId)) return;
    markInspirationViewedSession(roomId);
    bumpLocalView(roomId);
    setCounts((current) => ({ ...current, viewCount: current.viewCount + 1 }));

    try {
      const result = await incrementInspirationViewFn({
        data: { roomId },
      });
      setCounts((current) => ({ ...current, viewCount: result.viewCount }));
    } catch {
      // keep optimistic local count
    }
  }, [roomId]);

  const toggleLike = useCallback(async () => {
    const visitorId = getInspirationVisitorId();
    const nowLiked = toggleLocalLike(roomId);
    setLiked(nowLiked);
    setCounts((current) => ({
      ...current,
      likeCount: current.likeCount + (nowLiked ? 1 : -1),
    }));

    try {
      const result = await toggleInspirationRoomLikeFn({
        data: { roomId, visitorId },
      });
      setLiked(result.liked);
      setCounts((current) => ({ ...current, likeCount: result.likeCount }));
    } catch {
      // keep optimistic local count
    }

    return nowLiked;
  }, [roomId]);

  return { counts, liked, recordView, toggleLike };
}

/** Card grid: sync counts without view tracking */
export function useInspirationCardEngagement(
  roomId: string,
  base: { viewCount: number; likeCount: number },
) {
  const [counts, setCounts] = useState(() =>
    getLocalEngagementCounts(roomId, base),
  );
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setCounts(getLocalEngagementCounts(roomId, base));
    setLiked(readInspirationLikedIds().has(roomId));
  }, [roomId, base.viewCount, base.likeCount]);

  const toggleLike = useCallback(async () => {
    const visitorId = getInspirationVisitorId();
    const nowLiked = toggleLocalLike(roomId);
    setLiked(nowLiked);
    setCounts((current) => ({
      ...current,
      likeCount: current.likeCount + (nowLiked ? 1 : -1),
    }));

    try {
      const result = await toggleInspirationRoomLikeFn({
        data: { roomId, visitorId },
      });
      setLiked(result.liked);
      setCounts((current) => ({ ...current, likeCount: result.likeCount }));
    } catch {
      // keep optimistic
    }

    return nowLiked;
  }, [roomId]);

  return { counts, liked, toggleLike };
}
