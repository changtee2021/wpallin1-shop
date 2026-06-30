import { createFileRoute, notFound } from "@tanstack/react-router";

import { RoomAdvisorSharePage } from "@/components/room-advisor/room-advisor-share-page";
import { fetchRoomAdvisorByTokenFn } from "@/lib/api.functions";

export const Route = createFileRoute("/_store/room-advisor/share/$token")({
  loader: async ({ params }) => {
    try {
      const session = await fetchRoomAdvisorByTokenFn({
        data: { token: params.token },
      });
      return { session, token: params.token };
    } catch {
      throw notFound();
    }
  },
  component: RoomAdvisorShareRoutePage,
});

function RoomAdvisorShareRoutePage() {
  const { session, token } = Route.useLoaderData();
  return <RoomAdvisorSharePage session={session} token={token} />;
}
