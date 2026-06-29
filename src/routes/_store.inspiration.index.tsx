import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { InspirationHero } from "@/components/storefront/inspiration-hero";
import { InspirationHubTabs } from "@/components/storefront/inspiration-hub-tabs";
import { InspirationMaterialMasonryGrid } from "@/components/storefront/inspiration-material-masonry-grid";
import { InspirationMasonryGrid } from "@/components/storefront/inspiration-masonry-grid";
import { resolveInspirationRooms } from "@/data/inspiration-fallback";
import {
  fetchCategories,
  fetchPublicInspirationMaterials,
  fetchPublicInspirationRooms,
} from "@/lib/api.functions";
import { buildInspirationMaterials } from "@/lib/inspiration-materials";

const inspirationIndexSearchSchema = z.object({
  tab: z.enum(["rooms", "materials"]).optional().default("rooms"),
});

export const Route = createFileRoute("/_store/inspiration/")({
  validateSearch: (search) => inspirationIndexSearchSchema.parse(search),
  loader: async () => {
    const [rooms, categories, dbMaterials] = await Promise.all([
      resolveInspirationRooms(() => fetchPublicInspirationRooms()),
      fetchCategories(),
      fetchPublicInspirationMaterials().catch(() => []),
    ]);
    const materials = buildInspirationMaterials(rooms, dbMaterials);
    return { rooms, materials, categories };
  },
  component: InspirationIndexPage,
});

function InspirationIndexPage() {
  const { rooms, materials, categories } = Route.useLoaderData();
  const { tab } = Route.useSearch();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <InspirationHero />
      <InspirationHubTabs activeTab={tab} />
      {tab === "materials" ? (
        <InspirationMaterialMasonryGrid
          materials={materials}
          categories={categories}
        />
      ) : (
        <InspirationMasonryGrid rooms={rooms} categories={categories} />
      )}
    </div>
  );
}
