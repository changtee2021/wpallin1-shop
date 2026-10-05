import { createFileRoute, redirect } from "@tanstack/react-router";

import { SectionHeading } from "@/components/brand/section-heading";
import { JOURNAL_POSTS } from "@/data/journal";
import { useBi } from "@/lib/bi";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_store/journal")({
  beforeLoad: () => {
    if (JOURNAL_POSTS.length === 0) throw redirect({ to: "/", replace: true });
  },
  head: () =>
    pageHead({
      title: "บทความ | WP ALL",
      description:
        "ไอเดียแต่งบ้าน วิธีเลือกม่านและมู่ลี่ และเรื่องราวจากโรงงาน WP ALL",
      path: "/journal",
    }),
  component: JournalPage,
});

function JournalPage() {
  const pick = useBi();

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <SectionHeading
        as="h1"
        kicker="Journal"
        title={pick({ th: "บทความ", en: "Journal" })}
      />
      <ul className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {JOURNAL_POSTS.map((post) => (
          <li key={post.slug}>
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-surface">
              <img
                src={post.cover}
                alt=""
                loading="lazy"
                className="size-full object-cover"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {post.publishedAt}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{pick(post.title)}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {pick(post.excerpt)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
