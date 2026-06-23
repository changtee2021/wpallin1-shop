import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { submitDealerApplication } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";

export const Route = createFileRoute("/_store/dealer/register")({
  component: DealerRegisterPage,
});

function DealerRegisterPage() {
  const { session, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    taxId: "",
    contactName: user?.user_metadata?.full_name ?? "",
    contactPhone: "",
    contactEmail: user?.email ?? "",
    businessType: "",
    address: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error("กรุณาเข้าสู่ระบบก่อนสมัคร");
      return;
    }
    setSubmitting(true);
    try {
      await submitDealerApplication({
        data: form,
        ...authServerFnOptions(session),
      });
      toast.success("ส่งใบสมัครแล้ว — รออนุมัติ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <PageHeader
        title="สมัครตัวแทนจำหน่าย"
        description="กรอกใบสมัครตัวแทน — ทีมงานจะตรวจสอบภายใน 1-3 วันทำการ"
      />
      <Card>
        <CardContent className="p-6">
          <form className="space-y-4" onSubmit={(e) => void handleSubmit(e)}>
            <div>
              <Label>ชื่อบริษัท</Label>
              <Input
                required
                value={form.companyName}
                onChange={(e) =>
                  setForm({ ...form, companyName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              />
            </div>
            <div>
              <Label>ชื่อผู้ติดต่อ</Label>
              <Input
                required
                value={form.contactName}
                onChange={(e) =>
                  setForm({ ...form, contactName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>เบอร์โทร</Label>
              <Input
                required
                value={form.contactPhone}
                onChange={(e) =>
                  setForm({ ...form, contactPhone: e.target.value })
                }
              />
            </div>
            <div>
              <Label>อีเมล</Label>
              <Input
                required
                type="email"
                value={form.contactEmail}
                onChange={(e) =>
                  setForm({ ...form, contactEmail: e.target.value })
                }
              />
            </div>
            <div>
              <Label>ที่อยู่</Label>
              <Textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={submitting || !user}>
              {submitting ? "กำลังส่ง..." : "ส่งใบสมัคร"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
