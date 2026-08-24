import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";

import { ProductImage } from "@/components/storefront/product-image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ListErrorState,
  ListNoResultsState,
} from "@/components/ui/list-query-state";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { useT } from "@/i18n";
import { fetchPublicProducts } from "@/lib/api.functions";
import { cn } from "@/lib/utils";
import type { ProductPublicDto } from "@/types/api/products";

type SearchStatus = "idle" | "loading" | "success" | "error";

export function HeaderSearch({
  triggerClassName,
}: {
  triggerClassName?: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductPublicDto[]>([]);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (!q) {
      setResults([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    const timer = window.setTimeout(() => {
      void fetchPublicProducts({
        data: { search: q, pageSize: 8, sortBy: "created_at", sortDir: "desc" },
      })
        .then((page) => {
          if (cancelled) return;
          setResults(page.data);
          setStatus("success");
        })
        .catch(() => {
          if (cancelled) return;
          setResults([]);
          setStatus("error");
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query, retryCount]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setStatus("idle");
  }

  function goToKeywordPage(keyword: string) {
    const q = keyword.trim();
    close();
    void router.navigate({
      to: "/shop",
      search: { search: q || undefined },
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    goToKeywordPage(query);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setOpen(true);
        else close();
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("rounded-full", triggerClassName)}
          aria-label={t("common.search")}
        >
          <Search className="size-5" aria-hidden />
        </Button>
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm" />
        <DialogPrimitive.Content
          className="fixed inset-x-4 top-[12%] z-50 mx-auto w-auto max-w-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:inset-x-auto sm:left-1/2 sm:w-full sm:-translate-x-1/2"
          aria-describedby={undefined}
        >
          <div className="mb-2 flex justify-end">
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                size="icon"
                className="size-11 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 sm:size-10"
                aria-label={t("search.close")}
              >
                <X className="size-5" aria-hidden />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
            <DialogTitle className="sr-only">{t("search.title")}</DialogTitle>
            <form
              onSubmit={onSubmit}
              className="flex items-center gap-1 border-b px-2 sm:px-3"
            >
              <label htmlFor={inputId} className="sr-only">
                {t("search.title")}
              </label>
              <Search
                className="ml-2 size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <input
                id={inputId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("search.placeholder")}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent py-4 pl-2 pr-1 text-base text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none"
              />
              {query.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mr-1 size-11 shrink-0 rounded-full text-muted-foreground hover:text-foreground sm:size-9"
                  aria-label={t("search.clear")}
                  onClick={() => setQuery("")}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              ) : null}
            </form>

            <div className="max-h-[60vh] overflow-y-auto p-2">
              {status === "idle" ? (
                <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                  {t("search.hint")}
                </p>
              ) : null}

              {status === "loading" ? (
                <ul className="flex flex-col gap-1" aria-busy="true">
                  {Array.from({ length: 4 }, (_, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                    >
                      <Skeleton className="size-11 shrink-0 rounded-lg" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}

              {status === "error" ? (
                <ListErrorState
                  message={t("search.error")}
                  onRetry={() => setRetryCount((count) => count + 1)}
                  className="border-0 bg-transparent py-8"
                />
              ) : null}

              {status === "success" && results.length === 0 ? (
                <ListNoResultsState
                  message={`${t("search.noResults")} “${query.trim()}”`}
                  onClear={() => goToKeywordPage(query)}
                  clearLabel={t("search.seeAll")}
                  className="border-0 bg-transparent py-8"
                />
              ) : null}

              {status === "success" && results.length > 0 ? (
                <>
                  <ul className="flex flex-col gap-1">
                    {results.map((product, index) => (
                      <li key={product.id}>
                        <Link
                          to="/products/$slug"
                          params={{ slug: product.slug }}
                          onClick={close}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                            index === 0 && "bg-muted/50",
                          )}
                        >
                          <span className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              showLabel={false}
                            />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {product.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {product.categoryName ?? t("search.product")}
                              {" · "}
                              <Price amount={product.retailPrice} />
                            </span>
                          </span>
                          <span className="shrink-0 rounded-full bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            {t("search.product")}
                          </span>
                          <ArrowRight
                            className="size-3.5 shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => goToKeywordPage(query)}
                    className="mt-1 flex min-h-11 w-full items-center justify-center gap-1 rounded-xl px-3 text-sm font-medium text-primary hover:bg-primary/5"
                  >
                    {t("search.seeAll")} “{query.trim()}”
                    <ArrowRight className="size-3.5" aria-hidden />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
