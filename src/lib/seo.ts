import { absoluteUrl } from "@/lib/public-url";

type PageHeadInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown>;
};

/** Per-page title, description, canonical and Open Graph tags for brand pages. */
export function pageHead({
  title,
  description,
  path,
  image,
  type = "website",
  jsonLd,
}: PageHeadInput) {
  const url = absoluteUrl(path);
  const imageUrl = image ? absoluteUrl(image) : undefined;

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      ...(imageUrl
        ? [
            { property: "og:image", content: imageUrl },
            { name: "twitter:image", content: imageUrl },
          ]
        : []),
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd
      ? [{ type: "application/ld+json", children: JSON.stringify(jsonLd) }]
      : [],
  };
}
