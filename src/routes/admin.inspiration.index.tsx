import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { InspirationAdminDashboard } from "@/components/admin/inspiration/inspiration-admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminInspirationRooms } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  InspirationRoomDto,
  InspirationRoomStatus,
} from "@/types/api/inspiration";

type InspirationSearch = {
  status?: InspirationRoomStatus;
};

export const Route = createFileRoute("/admin/inspiration/")({
  validateSearch: (search: Record<string, unknown>): InspirationSearch => {
    const status = search.status;
    if (status === "draft" || status === "published" || status === "archived") {
      return { status };
    }
    return {};
  },
  component: AdminInspirationIndexPage,
});

function AdminInspirationIndexPage() {
  const { status: initialStatus } = Route.useSearch();
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [rooms, setRooms] = useState<InspirationRoomDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminInspirationRooms(authOpts);
      setRooms(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <InspirationAdminDashboard
      authOpts={authOpts}
      rooms={rooms}
      loading={loading}
      onRefresh={load}
      initialStatusFilter={initialStatus ?? "all"}
    />
  );
}
