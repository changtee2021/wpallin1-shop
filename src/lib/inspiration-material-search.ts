import type {
  InspirationMaterialDto,
  InspirationMaterialType,
} from "@/types/api/inspiration";

export const ALL_INSPIRATION_MATERIAL_TYPES: InspirationMaterialType[] = [
  "fabric",
  "style",
  "rail",
  "blind",
];

function materialSearchText(material: InspirationMaterialDto): string {
  return [
    material.label,
    material.caption,
    material.materialType,
    material.productSlug,
    material.configuratorProductType,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesInspirationMaterialSearch(
  material: InspirationMaterialDto,
  query: string,
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return materialSearchText(material).includes(needle);
}

export function matchesInspirationMaterialTypes(
  material: InspirationMaterialDto,
  materialTypes: InspirationMaterialType[],
): boolean {
  if (!materialTypes.length) return true;
  return materialTypes.includes(material.materialType);
}

export function filterInspirationMaterials(
  materials: InspirationMaterialDto[],
  query: string,
  materialTypes: InspirationMaterialType[] = [],
): InspirationMaterialDto[] {
  return materials.filter(
    (material) =>
      matchesInspirationMaterialSearch(material, query) &&
      matchesInspirationMaterialTypes(material, materialTypes),
  );
}

export function countInspirationMaterialFilters(
  materialTypes: InspirationMaterialType[],
): number {
  return materialTypes.length;
}

export function toggleMaterialTypeFilter(
  current: InspirationMaterialType[],
  type: InspirationMaterialType,
): InspirationMaterialType[] {
  return current.includes(type)
    ? current.filter((item) => item !== type)
    : [...current, type];
}
