import { createFileRoute } from "@tanstack/react-router";

import { ConfiguratorWizard } from "@/components/configurator/configurator-wizard";
import { PageHeader } from "@/components/layout/page-header";
import {
  configuratorSearchSchema,
  draftFromConfiguratorSearch,
} from "@/lib/configurator-share";
import { useT } from "@/i18n";
import { fetchConfiguratorCatalog } from "@/lib/api.functions";

export const Route = createFileRoute("/_store/configurator")({
  validateSearch: (search) => configuratorSearchSchema.parse(search),
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
  const search = Route.useSearch();
  const initialDraft = draftFromConfiguratorSearch(search);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader
        title={t("configurator.title")}
        description="เลือกสินค้าก่อน แล้วปรับแต่งตามต้องการ — แชร์ลิงก์ให้ช่างหรือลูกค้าเปิดแบบเดิมได้"
      />
      <ConfiguratorWizard
        initialCatalog={catalog}
        initialError={error}
        initialDraft={initialDraft}
      />
    </div>
  );
}
