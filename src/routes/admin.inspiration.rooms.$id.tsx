import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { InspirationRoomEditor } from "@/components/admin/inspiration/inspiration-room-editor";
import { useAuth } from "@/hooks/use-auth";
import {
  emptyRoomEditorState,
  roomToEditorState,
} from "@/lib/inspiration-admin";
import { fetchAdminInspirationRoomById } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { RoomEditorState } from "@/lib/inspiration-admin";

export const Route = createFileRoute("/admin/inspiration/rooms/$id")({
  component: AdminInspirationRoomEditorPage,
});

function AdminInspirationRoomEditorPage() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [loading, setLoading] = useState(!isNew);
  const [initial, setInitial] = useState<RoomEditorState | null>(
    isNew ? emptyRoomEditorState() : null,
  );

  useEffect(() => {
    if (isNew) {
      setInitial(emptyRoomEditorState());
      setLoading(false);
      return;
    }

    setLoading(true);
    void fetchAdminInspirationRoomById({ data: { id }, ...authOpts })
      .then((room) => {
        if (!room) {
          toast.error("ไม่พบภาพ");
          void navigate({ to: "/admin/inspiration" });
          return;
        }
        setInitial(roomToEditorState(room));
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
        title={isNew ? "เพิ่มภาพแรงบันดาลใจ" : "แก้ไขภาพ"}
        description="วางจุด tag บนรูปและเชื่อมสินค้า/ผ้า"
      />
      <InspirationRoomEditor
        key={initial.id ?? "new"}
        authOpts={authOpts}
        accessToken={session?.access_token}
        initial={initial}
        isNew={isNew}
        onSaved={(roomId) => {
          if (isNew) {
            void navigate({
              to: "/admin/inspiration/rooms/$id",
              params: { id: roomId },
              replace: true,
            });
          }
        }}
      />
    </div>
  );
}
