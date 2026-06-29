import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { InspirationAdminDashboard } from "@/components/admin/inspiration/inspiration-admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminInspirationRooms } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type { InspirationRoomDto } from "@/types/api/inspiration";

export const Route = createFileRoute("/admin/inspiration/")({
  component: AdminInspirationIndexPage,
});

function AdminInspirationIndexPage() {
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
    />
  );
}
