import { useNavigate } from "@tanstack/react-router";
import {
  ClipboardPaste,
  Copy,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { OrderLoginCta } from "@/components/order/order-login-cta";
import { OrderShortcutsPanel } from "@/components/order/order-shortcuts-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useT } from "@/i18n";
import {
  createShareableOrderLink,
  fetchFrequentOrderSkus,
  fetchOrderDetail,
  fetchPriceList,
  quickOrderBySku,
  reorderFromOrder,
  resolveProductsBySkus,
  searchOrderProducts,
} from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import { formatPrice } from "@/lib/format";
import {
  clearOrderPadDraft,
  loadOrderPadDraft,
  orderPadDraftKey,
  saveOrderPadDraft,
} from "@/lib/order-pad-draft";
import {
  buildOrderShareUrl,
  parseOrderLinesText,
  type OrderLineInput,
} from "@/lib/order-share";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { cn } from "@/lib/utils";
import type { OrderSummaryDto } from "@/types/api/orders";

export type OrderPadLine = {
  key: string;
  productId: string;
  sku: string;
  name: string;
  qty: number;
  unitPrice: number;
  moq: number;
  stock: number;
  imageUrl: string | null;
};

type ProductLookup = {
  id: string;
  sku: string;
  name: string;
  price: number;
  moq: number;
  stock: number;
  imageUrl: string | null;
};

type FrequentSku = {
  sku: string;
  productName: string;
  lastQty: number;
  orderCount: number;
};

type OrderPadProps = {
  initialLines?: OrderLineInput[];
  recentOrders?: OrderSummaryDto[];
  ordersLoading?: boolean;
};

function parseInlineQuery(
  raw: string,
): { sku: string; qty: number } | { sku: string; qty?: undefined } {
  const trimmed = raw.trim();
  const withQty = trimmed.match(/^(\S+)\s*[,:|]\s*(\d+)\s*$/);
  if (withQty) {
    return { sku: withQty[1], qty: Math.max(1, Number(withQty[2]) || 1) };
  }
  const xQty = trimmed.match(/^(\S+)\s+x\s*(\d+)\s*$/i);
  if (xQty) {
    return { sku: xQty[1], qty: Math.max(1, Number(xQty[2]) || 1) };
  }
  return { sku: trimmed };
}

function productToLine(product: ProductLookup, qty: number): OrderPadLine {
  return {
    key: product.id,
    productId: product.id,
    sku: product.sku,
    name: product.name,
    qty: Math.max(qty, product.moq),
    unitPrice: product.price,
    moq: product.moq,
    stock: product.stock,
    imageUrl: product.imageUrl,
  };
}

function mergeLine(
  prev: OrderPadLine[],
  product: ProductLookup,
  qty: number,
): OrderPadLine[] {
  const existing = prev.find((l) => l.productId === product.id);
  if (existing) {
    return prev.map((l) =>
      l.productId === product.id
        ? {
            ...l,
            qty: l.qty + Math.max(qty, product.moq),
            unitPrice: product.price,
            stock: product.stock,
          }
        : l,
    );
  }
  return [...prev, productToLine(product, qty)];
}

function lineWarning(line: OrderPadLine): string | null {
  if (line.stock > 0 && line.qty > line.stock) {
    return `สต็อกเหลือ ${line.stock}`;
  }
  if (line.qty < line.moq) {
    return `ขั้นต่ำ ${line.moq}`;
  }
  return null;
}

export function OrderPad({
  initialLines,
  recentOrders = [],
  ordersLoading = false,
}: OrderPadProps) {
  const { t } = useT();
  const { session } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const authOpts = authServerFnOptions(session);
  const draftKey = orderPadDraftKey(session?.user?.id);

  const [lines, setLines] = useState<OrderPadLine[]>([]);
  const [query, setQuery] = useState("");
  const [qtyInput, setQtyInput] = useState("1");
  const [suggestions, setSuggestions] = useState<ProductLookup[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveProgress, setResolveProgress] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);
  const [frequentSkus, setFrequentSkus] = useState<FrequentSku[]>([]);
  const [frequentLoading, setFrequentLoading] = useState(false);
  const [pasteResolve, setPasteResolve] = useState<Map<string, boolean>>(
    new Map(),
  );
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const loadedInitial = useRef(false);
  const restoredDraft = useRef(false);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const pastePreview = useMemo(
    () => parseOrderLinesText(pasteText),
    [pasteText],
  );

  const pasteStats = useMemo(() => {
    if (!pastePreview.length || pasteResolve.size === 0) return null;
    let found = 0;
    let missing = 0;
    for (const line of pastePreview) {
      const ok = pasteResolve.get(line.sku);
      if (ok) found++;
      else if (ok === false) missing++;
    }
    return { found, missing, pending: pastePreview.length - found - missing };
  }, [pastePreview, pasteResolve]);

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => searchInputRef.current?.focus());
  }, []);

  const addProduct = useCallback(
    (product: ProductLookup, qty = 1) => {
      setLines((prev) => mergeLine(prev, product, qty));
      setQuery("");
      setQtyInput("1");
      setSuggestions([]);
      focusSearch();
    },
    [focusSearch],
  );

  const resolveAndAddLines = useCallback(
    async (
      inputs: OrderLineInput[],
      options?: { replace?: boolean; silent?: boolean },
    ) => {
      if (!inputs.length) return { added: 0, failed: [] as string[] };
      setResolving(true);
      setResolveProgress(`0/${inputs.length}`);
      try {
        const { results } = await resolveProductsBySkus({
          data: { lines: inputs },
          ...authOpts,
        });
        const failed: string[] = [];
        let added = 0;

        setLines((prev) => {
          let next = options?.replace ? [] : [...prev];
          for (const row of results) {
            if (!row.product) {
              failed.push(row.sku);
              continue;
            }
            next = mergeLine(next, row.product, row.qty);
            added++;
          }
          return next;
        });

        setResolveProgress(null);
        if (!options?.silent) {
          if (added && failed.length) {
            toast.warning(`เพิ่ม ${added} รายการ · ไม่พบ ${failed.length} SKU`);
          } else if (added) {
            toast.success(`เพิ่ม ${added} รายการ`);
          } else if (failed.length) {
            toast.error(`ไม่พบ SKU: ${failed.slice(0, 3).join(", ")}`);
          }
        }
        return { added, failed };
      } finally {
        setResolving(false);
        setResolveProgress(null);
      }
    },
    [authOpts],
  );

  useEffect(() => {
    if (loadedInitial.current || !initialLines?.length) return;
    loadedInitial.current = true;
    void resolveAndAddLines(initialLines, { silent: true });
  }, [initialLines, resolveAndAddLines]);

  useEffect(() => {
    if (
      loadedInitial.current ||
      restoredDraft.current ||
      initialLines?.length
    ) {
      return;
    }
    const draft = loadOrderPadDraft(draftKey);
    if (draft?.length) {
      restoredDraft.current = true;
      setLines(draft);
      toast.info(t("order.draftRestored"), { duration: 3000 });
    }
  }, [draftKey, initialLines?.length, t]);

  useEffect(() => {
    if (!lines.length && !restoredDraft.current) return;
    saveOrderPadDraft(draftKey, lines);
  }, [draftKey, lines]);

  useEffect(() => {
    if (!session?.access_token) {
      setFrequentSkus([]);
      setFrequentLoading(false);
      return;
    }
    let cancelled = false;
    setFrequentLoading(true);
    void fetchFrequentOrderSkus({ data: { limit: 8 }, ...authOpts })
      .then((data) => {
        if (!cancelled) setFrequentSkus(data);
      })
      .catch(() => {
        if (!cancelled) setFrequentSkus([]);
      })
      .finally(() => {
        if (!cancelled) setFrequentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [authOpts, session?.access_token]);

  useEffect(() => {
    if (!pastePreview.length) {
      setPasteResolve(new Map());
      return;
    }
    const timer = setTimeout(() => {
      void resolveProductsBySkus({
        data: { lines: pastePreview },
        ...authOpts,
      })
        .then(({ results }) => {
          const map = new Map<string, boolean>();
          for (const row of results) {
            map.set(row.sku, row.product !== null);
          }
          setPasteResolve(map);
        })
        .catch(() => setPasteResolve(new Map()));
    }, 350);
    return () => clearTimeout(timer);
  }, [pastePreview, authOpts]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setSearching(true);
      void searchOrderProducts({ data: { q: query.trim() }, ...authOpts })
        .then(setSuggestions)
        .catch(() => setSuggestions([]))
        .finally(() => setSearching(false));
    }, 250);
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current);
    };
  }, [query, authOpts]);

  async function addFromSearch() {
    const parsed = parseInlineQuery(query);
    const sku = parsed.sku;
    if (!sku) return;

    const qty = parsed.qty ?? Math.max(1, Number.parseInt(qtyInput, 10) || 1);

    if (!parsed.qty && query.includes(",") === false) {
      const exact = suggestions.find(
        (s) => s.sku.toLowerCase() === sku.toLowerCase(),
      );
      if (exact) {
        addProduct(exact, qty);
        return;
      }
      if (suggestions.length === 1) {
        addProduct(suggestions[0], qty);
        return;
      }
    }

    setSubmitting(true);
    try {
      await resolveAndAddLines([{ sku, qty }], { silent: true });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    await addFromSearch();
  }

  async function handlePasteSubmit() {
    const parsed = parseOrderLinesText(pasteText);
    if (!parsed.length) {
      toast.error("ไม่พบรายการ SKU");
      return;
    }
    const { added } = await resolveAndAddLines(parsed);
    if (added) {
      setPasteText("");
      focusSearch();
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast.error("คลิปบอร์ดว่าง");
        return;
      }
      setPasteText(text);
      toast.success("วางจากคลิปบอร์ดแล้ว");
    } catch {
      toast.error("อนุญาตการเข้าถึงคลิปบอร์ดไม่ได้");
    }
  }

  function setLineQty(productId: string, nextQty: number) {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const qty = Math.max(l.moq, nextQty);
          return { ...l, qty };
        })
        .filter((l) => l.qty > 0),
    );
  }

  function updateQty(productId: string, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => {
          if (l.productId !== productId) return l;
          const next = Math.max(l.moq, l.qty + delta);
          return { ...l, qty: next };
        })
        .filter((l) => l.qty > 0),
    );
  }

  function removeLine(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function clearAllLines() {
    setLines([]);
    clearOrderPadDraft(draftKey);
  }

  async function handleConfirm() {
    if (!lines.length) {
      toast.error("ยังไม่มีรายการสั่ง");
      return;
    }
    const warnings = lines.map(lineWarning).filter(Boolean);
    if (warnings.length) {
      toast.warning("มีรายการที่สต็อกไม่พอหรือต่ำกว่า MOQ — ตรวจสอบก่อนยืนยัน");
    }
    setSubmitting(true);
    try {
      const result = await quickOrderBySku({
        data: {
          sessionId: getOrCreateCartSessionId(),
          lines: lines.map((l) => ({ sku: l.sku, qty: l.qty })),
        },
        ...authOpts,
      });
      const failed = result.results.filter((r) => !r.ok);
      if (failed.length) {
        toast.error(failed.map((f) => `${f.sku}: ${f.message}`).join("\n"));
        return;
      }
      clearOrderPadDraft(draftKey);
      await refresh();
      toast.success("เพิ่มลงตะกร้าแล้ว — ไปชำระเงิน");
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLoadOrderToPad(orderId: string) {
    setLoadingOrderId(orderId);
    try {
      const order = await fetchOrderDetail({
        data: { orderId },
        ...authOpts,
      });
      if (!order) throw new Error("ไม่พบออเดอร์");
      const inputs = order.items
        .filter((item) => item.sku)
        .map((item) => ({ sku: item.sku!, qty: item.qty }));
      if (!inputs.length) {
        toast.error("ออเดอร์นี้ไม่มี SKU สำหรับโหลด");
        return;
      }
      await resolveAndAddLines(inputs);
      focusSearch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function handleReorder(orderId: string) {
    setLoadingOrderId(orderId);
    try {
      await reorderFromOrder({
        data: {
          orderId,
          sessionId: getOrCreateCartSessionId(),
        },
        ...authOpts,
      });
      await refresh();
      toast.success("เพิ่มรายการลงตะกร้าแล้ว");
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setLoadingOrderId(null);
    }
  }

  async function handleDownloadPriceList() {
    setDownloading(true);
    try {
      const data = await fetchPriceList(authOpts);
      const header = ["SKU", "Name", "Category", "MOQ", "Price", "Retail"].join(
        ",",
      );
      const rows = data.rows.map((r) =>
        [
          r.sku,
          `"${r.name.replace(/"/g, '""')}"`,
          r.category ?? "",
          r.moq,
          r.price,
          r.retailPrice,
        ].join(","),
      );
      const csv = [header, ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `price-list-${data.tierName}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ดาวน์โหลดไม่สำเร็จ");
    } finally {
      setDownloading(false);
    }
  }

  function handleCopyLink() {
    if (!lines.length) {
      toast.error("ยังไม่มีรายการ");
      return;
    }
    const url = buildOrderShareUrl(
      lines.map((l) => ({ sku: l.sku, qty: l.qty })),
    );
    void navigator.clipboard.writeText(url).then(() => {
      toast.success("คัดลอกลิงก์ด่วนแล้ว (URL)");
    });
  }

  async function handleCreateShareLink() {
    if (!lines.length) {
      toast.error("ยังไม่มีรายการ");
      return;
    }
    if (!session) {
      toast.error("เข้าสู่ระบบก่อนสร้างลิงก์ถาวร");
      return;
    }
    setCreatingLink(true);
    try {
      const result = await createShareableOrderLink({
        data: {
          items: lines.map((l) => ({
            productId: l.productId,
            sku: l.sku,
            productName: l.name,
            qty: l.qty,
            unitPrice: l.unitPrice,
          })),
        },
        ...authOpts,
      });
      const fullUrl = `${window.location.origin}${result.url}`;
      await navigator.clipboard.writeText(fullUrl);
      toast.success("สร้างและคัดลอกลิงก์สั่งแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "สร้างลิงก์ไม่สำเร็จ");
    } finally {
      setCreatingLink(false);
    }
  }

  const busy = submitting || resolving || loadingOrderId !== null;
  const confirmLabel =
    submitting || resolving
      ? t("order.confirmLoading")
      : lines.length > 0
        ? `${t("order.confirm")} · ${formatPrice(subtotal)} (${lines.length})`
        : t("order.confirm");

  const confirmButton = (
    <Button
      size="lg"
      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
      disabled={busy || lines.length === 0}
      onClick={() => void handleConfirm()}
    >
      {confirmLabel}
    </Button>
  );

  const lineList =
    lines.length > 0 ? (
      <Card>
        <CardHeader className="flex flex-col items-start gap-1 border-b py-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle className="text-base font-semibold">
            {t("order.lineItems").replace("{count}", String(lines.length))}
          </CardTitle>
          <p className="text-lg font-bold text-accent">
            {t("order.subtotal")} {formatPrice(subtotal)}
          </p>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {lines.map((line) => {
            const warning = lineWarning(line);
            return (
              <div
                key={line.key}
                className={cn(
                  "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
                  warning && "bg-destructive/5",
                )}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16">
                    {line.imageUrl ? (
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                        {line.sku.slice(0, 6)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium leading-snug sm:text-base">
                      {line.name}
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {line.sku}
                      {line.moq > 1 ? ` · MOQ ${line.moq}` : ""}
                      <span className="ml-1 text-foreground/70">
                        · {formatPrice(line.unitPrice)}/ชิ้น
                      </span>
                    </p>
                    {warning ? (
                      <p className="mt-1 text-xs font-medium text-destructive">
                        {warning}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 sm:shrink-0 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      onClick={() => updateQty(line.productId, -1)}
                      disabled={line.qty <= line.moq}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <Input
                      type="number"
                      min={line.moq}
                      value={line.qty}
                      onChange={(e) =>
                        setLineQty(
                          line.productId,
                          Number.parseInt(e.target.value, 10) || line.moq,
                        )
                      }
                      className="h-9 w-14 px-1 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      aria-label={t("order.qty")}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-9"
                      onClick={() => updateQty(line.productId, 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-accent">
                      {formatPrice(line.unitPrice * line.qty)}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => removeLine(line.productId)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    ) : null;

  return (
    <div className="pb-28 md:pb-0">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
        <div className="space-y-5">
          <Card>
            <CardContent className="space-y-4 p-4 sm:p-5">
              <form
                onSubmit={(e) => void handleSearchSubmit(e)}
                className="space-y-3"
              >
                <Label htmlFor="order-sku-search" className="sr-only">
                  SKU
                </Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative min-w-0 flex-1">
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={searchInputRef}
                      id="order-sku-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="พิมพ์ SKU หรือชื่อสินค้า..."
                      className="pl-9"
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && query.length >= 2 ? (
                      <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover shadow-md">
                        {suggestions.map((s) => (
                          <li key={s.id}>
                            <button
                              type="button"
                              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                              onClick={() =>
                                addProduct(
                                  s,
                                  Math.max(
                                    1,
                                    Number.parseInt(qtyInput, 10) || 1,
                                  ),
                                )
                              }
                            >
                              <span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {s.sku}
                                </span>
                                <span className="ml-2">{s.name}</span>
                              </span>
                              <span className="shrink-0 font-medium text-accent">
                                {formatPrice(s.price)}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="flex gap-2 sm:shrink-0">
                    <div className="w-24">
                      <Label htmlFor="order-qty" className="sr-only">
                        {t("order.qty")}
                      </Label>
                      <Input
                        id="order-qty"
                        type="number"
                        min={1}
                        value={qtyInput}
                        onChange={(e) => setQtyInput(e.target.value)}
                        className="h-10 text-center"
                        aria-label={t("order.qty")}
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="outline"
                      disabled={busy || !query.trim()}
                      className="min-w-[5.5rem] flex-1 sm:flex-none"
                    >
                      {t("order.add")}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("order.hint")}
                </p>
                {searching ? (
                  <p className="text-xs text-muted-foreground">กำลังค้นหา...</p>
                ) : null}
                {resolveProgress ? (
                  <p className="text-xs text-muted-foreground">
                    {t("order.resolving").replace(
                      "{progress}",
                      resolveProgress,
                    )}
                  </p>
                ) : null}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardPaste className="size-4" />
                {t("order.pasteTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 sm:p-5">
              <Textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"WR-CUR-001,2\nWR-ROL-001 x 5"}
              />
              {pastePreview.length > 0 ? (
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>
                    {t("order.pastePreview").replace(
                      "{count}",
                      String(pastePreview.length),
                    )}
                  </p>
                  {pasteStats ? (
                    <p>
                      {t("order.pasteFound")
                        .replace("{found}", String(pasteStats.found))
                        .replace("{missing}", String(pasteStats.missing))}
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void handlePasteFromClipboard()}
                >
                  {t("order.pasteFromClipboard")}
                </Button>
                <Button
                  size="sm"
                  disabled={busy || !pastePreview.length}
                  onClick={() => void handlePasteSubmit()}
                >
                  {t("order.pasteAddAll")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {!session ? <OrderLoginCta /> : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={downloading}
              onClick={() => void handleDownloadPriceList()}
            >
              {downloading ? "กำลังสร้าง..." : "Price List"}
            </Button>
            {lines.length > 0 ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleCopyLink}>
                  <Copy className="mr-1 size-3.5" />
                  ลิงก์ด่วน
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={creatingLink}
                  onClick={() => void handleCreateShareLink()}
                >
                  {creatingLink ? "..." : "ลิงก์สั่ง"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={clearAllLines}
                >
                  {t("order.clearAll")}
                </Button>
              </>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          {lineList}
          <OrderShortcutsPanel
            loggedIn={Boolean(session)}
            orders={recentOrders}
            ordersLoading={ordersLoading}
            frequentSkus={frequentSkus}
            frequentLoading={frequentLoading}
            loadingOrderId={loadingOrderId}
            resolving={resolving}
            onLoadToPad={(id) => void handleLoadOrderToPad(id)}
            onReorder={(id) => void handleReorder(id)}
            onFrequentClick={(sku, qty) =>
              void resolveAndAddLines([{ sku, qty }])
            }
          />
          <div className="hidden lg:block">{confirmButton}</div>
        </div>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 z-30 border-t bg-background/95 p-4 backdrop-blur md:hidden",
          lines.length > 0
            ? "bottom-16"
            : "pointer-events-none bottom-16 opacity-0",
        )}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {confirmButton}
      </div>
    </div>
  );
}
