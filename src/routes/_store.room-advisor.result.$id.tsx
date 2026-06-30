import { createFileRoute, notFound } from "@tanstack/react-router";

import { RoomAdvisorResultView } from "@/components/room-advisor/room-advisor-result-view";
import { resolveInspirationRooms } from "@/data/inspiration-fallback";
import {
  fetchPublicInspirationRooms,
  fetchRoomAdvisorSessionFn,
} from "@/lib/api.functions";

export const Route = createFileRoute("/_store/room-advisor/result/$id")({
  loader: async ({ params }) => {
    let session;
    try {
      session = await fetchRoomAdvisorSessionFn({
        data: { sessionId: params.id },
      });
    } catch {
      throw notFound();
    }

    const allRooms = await resolveInspirationRooms(() =>
      fetchPublicInspirationRooms(),
    );
    const similarRooms = allRooms.filter((r) =>
      session.similarRoomSlugs.includes(r.slug),
    );

    return { session, similarRooms };
  },
  component: RoomAdvisorResultPage,
});

function RoomAdvisorResultPage() {
  const { session, similarRooms } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <RoomAdvisorResultView session={session} similarRooms={similarRooms} />
    </div>
  );
}
