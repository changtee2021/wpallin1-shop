import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import {
  emptyMaterialEditorState,
  InspirationMaterialEditor,
  materialToEditorState,
  type MaterialEditorState,
} from "@/components/admin/inspiration/inspiration-material-editor";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminInspirationMaterialById,
  fetchAdminInspirationRooms,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { InspirationRoomDto } from "@/types/api/inspiration";

export const Route = createFileRoute("/admin/inspiration/materials/$id")({
  component: AdminInspirationMaterialEditorRoute,
});

function AdminInspirationMaterialEditorRoute() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [loading, setLoading] = useState(!isNew);
  const [rooms, setRooms] = useState<InspirationRoomDto[]>([]);
  const [initial, setInitial] = useState<MaterialEditorState | null>(
    isNew ? emptyMaterialEditorState() : null,
  );

  useEffect(() => {
    void fetchAdminInspirationRooms(authOpts)
      .then(setRooms)
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "โหลดห้องไม่สำเร็จ"),
      );

    if (isNew) {
      setInitial(emptyMaterialEditorState());
      setLoading(false);
      return;
    }

    setLoading(true);
    void fetchAdminInspirationMaterialById({ data: { id }, ...authOpts })
      .then((material) => {
        if (!material) {
          toast.error("ไม่พบวัสดุ");
          void navigate({ to: "/admin/inspiration/materials" });
          return;
        }
        setInitial(materialToEditorState(material));
      })
      .catch((err) =>
        toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ"),
      )
      .finally(() => setLoading(false));
  }, [id, isNew, session?.access_token]);

  if (loading || !initial) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={isNew ? "เพิ่มวัสดุ" : "แก้ไขวัสดุ"}
        description="จัดการรูป ข้อมูล และเชื่อมภาพห้อง"
      />
      <InspirationMaterialEditor
        key={initial.id ?? "new"}
        authOpts={authOpts}
        accessToken={session?.access_token}
        initial={initial}
        isNew={isNew}
        rooms={rooms}
        onSaved={(materialId) => {
          if (isNew) {
            void navigate({
              to: "/admin/inspiration/materials/$id",
              params: { id: materialId },
              replace: true,
            });
          }
        }}
        onDeleted={() => {
          void navigate({ to: "/admin/inspiration/materials" });
        }}
      />
    </div>
  );
}
