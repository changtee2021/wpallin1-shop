import { fetchProductBySlug } from "@/lib/api.functions";
import type { InspirationRoomDto } from "@/types/api/inspiration";
import type { ProductType } from "@/types/api/products";

type ResolvedProduct = {
  id: string;
  name: string;
  productType: ProductType;
  imageUrl: string | null;
};

/** Fill product fields on hotspots that only have productSlug (fallback data). */
export async function enrichInspirationRoomProducts(
  room: InspirationRoomDto,
): Promise<InspirationRoomDto> {
  const slugs = [
    ...new Set(
      room.hotspots
        .filter((h) => h.productSlug)
        .map((h) => h.productSlug as string),
    ),
  ];

  if (!slugs.length) return room;

  const resolved = await Promise.all(
    slugs.map(async (slug) => {
      const product = await fetchProductBySlug({ data: { slug } }).catch(
        () => null,
      );
      return product
        ? ([
            slug,
            {
              id: product.id,
              name: product.name,
              productType: product.productType,
              imageUrl: product.imageUrl,
            },
          ] as const)
        : null;
    }),
  );

  const slugToProduct = new Map(
    resolved.filter(
      (entry): entry is readonly [string, ResolvedProduct] => entry != null,
    ),
  );

  if (!slugToProduct.size) return room;

  return {
    ...room,
    hotspots: room.hotspots.map((hotspot) => {
      if (!hotspot.productSlug) return hotspot;
      const product = slugToProduct.get(hotspot.productSlug);
      if (!product) return hotspot;
      return {
        ...hotspot,
        productId: hotspot.productId ?? product.id,
        productName: hotspot.productName ?? product.name,
        productImageUrl: hotspot.productImageUrl ?? product.imageUrl,
        productType: hotspot.productType ?? product.productType,
      };
    }),
  };
}
