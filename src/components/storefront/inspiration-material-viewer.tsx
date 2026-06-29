import { Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { InspirationMaterialSpecPanel } from "@/components/storefront/inspiration-material-spec-panel";
import { InspirationMaterialCard } from "@/components/storefront/inspiration-material-card";
import { InspirationRoomCard } from "@/components/storefront/inspiration-room-card";
import { ContactSalesButton } from "@/components/storefront/contact-sales-button";
import { InspirationShareButton } from "@/components/storefront/inspiration-share-button";
import { WishlistButton } from "@/components/storefront/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/i18n";
import { buildConfiguratorSearchFromHotspot } from "@/lib/configurator-share";
import {
  buildMaterialGalleryImages,
  buildMaterialSpecRows,
} from "@/lib/inspiration-material-detail";
import {
  resolveMaterialProfile,
  type FabricPublicDto,
} from "@/lib/inspiration-material-profiles";
import { cn } from "@/lib/utils";
import type {
  InspirationMaterialDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

type Props = {
  material: InspirationMaterialDto;
  rooms: InspirationRoomDto[];
  similarMaterials: InspirationMaterialDto[];
  fabric?: FabricPublicDto | null;
};

export function InspirationMaterialViewer({
  material,
  rooms,
  similarMaterials,
  fabric = null,
}: Props) {
  const { t, locale } = useT();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const usedRooms = rooms.filter((room) =>
    material.roomSlugs.includes(room.slug),
  );
  const isReady = Boolean(material.productSlug || material.productId);
  const configuratorSearch = buildConfiguratorSearchFromHotspot({
    fabricId: material.fabricId,
    configuratorProductType: material.configuratorProductType,
  });

  const galleryImages = useMemo(
    () => buildMaterialGalleryImages(material, rooms),
    [material, rooms],
  );
  const specRows = useMemo(() => buildMaterialSpecRows(material), [material]);
  const materialProfile = useMemo(
    () =>
      resolveMaterialProfile({
        material,
        fabric,
        usedRooms,
      }),
    [material, fabric, usedRooms],
  );
  const [activeImageId, setActiveImageId] = useState(
    galleryImages[0]?.id ?? "",
  );

  const activeImage =
    galleryImages.find((image) => image.id === activeImageId) ??
    galleryImages[0];

  async function handleAddToCart() {
    if (!material.productId) return;
    setAdding(true);
    try {
      await addItem(material.productId, 1);
      toast.success(t("inspiration.material.viewer.addedToCart"));
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : t("inspiration.material.viewer.addFailed"),
      );
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-8">
      <Button variant="ghost" size="sm" className="-ml-2 w-fit" asChild>
        <Link to="/inspiration" search={{ tab: "materials" }}>
          <ArrowLeft className="size-4" />
          {t("inspiration.material.viewer.back")}
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-black/5">
            {activeImage ? (
              <img
                src={activeImage.imageUrl}
                alt={activeImage.label}
                className="aspect-square w-full object-cover"
              />
            ) : null}
          </div>

          {galleryImages.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {galleryImages.map((image) => {
                const active = image.id === activeImage?.id;
                return (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setActiveImageId(image.id)}
                    className={cn(
                      "overflow-hidden rounded-lg ring-1 ring-black/5 transition",
                      active && "ring-2 ring-primary/50",
                    )}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.label}
                      className="aspect-square w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24">
          <div>
            <Badge variant="secondary" className="text-xs">
              {t(`inspiration.materials.type.${material.materialType}`)}
            </Badge>
            <h1 className="mt-2 text-xl font-bold text-foreground sm:text-2xl">
              {material.label}
            </h1>
            {material.caption ? (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {material.caption}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <InspirationShareButton
              slug={material.slug}
              title={material.label}
              sharePath={`/inspiration/materials/${material.slug}`}
              variant="outline"
            />
            <ContactSalesButton />
            {material.productId ? (
              <WishlistButton
                productId={material.productId}
                variant="outline"
              />
            ) : null}
          </div>

          <InspirationMaterialSpecPanel
            profile={materialProfile}
            basicSpecRows={specRows}
            locale={locale}
            t={t}
            title={t("inspiration.material.viewer.specTable")}
            labels={{
              composition: t("inspiration.material.viewer.composition"),
              texture: t("inspiration.material.viewer.texture"),
              certifications: t("inspiration.material.viewer.certifications"),
              suitableRooms: t("inspiration.material.viewer.suitableRooms"),
              bestFor: t("inspiration.material.viewer.bestFor"),
              care: t("inspiration.material.viewer.care"),
              observedRooms: t("inspiration.material.viewer.observedRooms"),
            }}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button className="flex-1 bg-accent hover:bg-accent/90" asChild>
              <Link to="/configurator" search={configuratorSearch}>
                {t("inspiration.material.viewer.customize")}
              </Link>
            </Button>
            {isReady && material.productSlug ? (
              <Button variant="outline" className="flex-1" asChild>
                <Link
                  to="/products/$slug"
                  params={{ slug: material.productSlug }}
                >
                  {t("inspiration.material.viewer.viewProduct")}
                </Link>
              </Button>
            ) : null}
            {material.productId ? (
              <Button
                type="button"
                variant="outline"
                className="flex-1 gap-1"
                disabled={adding}
                onClick={() => void handleAddToCart()}
              >
                <ShoppingCart className="size-4" />
                {t("inspiration.material.viewer.addToCart")}
              </Button>
            ) : null}
          </div>
        </aside>
      </div>

      <section className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">
          {t("inspiration.material.viewer.usedInRooms")}
        </h2>
        {usedRooms.length > 0 ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
            {usedRooms.map((room, index) => (
              <InspirationRoomCard
                key={room.id}
                room={room}
                imageAspect={index % 3 === 0 ? "tall" : "default"}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("inspiration.material.viewer.emptyRooms")}
          </p>
        )}
      </section>

      {similarMaterials.length > 0 ? (
        <section className="space-y-4 border-t border-border pt-8">
          <h2 className="text-lg font-semibold">
            {t("inspiration.material.viewer.similar")}
          </h2>
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 lg:gap-4">
            {similarMaterials.map((item) => (
              <InspirationMaterialCard key={item.slug} material={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
