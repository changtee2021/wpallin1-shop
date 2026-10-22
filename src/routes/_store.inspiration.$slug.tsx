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
import { absoluteUrl } from "@/lib/public-url";
import { pageHead } from "@/lib/seo";

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
  head: ({ loaderData, match }) => {
    if (!loaderData?.room) return {};
    const { room } = loaderData;
    const description = (room.description ?? room.title)
      .replace(/\s+/g, " ")
      .slice(0, 160);
    return pageHead({
      locale: match.context.locale,
      title: `${room.title} | WP ALL`,
      description: description || room.title,
      path: `/inspiration/${room.slug}`,
      image: room.imageUrl,
      type: "article",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: room.title,
        description,
        image: absoluteUrl(room.imageUrl),
        author: { "@type": "Organization", name: "WP ALL" },
      },
    });
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
