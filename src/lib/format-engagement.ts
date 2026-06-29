/** Compact display for view/like counts (e.g. 1.2k) */
export function formatEngagementCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 10_000) {
    const rounded = Math.round(value / 100) / 10;
    return Number.isInteger(rounded) ? `${rounded}k` : `${rounded.toFixed(1)}k`;
  }
  if (value < 1_000_000) return `${Math.round(value / 1000)}k`;
  const rounded = Math.round(value / 100_000) / 10;
  return `${rounded}m`;
}
