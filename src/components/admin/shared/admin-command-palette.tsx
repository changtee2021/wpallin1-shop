import { useRouter } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useAuth } from "@/hooks/use-auth";
import { searchAdminQuickNavFn } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminQuickNavResult } from "@/services/admin-nav.service";

const EMPTY_RESULT: AdminQuickNavResult = {
  pages: [],
  products: [],
  orders: [],
  rooms: [],
};

export function AdminCommandPalette() {
  const router = useRouter();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AdminQuickNavResult>(EMPTY_RESULT);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const runSearch = useCallback(
    async (value: string) => {
      setLoading(true);
      try {
        const data = await searchAdminQuickNavFn({
          data: { query: value },
          ...authOpts,
        });
        setResult(data);
      } catch {
        setResult(EMPTY_RESULT);
      } finally {
        setLoading(false);
      }
    },
    [authOpts],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResult(EMPTY_RESULT);
      return;
    }
    void runSearch("");
  }, [open, runSearch]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void runSearch(query);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, open, runSearch]);

  function goTo(href: string) {
    setOpen(false);
    void router.history.push(href);
  }

  const hasResults =
    result.pages.length +
      result.products.length +
      result.orders.length +
      result.rooms.length >
    0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="ค้นหาหน้า สินค้า ออเดอร์ ภาพ Inspiration… (Ctrl+K)"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {!loading && !hasResults ? (
          <CommandEmpty>ไม่พบผลลัพธ์</CommandEmpty>
        ) : null}

        {result.pages.length ? (
          <CommandGroup heading="หน้าแอดมิน">
            {result.pages.map((page) => (
              <CommandItem
                key={page.href}
                value={`${page.label} ${page.keywords}`}
                onSelect={() => goTo(page.href)}
              >
                <LayoutDashboard />
                {page.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ) : null}

        {result.products.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="สินค้า">
              {result.products.map((product) => (
                <CommandItem
                  key={product.id}
                  value={`${product.label} ${product.subtitle ?? ""}`}
                  onSelect={() => goTo(product.href)}
                >
                  <Package />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{product.label}</span>
                    {product.subtitle ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {product.subtitle}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {result.orders.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="คำสั่งซื้อ">
              {result.orders.map((order) => (
                <CommandItem
                  key={order.id}
                  value={`${order.label} ${order.subtitle ?? ""}`}
                  onSelect={() => goTo(order.href)}
                >
                  <ShoppingBag />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{order.label}</span>
                    {order.subtitle ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {order.subtitle}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {result.rooms.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="ภาพ Inspiration">
              {result.rooms.map((room) => (
                <CommandItem
                  key={room.id}
                  value={`${room.label} ${room.subtitle ?? ""}`}
                  onSelect={() => goTo(room.href)}
                >
                  <Sparkles />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate">{room.label}</span>
                    {room.subtitle ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {room.subtitle}
                      </span>
                    ) : null}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
            <Search className="size-4 animate-pulse" />
            กำลังค้นหา…
          </div>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
