import { createFileRoute, notFound } from "@tanstack/react-router";

import { InspirationRoomViewer } from "@/components/storefront/inspiration-room-viewer";
import {
  getInspirationFallbackBySlug,
  resolveInspirationRooms,
} from "@/data/inspiration-fallback";
import {
  fetchPublicInspirationRoomBySlug,
  fetchPublicInspirationRooms,
} from "@/lib/api.functions";
import { enrichInspirationRoomProducts } from "@/lib/inspiration-enrich";
import { findSimilarInspirationRooms } from "@/lib/inspiration-similar";

export const Route = createFileRoute("/_store/inspiration/$slug")({
  loader: async ({ params }) => {
    const allRooms = await resolveInspirationRooms(() =>
      fetchPublicInspirationRooms(),
    );

    const fromApi = await fetchPublicInspirationRoomBySlug({
      data: { slug: params.slug },
    }).catch(() => null);

    const room =
      fromApi ??
      allRooms.find((r) => r.slug === params.slug) ??
      getInspirationFallbackBySlug(params.slug);

    if (!room) throw notFound();

    const enriched = await enrichInspirationRoomProducts(room);
    const similarRooms = findSimilarInspirationRooms(enriched, allRooms);

    return { room: enriched, similarRooms };
  },
  component: InspirationRoomPage,
});

function InspirationRoomPage() {
  const { room, similarRooms } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <InspirationRoomViewer room={room} similarRooms={similarRooms} />
    </div>
  );
}
