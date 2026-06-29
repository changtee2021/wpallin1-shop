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
import { fetchAdminFabrics } from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminFabricRow } from "@/services/admin-custom.service";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  value: string | null;
  label: string | null;
  onChange: (fabricId: string | null, fabricName: string | null) => void;
  placeholder?: string;
};

export function AdminFabricPicker({
  authOpts,
  value,
  label,
  onChange,
  placeholder = "เลือกผ้า",
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [fabrics, setFabrics] = useState<AdminFabricRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authOpts.headers?.Authorization) return;
    setLoading(true);
    void fetchAdminFabrics(authOpts)
      .then((data) => setFabrics(data.fabrics))
      .finally(() => setLoading(false));
  }, [authOpts]);

  const selected = useMemo(
    () => fabrics.find((fabric) => fabric.id === value) ?? null,
    [fabrics, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fabrics.slice(0, 50);
    return fabrics
      .filter(
        (fabric) =>
          fabric.name.toLowerCase().includes(q) ||
          fabric.code.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [fabrics, query]);

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
          placeholder="ค้นหาผ้า…"
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
            ไม่เลือกผ้า
          </button>
          {loading ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">
              กำลังโหลด…
            </p>
          ) : !filtered.length ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">ไม่พบผ้า</p>
          ) : (
            filtered.map((fabric) => (
              <button
                key={fabric.id}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted",
                  value === fabric.id && "bg-muted",
                )}
                onClick={() => {
                  onChange(fabric.id, fabric.name);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "size-4 shrink-0",
                    value === fabric.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="truncate">{fabric.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {fabric.code}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
