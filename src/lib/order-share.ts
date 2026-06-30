import { z } from "zod";

export const orderSearchSchema = z.object({
  lines: z.string().optional(),
});

export type OrderSearch = z.infer<typeof orderSearchSchema>;

export type OrderLineInput = {
  sku: string;
  qty: number;
};

/** Parse `SKU:qty,SKU:qty` from URL search param */
export function parseOrderLinesParam(lines: string): OrderLineInput[] {
  return lines
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [sku, qtyRaw] = part.split(/[:|]/);
      return {
        sku: sku.trim(),
        qty: Math.max(1, Number(qtyRaw) || 1),
      };
    })
    .filter((l) => l.sku.length > 0);
}

/** Parse multi-line paste: `SKU,qty` / `SKU qty` / `SKU x qty` */
export function parseOrderLinesText(text: string): OrderLineInput[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const xMatch = line.match(/^(\S+)\s+x\s*(\d+)/i);
      if (xMatch) {
        return { sku: xMatch[1], qty: Number(xMatch[2]) || 1 };
      }
      const [sku, qtyRaw] = line.split(/[,\t ]+/);
      return { sku: sku.trim(), qty: Math.max(1, Number(qtyRaw) || 1) };
    })
    .filter((l) => l.sku.length > 0);
}

export function buildOrderShareUrl(
  lines: OrderLineInput[],
  origin = typeof window !== "undefined" ? window.location.origin : "",
): string {
  const param = lines.map((l) => `${l.sku}:${l.qty}`).join(",");
  return `${origin}/order?lines=${encodeURIComponent(param)}`;
}

export function orderLinesFromSearch(search: {
  lines?: string;
}): OrderLineInput[] {
  if (!search.lines) return [];
  return parseOrderLinesParam(search.lines);
}
