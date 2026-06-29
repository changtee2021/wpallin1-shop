import { createFileRoute } from "@tanstack/react-router";

import { CustomProjectsPanel } from "@/components/admin/custom/custom-projects-rules";

export const Route = createFileRoute("/admin/custom/projects")({
  component: AdminCustomProjectsPage,
});

function AdminCustomProjectsPage() {
  return <CustomProjectsPanel />;
}
