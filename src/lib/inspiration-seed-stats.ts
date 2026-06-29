/** Baseline engagement when DB columns not migrated yet — mirrors seed migration */
export const INSPIRATION_SEED_STATS: Record<
  string,
  { viewCount: number; likeCount: number }
> = {
  "i2010001-0000-4000-8000-000000000001": { viewCount: 4120, likeCount: 538 },
  "i2010001-0000-4000-8000-000000000002": { viewCount: 3850, likeCount: 492 },
  "i2010001-0000-4000-8000-000000000003": { viewCount: 2210, likeCount: 287 },
  "i2010001-0000-4000-8000-000000000004": { viewCount: 3560, likeCount: 401 },
  "i2010001-0000-4000-8000-000000000005": { viewCount: 2890, likeCount: 624 },
  "i2010001-0000-4000-8000-000000000006": { viewCount: 1980, likeCount: 245 },
  "i2010001-0000-4000-8000-000000000007": { viewCount: 3340, likeCount: 378 },
  "i2010001-0000-4000-8000-000000000008": { viewCount: 2710, likeCount: 356 },
  "i2010001-0000-4000-8000-000000000009": { viewCount: 2980, likeCount: 445 },
  "i2010001-0000-4000-8000-000000000010": { viewCount: 2450, likeCount: 312 },
  "i2010001-0000-4000-8000-000000000011": { viewCount: 1870, likeCount: 198 },
  "i2010001-0000-4000-8000-000000000012": { viewCount: 1650, likeCount: 176 },
  "i2010001-0000-4000-8000-000000000013": { viewCount: 2230, likeCount: 234 },
  "i2010001-0000-4000-8000-000000000014": { viewCount: 1540, likeCount: 167 },
  "i2010001-0000-4000-8000-000000000015": { viewCount: 1890, likeCount: 201 },
  "i2010001-0000-4000-8000-000000000016": { viewCount: 2100, likeCount: 289 },
  "i2010001-0000-4000-8000-000000000017": { viewCount: 1420, likeCount: 145 },
  "i2010001-0000-4000-8000-000000000018": { viewCount: 2670, likeCount: 312 },
  "i2010001-0000-4000-8000-000000000019": { viewCount: 3180, likeCount: 402 },
  "i2010001-0000-4000-8000-000000000020": { viewCount: 1760, likeCount: 189 },
};

export function seedEngagementForRoom(roomId: string): {
  viewCount: number;
  likeCount: number;
} {
  return INSPIRATION_SEED_STATS[roomId] ?? { viewCount: 0, likeCount: 0 };
}
