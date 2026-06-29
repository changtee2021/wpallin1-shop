/** Escape special chars for PostgREST ilike patterns. */
export function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/** Thai/EN synonym groups for curtain/blind domain search. */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  มินิมอล: ["minimal", "minimalist", "เรียบ", "สะอาด", "simple"],
  minimal: ["มินิมอล", "minimalist", "เรียบ"],
  minimalist: ["มินิมอล", "minimal", "เรียบ"],
  ม่าน: ["curtain", "curtains", "ผ้าม่าน"],
  curtain: ["ม่าน", "ผ้าม่าน", "curtains"],
  curtains: ["ม่าน", "ผ้าม่าน"],
  มู่ลี่: ["blind", "blinds", "roller", "ม้วน"],
  blind: ["มู่ลี่", "blinds"],
  blinds: ["มู่ลี่"],
  กันแสง: ["blackout", "ทึบแสง", "opacity"],
  blackout: ["กันแสง", "ทึบแสง"],
  โมเดิร์น: ["modern", "contemporary"],
  modern: ["โมเดิร์น"],
  ครีม: ["cream", "beige", "เบจ"],
  cream: ["ครีม", "beige"],
  beige: ["ครีม", "เบจ", "cream"],
  เบจ: ["beige", "cream", "ครีม"],
  ขาว: ["white", "สีขาว"],
  white: ["ขาว", "สีขาว"],
  เทา: ["grey", "gray", "charcoal"],
  grey: ["เทา"],
  gray: ["เทา"],
  ลินิน: ["linen"],
  linen: ["ลินิน"],
  wave: ["wave", "Wave"],
  zebra: ["Zebra", "zebra"],
  ราง: ["rail", "track", "รางม่าน"],
  rail: ["ราง", "track"],
  track: ["ราง", "rail"],
  มอเตอร์: ["motor", "motorized", "remote"],
  motorized: ["มอเตอร์", "motor"],
};

/** Category keyword → slug mapping for fallback intent parsing. */
export const CATEGORY_KEYWORDS: Record<string, string> = {
  ม่าน: "curtains",
  ผ้าม่าน: "curtains",
  curtain: "curtains",
  curtains: "curtains",
  มู่ลี่: "roller-blinds",
  blind: "roller-blinds",
  blinds: "roller-blinds",
  roller: "roller-blinds",
  zebra: "zebra-blinds",
  ราง: "curtain-rails",
  rail: "curtain-rails",
  track: "curtain-rails",
  อุปกรณ์: "accessories",
  accessory: "accessories",
  accessories: "accessories",
  สำเร็จรูป: "ready-made",
  "ready-made": "ready-made",
};

export function expandSearchTerms(query: string): string[] {
  const raw = query.trim();
  if (!raw) return [];

  const tokens = raw
    .split(/[\s,]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const terms = new Set<string>([raw]);
  for (const token of tokens) {
    terms.add(token);
    const lower = token.toLowerCase();
    terms.add(lower);
    const syns = SEARCH_SYNONYMS[token] ?? SEARCH_SYNONYMS[lower];
    if (syns) {
      for (const s of syns) terms.add(s);
    }
  }
  return [...terms];
}

export function buildProductSearchOrClause(terms: string[]): string {
  const unique = [...new Set(terms.map((t) => t.trim()).filter(Boolean))];
  if (!unique.length) return "";

  const clauses: string[] = [];
  for (const term of unique) {
    const safe = escapeIlike(term);
    clauses.push(`name.ilike.%${safe}%`);
    clauses.push(`sku.ilike.%${safe}%`);
    clauses.push(`slug.ilike.%${safe}%`);
    clauses.push(`description.ilike.%${safe}%`);
  }
  return [...new Set(clauses)].join(",");
}

export function inferCategoryFromQuery(query: string): string | undefined {
  const lower = query.toLowerCase();
  for (const [keyword, slug] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword.toLowerCase())) return slug;
  }
  return undefined;
}

/** Extract max price from Thai/EN budget phrases. */
export function extractMaxPrice(query: string): number | undefined {
  const patterns = [
    /(?:ไม่เกิน|งบ|budget|under|max|≤|<=)\s*([0-9,]+)/i,
    /([0-9,]+)\s*(?:บาท|baht|thb)/i,
  ];
  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match?.[1]) {
      const n = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return undefined;
}

export function extractMinPrice(query: string): number | undefined {
  const match = query.match(
    /(?:ตั้งแต่|อย่างน้อย|min|≥|>=|มากกว่า)\s*([0-9,]+)/i,
  );
  if (match?.[1]) {
    const n = Number(match[1].replace(/,/g, ""));
    if (Number.isFinite(n) && n > 0) return n;
  }
  return undefined;
}
