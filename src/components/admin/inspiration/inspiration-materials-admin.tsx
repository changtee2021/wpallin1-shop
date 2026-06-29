import { Link } from "@tanstack/react-router";
import { ExternalLink, ImageIcon, Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildInspirationMaterials } from "@/lib/inspiration-materials";
import type {
  InspirationMaterialAdminDto,
  InspirationMaterialType,
  InspirationRoomDto,
} from "@/types/api/inspiration";

type Props = {
  rooms: InspirationRoomDto[];
  dbMaterials: InspirationMaterialAdminDto[];
  loading: boolean;
  onSeed?: () => void;
  seeding?: boolean;
};

const TYPE_LABELS: Record<InspirationMaterialType, string> = {
  fabric: "ผ้า",
  style: "สไตล์จีบ",
  rail: "รางม่าน",
  blind: "มู่ลี่",
};

export function InspirationMaterialsAdmin({
  rooms,
  dbMaterials,
  loading,
  onSeed,
  seeding,
}: Props) {
  const materials = useMemo(
    () => buildInspirationMaterials(rooms, dbMaterials),
    [rooms, dbMaterials],
  );

  const dbMaterialIdBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const material of dbMaterials) map.set(material.slug, material.id);
    return map;
  }, [dbMaterials]);

  const roomIdBySlug = useMemo(() => {
    const map = new Map<string, string>();
    for (const room of rooms) map.set(room.slug, room.id);
    return map;
  }, [rooms]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link to="/admin/inspiration/materials/$id" params={{ id: "new" }}>
            <Plus className="size-4" />
            เพิ่มวัสดุ
          </Link>
        </Button>
        {onSeed ? (
          <Button
            type="button"
            variant="outline"
            disabled={seeding}
            onClick={onSeed}
          >
            <Sparkles className="size-4" />
            {seeding ? "กำลัง seed…" : "Seed จาก hotspot"}
          </Button>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">กำลังโหลด…</p>
      ) : !materials.length ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <ImageIcon className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              ยังไม่มีวัสดุ — เพิ่มใหม่หรือ seed จาก hotspot
            </p>
            <Button asChild>
              <Link to="/admin/inspiration">ไปภาพห้อง</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.map((material) => {
            const dbId = dbMaterialIdBySlug.get(material.slug);
            return (
              <Card key={material.slug} className="overflow-hidden">
                <img
                  src={material.imageUrl}
                  alt={material.label}
                  className="aspect-square w-full object-cover"
                />
                <CardContent className="space-y-3 p-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{material.label}</p>
                      <Badge variant="secondary">
                        {TYPE_LABELS[material.materialType]}
                      </Badge>
                      {material.isDbManaged ? (
                        <Badge variant="outline">DB</Badge>
                      ) : (
                        <Badge variant="outline">Auto</Badge>
                      )}
                    </div>
                    {material.caption ? (
                      <p className="text-xs text-muted-foreground">
                        {material.caption}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                      ใช้ใน {material.roomCount} ภาพ
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {dbId ? (
                      <Button size="sm" variant="default" asChild>
                        <Link
                          to="/admin/inspiration/materials/$id"
                          params={{ id: dbId }}
                        >
                          แก้ไข
                        </Link>
                      </Button>
                    ) : (
                      material.roomSlugs.slice(0, 1).map((slug) => {
                        const roomId = roomIdBySlug.get(slug);
                        if (!roomId) return null;
                        return (
                          <Button
                            key={slug}
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <Link
                              to="/admin/inspiration/rooms/$id"
                              params={{ id: roomId }}
                            >
                              แก้ไข hotspot
                            </Link>
                          </Button>
                        );
                      })
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <a
                        href={`/inspiration/materials/${material.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        หน้าร้าน
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
