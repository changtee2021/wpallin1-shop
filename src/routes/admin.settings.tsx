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
import {
  fetchAdminSettings,
  fetchChatSettingsAdmin,
  saveAdminSettings,
  saveChatSettingsAdmin,
} from "@/lib/api.functions";
import { Switch } from "@/components/ui/switch";
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
  const [chatAiEnabled, setChatAiEnabled] = useState(true);
  const [chatMinSpend, setChatMinSpend] = useState(100_000);
  const [chatDailyQuota, setChatDailyQuota] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingChat, setSavingChat] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchAdminSettings(authServerFnOptions(session)),
      fetchChatSettingsAdmin(authServerFnOptions(session)),
    ])
      .then(([s, chat]) => {
        if (s.bankAccounts.length) setBankAccounts(s.bankAccounts);
        setShippingFee(s.shippingFee);
        setChatAiEnabled(chat.aiEnabled);
        setChatMinSpend(chat.minLifetimeSpend);
        setChatDailyQuota(chat.dailyQuota);
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

  async function handleSaveChat(e: React.FormEvent) {
    e.preventDefault();
    setSavingChat(true);
    try {
      await saveChatSettingsAdmin({
        data: {
          aiEnabled: chatAiEnabled,
          minLifetimeSpend: chatMinSpend,
          dailyQuota: chatDailyQuota,
        },
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกการตั้งค่าแชทแล้ว");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSavingChat(false);
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

      <form
        onSubmit={(e) => void handleSaveChat(e)}
        className="mt-8 max-w-xl space-y-6"
      >
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">แชท & AI</h2>
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="chat-ai-enabled">เปิดใช้ AI แชท</Label>
              <Switch
                id="chat-ai-enabled"
                checked={chatAiEnabled}
                onCheckedChange={setChatAiEnabled}
              />
            </div>
            <div>
              <Label htmlFor="chat-min-spend">
                ยอดซื้อสะสมขั้นต่ำสำหรับ AI (บาท)
              </Label>
              <Input
                id="chat-min-spend"
                type="number"
                min={0}
                value={chatMinSpend}
                onChange={(e) => setChatMinSpend(Number(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="chat-daily-quota">
                โควต้า AI ต่อวัน (ข้อความ)
              </Label>
              <Input
                id="chat-daily-quota"
                type="number"
                min={1}
                max={200}
                value={chatDailyQuota}
                onChange={(e) => setChatDailyQuota(Number(e.target.value))}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              ตัวแทนจำหน่ายใช้ AI ได้เสมอ (ภายใต้โควต้ารายวัน)
            </p>
          </CardContent>
        </Card>
        <Button type="submit" disabled={savingChat}>
          {savingChat ? "กำลังบันทึก..." : "บันทึกการตั้งค่าแชท"}
        </Button>
      </form>
    </div>
  );
}
