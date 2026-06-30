import { Link } from "@tanstack/react-router";

import { InspirationRoomCard } from "@/components/storefront/inspiration-room-card";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n";
import type { InspirationRoomDto } from "@/types/api/inspiration";

type Props = {
  rooms: InspirationRoomDto[];
};

export function HomeInspirationPreview({ rooms }: Props) {
  const { t } = useT();
  const preview = rooms.slice(0, 6);

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-primary sm:text-2xl">
            {t("inspiration.home.title")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {t("inspiration.home.body")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-accent text-accent" asChild>
            <Link to="/inspiration">{t("inspiration.home.cta")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/room-advisor">AI ที่ปรึกษาห้อง</Link>
          </Button>
        </div>
      </div>

      {preview.length > 0 ? (
        <div className="columns-2 gap-3 sm:columns-3 md:gap-4">
          {preview.map((room) => (
            <InspirationRoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed bg-muted/20 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            {t("inspiration.home.empty")}
          </p>
          <Button className="mt-4 bg-accent hover:bg-accent/90" asChild>
            <Link to="/configurator">{t("home.cta.secondary")}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
