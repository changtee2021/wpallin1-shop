import { createFileRoute, notFound } from "@tanstack/react-router";

import { InspirationMaterialViewer } from "@/components/storefront/inspiration-material-viewer";
import { resolveInspirationRooms } from "@/data/inspiration-fallback";
import {
  fetchPublicInspirationMaterials,
  fetchPublicInspirationRooms,
} from "@/lib/api.functions";
import { getAdminClient } from "@/lib/server-fns/_shared";
import {
  buildInspirationMaterials,
  findInspirationMaterialBySlug,
  findSimilarInspirationMaterials,
} from "@/lib/inspiration-materials";
import { getPublicFabricById } from "@/services/inspiration-material.service";

export const Route = createFileRoute("/_store/inspiration/materials/$slug")({
  loader: async ({ params }) => {
    const [rooms, dbMaterials] = await Promise.all([
      resolveInspirationRooms(() => fetchPublicInspirationRooms()),
      fetchPublicInspirationMaterials().catch(() => []),
    ]);
    const materials = buildInspirationMaterials(rooms, dbMaterials);
    const material = findInspirationMaterialBySlug(materials, params.slug);

    if (!material) throw notFound();

    const similarMaterials = findSimilarInspirationMaterials(
      material,
      materials,
    );
    const fabric = material.fabricId
      ? await getPublicFabricById(await getAdminClient(), material.fabricId)
      : null;

    return { material, rooms, similarMaterials, fabric };
  },
  component: InspirationMaterialPage,
});

function InspirationMaterialPage() {
  const { material, rooms, similarMaterials, fabric } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <InspirationMaterialViewer
        material={material}
        rooms={rooms}
        similarMaterials={similarMaterials}
        fabric={fabric}
      />
    </div>
  );
}
