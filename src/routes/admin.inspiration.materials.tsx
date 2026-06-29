import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { InspirationMaterialsAdmin } from "@/components/admin/inspiration/inspiration-materials-admin";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminInspirationMaterials,
  fetchAdminInspirationRooms,
  seedAdminInspirationMaterials,
} from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  InspirationMaterialAdminDto,
  InspirationRoomDto,
} from "@/types/api/inspiration";

export const Route = createFileRoute("/admin/inspiration/materials")({
  component: AdminInspirationMaterialsPage,
});

function AdminInspirationMaterialsPage() {
  const { session } = useAuth();
  const authOpts = authServerFnOptions(session);
  const [rooms, setRooms] = useState<InspirationRoomDto[]>([]);
  const [dbMaterials, setDbMaterials] = useState<InspirationMaterialAdminDto[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [roomData, materialData] = await Promise.all([
        fetchAdminInspirationRooms(authOpts),
        fetchAdminInspirationMaterials(authOpts),
      ]);
      setRooms(roomData);
      setDbMaterials(materialData);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [session?.access_token]);

  async function handleSeed() {
    setSeeding(true);
    try {
      const result = await seedAdminInspirationMaterials(authOpts);
      toast.success(`Seed แล้ว ${result.created} รายการ`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Seed ไม่สำเร็จ");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <InspirationMaterialsAdmin
      rooms={rooms}
      dbMaterials={dbMaterials}
      loading={loading}
      onSeed={() => void handleSeed()}
      seeding={seeding}
    />
  );
}
