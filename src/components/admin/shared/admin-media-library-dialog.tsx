import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { fetchAdminMediaAssets } from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminMediaAssetDto } from "@/services/admin-media.service";
import { cn } from "@/lib/utils";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authOpts: AuthOpts;
  folder?: string;
  onSelect: (url: string) => void;
};

export function AdminMediaLibraryDialog({
  open,
  onOpenChange,
  authOpts,
  folder,
  onSelect,
}: Props) {
  const [assets, setAssets] = useState<AdminMediaAssetDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    void fetchAdminMediaAssets({ data: { folder }, ...authOpts })
      .then(setAssets)
      .catch((err) =>
        toast.error(
          err instanceof Error ? err.message : "โหลดคลังรูปไม่สำเร็จ",
        ),
      )
      .finally(() => setLoading(false));
  }, [open, folder, authOpts]);

  const filtered = assets.filter((asset) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      (asset.label ?? "").toLowerCase().includes(q) ||
      asset.url.toLowerCase().includes(q) ||
      asset.folder.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden">
        <DialogHeader>
          <DialogTitle>เลือกจากคลังรูป</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="ค้นหา…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        />
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            กำลังโหลด…
          </p>
        ) : !filtered.length ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            ยังไม่มีรูปในคลัง — อัปโหลดที่หน้า คลังรูป
          </p>
        ) : (
          <div className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {filtered.map((asset) => (
              <button
                key={asset.id}
                type="button"
                className={cn(
                  "group overflow-hidden rounded-lg border text-left transition hover:ring-2 hover:ring-primary",
                )}
                onClick={() => {
                  onSelect(asset.url);
                  onOpenChange(false);
                  toast.success("เลือกรูปจากคลังแล้ว");
                }}
              >
                <img
                  src={asset.url}
                  alt={asset.label ?? ""}
                  className="aspect-square w-full object-cover"
                />
                <span className="block truncate px-2 py-1 text-xs text-muted-foreground">
                  {asset.label ?? asset.folder}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            ปิด
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
