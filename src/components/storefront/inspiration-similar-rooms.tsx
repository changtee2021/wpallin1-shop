import { InspirationRoomCard } from "@/components/storefront/inspiration-room-card";
import type { InspirationRoomDto } from "@/types/api/inspiration";

type Props = {
  rooms: InspirationRoomDto[];
};

export function InspirationSimilarRooms({ rooms }: Props) {
  if (!rooms.length) return null;

  return (
    <section className="border-t border-border pt-10">
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
        {rooms.map((room, index) => (
          <InspirationRoomCard
            key={room.id}
            room={room}
            imageAspect={index % 3 === 0 ? "tall" : "default"}
          />
        ))}
      </div>
    </section>
  );
}
