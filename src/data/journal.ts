import type { Bi } from "@/lib/bi";

export type JournalPost = {
  slug: string;
  title: Bi;
  excerpt: Bi;
  cover: string;
  publishedAt: string;
};

/** Empty until the team has articles ready — `/journal` redirects home while this is empty. */
export const JOURNAL_POSTS: JournalPost[] = [];
