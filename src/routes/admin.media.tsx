import { createFileRoute } from "@tanstack/react-router";
import { Copy, ExternalLink, ImageIcon, Loader2, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import {
  ADMIN_IMAGE_ACCEPT,
  validateAdminImageFile,
} from "@/lib/admin-image-upload";
import { fetchAdminMediaAssets } from "@/lib/api.functions";
import { prepareFileForUpload } from "@/lib/media-compress";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { AdminMediaAssetDto } from "@/services/admin-media.service";

export const Route = createFileRoute("/admin/media")({
  component: AdminMediaPage,
});

function AdminMediaPage() {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const inputRef = useRef<HTMLInputElement>(null);
  const [assets, setAssets] = useState<AdminMediaAssetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [folder, setFolder] = useState("general");
  const [filter, setFilter] = useState("");

  async function loadAssets() {
    setLoading(true);
    try {
      const data = await fetchAdminMediaAssets({ data: {}, ...authOpts });
      setAssets(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAssets();
  }, [session?.access_token]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (asset) =>
        (asset.label ?? "").toLowerCase().includes(q) ||
        asset.folder.toLowerCase().includes(q) ||
        asset.url.toLowerCase().includes(q),
    );
  }, [assets, filter]);

  async function handleUpload(file: File) {
    if (!session?.access_token) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }
    const validationError = validateAdminImageFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setProgress(0);
    try {
      const prepared = await prepareFileForUpload(file);
      const formData = new FormData();
      formData.append("file", prepared);
      formData.append("folder", folder);
      formData.append("label", file.name);

      const xhr = new XMLHttpRequest();
      await new Promise<void>((resolve, reject) => {
        xhr.open("POST", "/api/v1/admin-media");
        xhr.setRequestHeader("Authorization", `Bearer ${session.access_token}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const json = JSON.parse(xhr.responseText) as {
              ok?: boolean;
              error?: string;
            };
            if (xhr.status >= 200 && xhr.status < 300 && json.ok) {
              resolve();
              return;
            }
            reject(new Error(json.error ?? "อัปโหลดไม่สำเร็จ"));
          } catch {
            reject(new Error("อัปโหลดไม่สำเร็จ"));
          }
        };
        xhr.onerror = () => reject(new Error("อัปโหลดไม่สำเร็จ"));
        xhr.send(formData);
      });

      toast.success("อัปโหลดแล้ว");
      await loadAssets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("คัดลอก URL แล้ว");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="คลังรูป"
        description="อัปโหลดและคัดลอก URL ใช้ในแบนเนอร์ Inspiration และสินค้า"
      />

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="media-folder">โฟลเดอร์</Label>
              <Input
                id="media-folder"
                value={folder}
                placeholder="general"
                onChange={(event) => setFolder(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media-filter">ค้นหา</Label>
              <Input
                id="media-filter"
                value={filter}
                placeholder="ชื่อ / โฟลเดอร์ / URL"
                onChange={(event) => setFilter(event.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              อัปโหลดรูป
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ADMIN_IMAGE_ACCEPT}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleUpload(file);
                event.target.value = "";
              }}
            />
          </div>
          {uploading ? <Progress value={progress} className="h-2" /> : null}
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      ) : !filtered.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ยังไม่มีรูปในคลัง</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <img
                src={asset.url}
                alt={asset.label ?? ""}
                className="aspect-square w-full object-cover"
              />
              <CardContent className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {asset.label ?? "ไม่มีชื่อ"}
                  </p>
                  <Badge variant="secondary">{asset.folder}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void copyUrl(asset.url)}
                  >
                    <Copy className="size-4" />
                    คัดลอก URL
                  </Button>
                  <Button type="button" size="sm" variant="outline" asChild>
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      เปิด
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
