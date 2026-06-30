type MockProductSource = {
  slug?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, unknown> | null;
};

/** QA / seed products — kept accessible for testing but excluded from SEO surfaces. */
export function isMockProductSource(row: MockProductSource): boolean {
  if (row.slug?.startsWith("mock-")) return true;
  if (row.tags?.includes("mock")) return true;
  if (row.metadata?.is_mock === true) return true;
  return false;
}

export function sortProductsMockLast<T extends { isMock: boolean }>(
  products: T[],
): T[] {
  return [...products].sort((a, b) => {
    if (a.isMock === b.isMock) return 0;
    return a.isMock ? 1 : -1;
  });
}
