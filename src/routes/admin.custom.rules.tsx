import { createFileRoute } from "@tanstack/react-router";

import { CustomRulesPanel } from "@/components/admin/custom/custom-projects-rules";

export const Route = createFileRoute("/admin/custom/rules")({
  component: AdminCustomRulesPage,
});

function AdminCustomRulesPage() {
  return <CustomRulesPanel />;
}
