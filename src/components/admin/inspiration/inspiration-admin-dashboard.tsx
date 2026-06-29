import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Copy,
  Eye,
  Heart,
  ImageIcon,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminConfirm } from "@/components/admin/shared/admin-confirm-dialog";
import { AdminPreviewLink } from "@/components/admin/shared/admin-preview-link";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatEngagementCount } from "@/lib/format-engagement";
import {
  deleteAdminInspirationRoom,
  duplicateAdminInspirationRoom,
  reorderAdminInspirationRooms,
} from "@/lib/api.functions";
import type { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  InspirationRoomDto,
  InspirationRoomStatus,
} from "@/types/api/inspiration";

type AuthOpts = ReturnType<typeof authServerFnOptions>;

type Props = {
  authOpts: AuthOpts;
  rooms: InspirationRoomDto[];
  loading: boolean;
  onRefresh: () => Promise<void>;
};

const STATUS_LABELS: Record<InspirationRoomStatus, string> = {
  draft: "แบบร่าง",
  published: "เผยแพร่",
  archived: "เก็บถาวร",
};

export function InspirationAdminDashboard({
  authOpts,
  rooms,
  loading,
  onRefresh,
}: Props) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | InspirationRoomStatus
  >("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { confirm, AdminConfirmDialog } = useAdminConfirm();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rooms.filter((room) => {
      if (statusFilter !== "all" && room.status !== statusFilter) return false;
      if (!q) return true;
      return (
        room.title.toLowerCase().includes(q) ||
        room.slug.toLowerCase().includes(q) ||
        room.roomType?.toLowerCase().includes(q) ||
        room.styleTags.some((tag) => tag.toLowerCase().includes(q)) ||
        room.moodTags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [rooms, query, statusFilter]);

  const stats = useMemo(() => {
    const published = rooms.filter(
      (room) => room.status === "published",
    ).length;
    const views = rooms.reduce((sum, room) => sum + room.viewCount, 0);
    const likes = rooms.reduce((sum, room) => sum + room.likeCount, 0);
    const hotspots = rooms.reduce((sum, room) => sum + room.hotspots.length, 0);
    return { total: rooms.length, published, views, likes, hotspots };
  }, [rooms]);

  async function handleDelete(id: string) {
    if (!(await confirm({ description: "ลบภาพนี้?", destructive: true })))
      return;
    setBusyId(id);
    try {
      await deleteAdminInspirationRoom({ data: { id }, ...authOpts });
      toast.success("ลบแล้ว");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(id: string) {
    setBusyId(id);
    try {
      await duplicateAdminInspirationRoom({ data: { id }, ...authOpts });
      toast.success("คัดลอกแล้ว");
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "คัดลอกไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  async function moveRoom(id: string, direction: -1 | 1) {
    const sorted = [...rooms].sort((a, b) => a.sortOrder - b.sortOrder);
    const index = sorted.findIndex((room) => room.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= sorted.length) return;

    const next = [...sorted];
    [next[index], next[target]] = [next[target], next[index]];
    const orders = next.map((room, sortOrder) => ({ id: room.id, sortOrder }));

    setBusyId(id);
    try {
      await reorderAdminInspirationRooms({ data: { orders }, ...authOpts });
      await onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "จัดลำดับไม่สำเร็จ");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="ภาพห้องแรงบันดาลใจ"
        description="จัดการภาพ Pinterest + จุด tag สินค้า"
        actions={
          <Button asChild>
            <Link to="/admin/inspiration/rooms/$id" params={{ id: "new" }}>
              <Plus className="size-4" />
              เพิ่มภาพ
            </Link>
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "ทั้งหมด", value: stats.total },
          { label: "เผยแพร่", value: stats.published },
          { label: "ยอดวิว", value: formatEngagementCount(stats.views) },
          { label: "ไลก์", value: formatEngagementCount(stats.likes) },
          { label: "จุด tag", value: stats.hotspots },
        ].map((item) => (
          <Card key={item.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="ค้นหาชื่อ, slug, tag…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | InspirationRoomStatus) =>
            setStatusFilter(value)
          }
        >
          <SelectTrigger className="sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ทุกสถานะ</SelectItem>
            <SelectItem value="published">เผยแพร่</SelectItem>
            <SelectItem value="draft">แบบร่าง</SelectItem>
            <SelectItem value="archived">เก็บถาวร</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      ) : !filtered.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">ไม่พบภาพ</p>
            <Button asChild>
              <Link to="/admin/inspiration/rooms/$id" params={{ id: "new" }}>
                เพิ่มภาพแรก
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <img
                src={room.imageUrl}
                alt={room.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <CardContent className="space-y-3 p-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{room.title}</p>
                    <Badge variant="secondary">
                      {STATUS_LABELS[room.status]}
                    </Badge>
                    {room.isFeatured ? <Badge>เด่น</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    /inspiration/{room.slug}
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="size-3.5" />
                      {formatEngagementCount(room.viewCount)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="size-3.5" />
                      {formatEngagementCount(room.likeCount)}
                    </span>
                    <span>{room.hotspots.length} tags</span>
                  </div>
                  {room.styleTags.length || room.moodTags.length ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[...room.styleTags, ...room.moodTags]
                        .slice(0, 4)
                        .map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/admin/inspiration/rooms/$id"
                      params={{ id: room.id }}
                    >
                      <Pencil className="size-4" />
                      แก้ไข
                    </Link>
                  </Button>
                  <AdminPreviewLink
                    href={`/inspiration/${room.slug}`}
                    label="ดูตัวอย่าง"
                    className="h-8 px-3 text-xs"
                    disabled={room.status !== "published"}
                    onClick={() => {
                      if (room.status !== "published") {
                        toast.warning("เผยแพร่ภาพก่อนจึงจะดูตัวอย่างได้");
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === room.id}
                    onClick={() => void handleDuplicate(room.id)}
                  >
                    <Copy className="size-4" />
                    คัดลอก
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === room.id}
                    onClick={() => void moveRoom(room.id, -1)}
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === room.id}
                    onClick={() => void moveRoom(room.id, 1)}
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === room.id}
                    onClick={() => void handleDelete(room.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AdminConfirmDialog />
    </div>
  );
}
