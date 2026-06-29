import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Input } from "@/components/ui/input";
import { useT } from "@/i18n";

type SearchBarProps = {
  className?: string;
  defaultValue?: string;
  compact?: boolean;
};

export function SearchBar({
  className = "",
  defaultValue = "",
  compact = false,
}: SearchBarProps) {
  const { t } = useT();
  const [query, setQuery] = useState(defaultValue);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    window.location.href = q
      ? `/shop?search=${encodeURIComponent(q)}`
      : "/shop";
  }

  return (
    <form onSubmit={onSubmit} className={`relative flex-1 ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("common.search")}
        className={`border-primary/20 bg-white pl-10 ${compact ? "h-9" : "h-10"}`}
      />
    </form>
  );
}

export function SearchBarLink({ to }: { to: string }) {
  return (
    <Link
      to={to}
      search={{ search: undefined }}
      className="flex h-9 flex-1 items-center gap-2 rounded-md border border-primary/20 bg-white px-3 text-sm text-muted-foreground md:hidden"
    >
      <Search className="size-4 shrink-0" />
      <span>ค้นหาสินค้า...</span>
    </Link>
  );
}
