import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchAdminProducts } from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminProductRow } from "@/services/admin-catalog.service";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  value: string | null;
  label: string | null;
  onChange: (productId: string | null, productName: string | null) => void;
  placeholder?: string;
};

export function AdminProductPicker({
  authOpts,
  value,
  label,
  onChange,
  placeholder = "เลือกสินค้า",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authOpts.headers?.Authorization) return;
    setLoading(true);
    void fetchAdminProducts(authOpts)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [authOpts]);

  const selected = useMemo(
    () => products.find((product) => product.id === value) ?? null,
    [products, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.slug.toLowerCase().includes(q) ||
          (product.sku ?? "").toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [products, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected?.name ?? label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-2"
        align="start"
      >
        <Input
          placeholder="ค้นหาสินค้า…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="mb-2"
        />
        <div className="max-h-56 overflow-y-auto">
          <button
            type="button"
            className="flex w-full rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground hover:bg-muted"
            onClick={() => {
              onChange(null, null);
              setOpen(false);
            }}
          >
            ไม่เลือกสินค้า
          </button>
          {loading ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              กำลังโหลด…
            </p>
          ) : !filtered.length ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              ไม่พบสินค้า
            </p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  value === product.id && "bg-muted",
                )}
                onClick={() => {
                  onChange(product.id, product.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === product.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{product.name}</span>
                {product.sku ? (
                  <span className="ml-auto text-xs text-muted-foreground">
                    {product.sku}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
