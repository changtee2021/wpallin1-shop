/** URL-safe slug from title; falls back to catalog id prefix for Thai-only titles. */
export function slugifyCatalogTitle(title: string, catalogId?: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base.length >= 2) {
    return catalogId ? `${base}-${catalogId.slice(0, 8)}` : base;
  }

  return catalogId
    ? `catalog-${catalogId.slice(0, 8)}`
    : `catalog-${Date.now()}`;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}
