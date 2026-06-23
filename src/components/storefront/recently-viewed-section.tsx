import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { formatPrice } from "@/lib/format";
import {
  getRecentlyViewed,
  type RecentlyViewedItem,
} from "@/lib/recently-viewed";

export function RecentlyViewedSection() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed().slice(0, 6));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="mb-4 text-lg font-semibold">ดูล่าสุด</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to="/products/$slug"
            params={{ slug: item.slug }}
            className="group rounded-lg border bg-white p-2 transition hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden rounded-md bg-muted/30">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="size-full object-cover"
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium group-hover:text-primary">
              {item.name}
            </p>
            <p className="text-xs text-accent">{formatPrice(item.retailPrice)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
