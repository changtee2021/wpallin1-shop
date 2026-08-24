import { cn } from "@/lib/utils";
import { useT } from "@/i18n";

type GalleryItem = {
  image: string;
  label: string;
};

const GALLERY_ITEMS: GalleryItem[] = [
  { image: "/home/gallery-roller-blind.png", label: "ม่านม้วน" },
  { image: "/home/gallery-zebra-blind.png", label: "ม่านปรับแสง" },
  { image: "/home/gallery-wood-blind.png", label: "มู่ลี่ไม้" },
  { image: "/home/gallery-aluminum-blind.png", label: "มู่ลี่อลูมิเนียม" },
  { image: "/home/gallery-room-divider.png", label: "ฉากกั้นห้อง" },
  { image: "/home/gallery-pleated-curtain.png", label: "ผ้าม่านจีบ" },
];

const OFFSETS = ["mt-0", "mt-9", "mt-3", "mt-11", "mt-1", "mt-6"];

export function HomeGalleryStrip() {
  const { t } = useT();
  const track = [...GALLERY_ITEMS, ...GALLERY_ITEMS];

  return (
    <section className="overflow-hidden bg-muted/30 py-8 sm:py-10">
      <div className="mx-auto mb-6 max-w-2xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-lg font-bold text-primary sm:text-xl">
          {t("home.gallery.title")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("home.gallery.subtitle")}
        </p>
      </div>

      <div className="home-gallery-track gap-4 pl-4 sm:gap-5 sm:pl-6 lg:pl-8">
        {track.map((item, i) => (
          <figure
            key={`${item.label}-${i}`}
            className={cn(
              "w-[10.5rem] shrink-0 sm:w-[13rem] md:w-[15rem]",
              OFFSETS[i % OFFSETS.length],
            )}
          >
            <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
              <img
                src={item.image}
                alt={item.label}
                loading="lazy"
                decoding="async"
                className="aspect-[2/3] w-full object-cover"
              />
            </div>
            <figcaption className="mt-2 text-center text-xs font-semibold text-foreground">
              {item.label}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
