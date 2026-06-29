import { createFileRoute } from "@tanstack/react-router";

import { CustomFabricsPanel } from "@/components/admin/custom/custom-fabrics-panel";

export const Route = createFileRoute("/admin/custom/fabrics")({
  component: AdminCustomFabricsPage,
});

function AdminCustomFabricsPage() {
  return <CustomFabricsPanel />;
}
