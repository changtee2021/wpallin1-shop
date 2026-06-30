import { Link, useNavigate } from "@tanstack/react-router";
import {
  ClipboardPaste,
  Copy,
  Minus,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import {
  createShareableOrderLink,
  fetchPriceList,
  lookupProductBySku,
  quickOrderBySku,
  reorderFromOrder,
  searchOrderProducts,
} from "@/lib/api.functions";
import { getOrCreateCartSessionId } from "@/lib/cart-session";
import {
  buildOrderShareUrl,
  parseOrderLinesText,
  type OrderLineInput,
} from "@/lib/order-share";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { formatPrice } from "@/lib/format";

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

type OrderPadProps = {
  initialLines?: OrderLineInput[];
  recentOrder?: {
    id: string;
    orderNumber: string;
  } | null;
};

export function OrderPad({ initialLines, recentOrder }: OrderPadProps) {
  const { session } = useAuth();
  const { refresh } = useCart();
  const navigate = useNavigate();
  const authOpts = authServerFnOptions(session);

  const [lines, setLines] = useState<OrderPadLine[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductLookup[]>([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadedInitial = useRef(false);

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);

  const addProduct = useCallback((product: ProductLookup, qty = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        return prev.map((l) =>
          l.productId === product.id
            ? { ...l, qty: l.qty + Math.max(qty, product.moq) }
            : l,
        );
      }
      return [
        ...prev,
        {
          key: product.id,
          productId: product.id,
          sku: product.sku,
          name: product.name,
          qty: Math.max(qty, product.moq),
          unitPrice: product.price,
          moq: product.moq,
          stock: product.stock,
          imageUrl: product.imageUrl,
        },
      ];
    });
    setQuery("");
    setSuggestions([]);
  }, []);

  const resolveSku = useCallback(
    async (sku: string, qty: number) => {
      const product = await lookupProductBySku({
        data: { sku },
        ...authOpts,
      });
      if (!product) {
        toast.error(`ไม่พบ SKU: ${sku}`);
        return false;
      }
      addProduct(product, qty);
      return true;
    },
    [addProduct, authOpts],
  );

  const loadInitialLines = useCallback(
    async (inputs: OrderLineInput[]) => {
      for (const line of inputs) {
        await resolveSku(line.sku, line.qty);
      }
    },
    [resolveSku],
  );

  useEffect(() => {
    if (loadedInitial.current || !initialLines?.length) return;
    loadedInitial.current = true;
    void loadInitialLines(initialLines);
  }, [initialLines, loadInitialLines]);

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

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    const exact = suggestions.find(
      (s) => s.sku.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exact) {
      addProduct(exact);
      return;
    }
    if (suggestions.length === 1) {
      addProduct(suggestions[0]);
      return;
    }
    setSubmitting(true);
    try {
      await resolveSku(trimmed, 1);
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePasteSubmit() {
    const parsed = parseOrderLinesText(pasteText);
    if (!parsed.length) {
      toast.error("ไม่พบรายการ SKU");
      return;
    }
    setSubmitting(true);
    let ok = 0;
    for (const line of parsed) {
      if (await resolveSku(line.sku, line.qty)) ok++;
    }
    setSubmitting(false);
    if (ok) {
      setPasteOpen(false);
      setPasteText("");
      toast.success(`เพิ่ม ${ok} รายการ`);
    }
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

  async function handleConfirm() {
    if (!lines.length) {
      toast.error("ยังไม่มีรายการสั่ง");
      return;
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
      await refresh();
      toast.success("เพิ่มลงตะกร้าแล้ว — ไปชำระเงิน");
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReorder() {
    if (!recentOrder) return;
    setReordering(true);
    try {
      await reorderFromOrder({
        data: {
          orderId: recentOrder.id,
          sessionId: getOrCreateCartSessionId(),
        },
        ...authOpts,
      });
      await refresh();
      toast.success("เพิ่มรายการจากออเดอร์ล่าสุดแล้ว");
      void navigate({ to: "/cart/summary" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setReordering(false);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={downloading}
          onClick={() => void handleDownloadPriceList()}
        >
          {downloading ? "กำลังสร้าง..." : "ดาวน์โหลด Price List"}
        </Button>
        {recentOrder ? (
          <Button
            variant="outline"
            size="sm"
            disabled={reordering}
            onClick={() => void handleReorder()}
          >
            {reordering
              ? "กำลังเพิ่ม..."
              : `สั่งซ้ำ ${recentOrder.orderNumber}`}
          </Button>
        ) : null}
        {lines.length > 0 ? (
          <>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="mr-1.5 size-4" />
              ลิงก์ด่วน
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={creatingLink}
              onClick={() => void handleCreateShareLink()}
            >
              {creatingLink ? "กำลังสร้าง..." : "สร้างลิงก์สั่ง"}
            </Button>
          </>
        ) : null}
      </div>

      <Card>
        <CardContent className="p-4">
          <form
            onSubmit={(e) => void handleSearchSubmit(e)}
            className="relative"
          >
            <Label htmlFor="order-sku-search" className="sr-only">
              ค้นหา SKU
            </Label>
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
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
                          onClick={() => addProduct(s)}
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
                {searching ? (
                  <p className="absolute mt-1 text-xs text-muted-foreground">
                    กำลังค้นหา...
                  </p>
                ) : null}
              </div>
              <Button type="submit" disabled={submitting || !query.trim()}>
                เพิ่ม
              </Button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPasteOpen((v) => !v)}
            >
              <ClipboardPaste className="mr-1.5 size-4" />
              วางจาก clipboard
            </Button>
            {lines.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setLines([])}
              >
                ล้างทั้งหมด
              </Button>
            ) : null}
          </div>

          {pasteOpen ? (
            <div className="mt-3 space-y-2 rounded-lg border bg-muted/30 p-3">
              <Label>วางรายการ SKU (ทีละบรรทัด)</Label>
              <Textarea
                rows={5}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder={"WR-CUR-001,2\nWR-ROL-001 x 5"}
              />
              <Button
                size="sm"
                disabled={submitting}
                onClick={() => void handlePasteSubmit()}
              >
                เพิ่มรายการ
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {lines.length > 0 ? (
        <Card>
          <CardContent className="divide-y p-0">
            {lines.map((line) => (
              <div
                key={line.key}
                className="flex flex-wrap items-center gap-3 p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{line.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {line.sku}
                    {line.moq > 1 ? ` · MOQ ${line.moq}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateQty(line.productId, -1)}
                    disabled={line.qty <= line.moq}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {line.qty}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => updateQty(line.productId, 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
                <p className="w-24 text-right font-semibold text-accent">
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
            ))}
            <div className="flex items-center justify-between p-4">
              <p className="text-sm text-muted-foreground">
                {lines.length} รายการ
              </p>
              <p className="text-lg font-bold">รวม {formatPrice(subtotal)}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>พิมพ์ SKU หรือวางรายการจาก LINE เพื่อเริ่มสั่ง</p>
            {!session ? (
              <p className="mt-2 text-sm">
                <Link to="/login" className="text-primary underline">
                  เข้าสู่ระบบ
                </Link>{" "}
                เพื่อดูราคาตัวแทน
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <Button
        size="lg"
        className="w-full bg-primary hover:bg-primary/90"
        disabled={submitting || lines.length === 0}
        onClick={() => void handleConfirm()}
      >
        {submitting
          ? "กำลังเพิ่ม..."
          : `ยืนยัน → ไปชำระเงิน${subtotal > 0 ? ` (${formatPrice(subtotal)})` : ""}`}
      </Button>
    </div>
  );
}
