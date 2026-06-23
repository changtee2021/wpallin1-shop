import { createFileRoute } from "@tanstack/react-router";

import { ConfiguratorWizard } from "@/components/configurator/configurator-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { useT } from "@/i18n";

export const Route = createFileRoute("/_store/configurator")({
  component: ConfiguratorPage,
});

function ConfiguratorPage() {
  const { t } = useT();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("configurator.title")}
        description="ออกแบบผ้าม่านตามขนาด — 6 ขั้นตอน"
      />
      <ConfiguratorWizard />
    </div>
  );
}
