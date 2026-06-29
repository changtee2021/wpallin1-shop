import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminSettings, saveAdminSettings } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import { useT } from "@/i18n";
import type { BankAccountDto } from "@/types/api/orders";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const { t } = useT();
  const { session } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccountDto[]>([
    { bank: "KBANK", account_no: "", account_name: "" },
  ]);
  const [shippingFee, setShippingFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchAdminSettings(authServerFnOptions(session))
      .then((s) => {
        if (s.bankAccounts.length) setBankAccounts(s.bankAccounts);
        setShippingFee(s.shippingFee);
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAdminSettings({
        data: { bankAccounts, shippingFee },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกการตั้งค่าแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  function updateBank(
    index: number,
    field: keyof BankAccountDto,
    value: string,
  ) {
    setBankAccounts((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  }

  if (loading) {
    return <PageLoading variant="form" />;
  }

  return (
    <div>
      <PageHeader
        title={t("admin.settings")}
        description="ตั้งค่าระบบร้านค้า"
      />
      <form onSubmit={(e) => void handleSave(e)} className="max-w-xl space-y-6">
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">บัญชีโอนเงิน</h2>
            {bankAccounts.map((b, i) => (
              <div key={i} className="grid gap-3 rounded border p-3">
                <div>
                  <Label>ธนาคาร</Label>
                  <Input
                    value={b.bank}
                    onChange={(e) => updateBank(i, "bank", e.target.value)}
                  />
                </div>
                <div>
                  <Label>เลขบัญชี</Label>
                  <Input
                    value={b.account_no}
                    onChange={(e) =>
                      updateBank(i, "account_no", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label>ชื่อบัญชี</Label>
                  <Input
                    value={b.account_name}
                    onChange={(e) =>
                      updateBank(i, "account_name", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setBankAccounts((prev) => [
                  ...prev,
                  { bank: "", account_no: "", account_name: "" },
                ])
              }
            >
              + เพิ่มบัญชี
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-4">
            <Label htmlFor="shipping">ค่าจัดส่งเริ่มต้น (บาท)</Label>
            <Input
              id="shipping"
              type="number"
              min={0}
              value={shippingFee}
              onChange={(e) => setShippingFee(Number(e.target.value))}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "กำลังบันทึก..." : "บันทึก"}
        </Button>
      </form>
    </div>
  );
}
