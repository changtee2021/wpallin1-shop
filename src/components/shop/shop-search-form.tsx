import { useLocation, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";

function currentShopQuery(search: unknown): string {
  if (search && typeof search === "object" && "search" in search) {
    const value = (search as { search?: unknown }).search;
    return typeof value === "string" ? value : "";
  }
  return "";
}

export function ShopSearchForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const urlQuery = pathname === "/shop" ? currentShopQuery(search) : "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  function submit(event: FormEvent) {
    event.preventDefault();
    const term = query.trim();
    void navigate({
      to: "/shop",
      search: term ? { search: term } : {},
    });
  }

  return (
    <form
      role="search"
      onSubmit={submit}
      className={cn(
        "flex h-11 items-center rounded-full bg-white pl-4 text-foreground shadow-sm",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="ค้นหาสินค้า ชื่อ หรือ SKU"
        aria-label="ค้นหาสินค้า"
        enterKeyHint="search"
        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
          aria-label="ล้างคำค้นหา"
        >
          <X className="size-4" />
        </button>
      ) : null}
      <button
        type="submit"
        className="m-1 h-9 shrink-0 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
      >
        ค้นหา
      </button>
    </form>
  );
}
