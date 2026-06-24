import { createFileRoute } from "@tanstack/react-router";

import { ConfiguratorWizard } from "@/components/configurator/configurator-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { useT } from "@/i18n";
import { fetchConfiguratorCatalog } from "@/lib/api.functions";

export const Route = createFileRoute("/_store/configurator")({
  loader: async () => {
    try {
      const catalog = await fetchConfiguratorCatalog();
      return { catalog, error: null as string | null };
    } catch (err) {
      return {
        catalog: null,
        error:
          err instanceof Error ? err.message : "โหลดข้อมูล Custom ไม่สำเร็จ",
      };
    }
  },
  component: ConfiguratorPage,
});

function ConfiguratorPage() {
  const { t } = useT();
  const { catalog, error } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("configurator.title")}
        description="เลือกสินค้าก่อน แล้วปรับแต่งตามต้องการ | Pick a product, then customize"
      />
      <ConfiguratorWizard initialCatalog={catalog} initialError={error} />
    </div>
  );
}
