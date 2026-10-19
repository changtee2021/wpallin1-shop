import { createFileRoute } from "@tanstack/react-router";

import { AboutView } from "@/components/storefront/about/about-view";
import { pageHead } from "@/lib/seo";
import { bi } from "@/lib/bi";
import { PAGE_META } from "@/lib/page-meta";

export const Route = createFileRoute("/_store/about")({
  head: ({ match }) =>
    pageHead({
      locale: match.context.locale,
      title: bi(match.context.locale ?? "th", PAGE_META.about.title),
      description: bi(
        match.context.locale ?? "th",
        PAGE_META.about.description,
      ),
      path: "/about",
      image: "/brand/factory-1.webp",
    }),
  component: AboutPage,
});

function AboutPage() {
  return <AboutView />;
}
