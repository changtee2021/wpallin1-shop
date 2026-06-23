import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  adminApproveCreditOrder,
  adminRecordCreditPayment,
  adminRejectCreditOrder,
  adminUpsertCreditAccount,
  fetchAdminCreditAccounts,
  fetchAdminCreditInvoices,
  fetchAdminPendingCreditOrders,
} from "@/lib/api.functions";
import { formatDate, formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  CreditAccountDto,
  CreditInvoiceDto,
  PendingCreditOrderDto,
} from "@/services/credit.service";

export const Route = createFileRoute("/admin/credit")({
  component: AdminCreditPage,
});

function AdminCreditPage() {
  const { session } = useAuth();
  const [accounts, setAccounts] = useState<
    Array<CreditAccountDto & { email: string | null; fullName: string | null }>
  >([]);
  const [pending, setPending] = useState<PendingCreditOrderDto[]>([]);
  const [invoices, setInvoices] = useState<CreditInvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    userId: "",
    creditLimit: 50000,
    creditTermDays: 30,
    minOrderAmount: 5000,
  });
  const [payAmounts, setPayAmounts] = useState<Record<string, string>>({});

  async function load() {
    const [acct, pend, inv] = await Promise.all([
      fetchAdminCreditAccounts(authServerFnOptions(session)),
      fetchAdminPendingCreditOrders(authServerFnOptions(session)),
      fetchAdminCreditInvoices(authServerFnOptions(session)),
    ]);
    setAccounts(acct);
    setPending(pend);
    setInvoices(inv);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [session]);

  async function handleUpsert(e: React.FormEvent) {
    e.preventDefault();
    try {
      await adminUpsertCreditAccount({
        data: form,
        ...authServerFnOptions(session),
      });
      toast.success("บันทึกวงเงินแล้ว");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    }
  }

  if (loading) {
    return <p className="text-muted-foreground">กำลังโหลด...</p>;
  }

  return (
    <div>
      <PageHeader
        title="เครดิต / วางบิล"
        description="อนุมัติคำขอเครดิต ตั้งวงเงิน และรับชำระบิล"
      />

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            รออนุมัติ ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="accounts">วงเงินลูกค้า</TabsTrigger>
          <TabsTrigger value="invoices">บิลค้างชำระ</TabsTrigger>
          <TabsTrigger value="setup">ตั้งวงเงิน</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-muted-foreground">ไม่มีคำขอรออนุมัติ</p>
          ) : (
            pending.map((o) => (
              <Card key={o.orderId}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{o.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {o.customerName} · {formatPrice(o.grandTotal)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        void adminApproveCreditOrder({
                          data: { orderId: o.orderId },
                          ...authServerFnOptions(session),
                        })
                          .then(() => {
                            toast.success("อนุมัติเครดิตแล้ว");
                            return load();
                          })
                          .catch((err) =>
                            toast.error(
                              err instanceof Error ? err.message : "ไม่สำเร็จ",
                            ),
                          )
                      }
                    >
                      อนุมัติ
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void adminRejectCreditOrder({
                          data: { orderId: o.orderId },
                          ...authServerFnOptions(session),
                        })
                          .then(() => {
                            toast.success("ปฏิเสธแล้ว");
                            return load();
                          })
                          .catch((err) =>
                            toast.error(
                              err instanceof Error ? err.message : "ไม่สำเร็จ",
                            ),
                          )
                      }
                    >
                      ปฏิเสธ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="accounts" className="space-y-3">
          {accounts.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{a.fullName ?? a.email}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">
                      วงเงิน {formatPrice(a.creditLimit)}
                    </Badge>
                    <Badge variant="outline">
                      คงเหลือ {formatPrice(a.availableCredit)}
                    </Badge>
                    <Badge variant="outline">{a.creditTermDays} วัน</Badge>
                    <Badge>{a.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">
                    {inv.orderNumber ?? inv.orderId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ครบ {formatDate(inv.dueDate)} · ค้าง{" "}
                    {formatPrice(inv.remaining)}
                  </p>
                  <Badge
                    variant={inv.daysOverdue > 0 ? "destructive" : "outline"}
                  >
                    {inv.status}
                  </Badge>
                </div>
                <div className="flex items-end gap-2">
                  <div>
                    <Label className="text-xs">รับชำระ (บาท)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={payAmounts[inv.id] ?? String(inv.remaining)}
                      onChange={(e) =>
                        setPayAmounts((prev) => ({
                          ...prev,
                          [inv.id]: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      void adminRecordCreditPayment({
                        data: {
                          invoiceId: inv.id,
                          amount: Number(payAmounts[inv.id] ?? inv.remaining),
                        },
                        ...authServerFnOptions(session),
                      })
                        .then(() => {
                          toast.success("บันทึกการชำระแล้ว");
                          return load();
                        })
                        .catch((err) =>
                          toast.error(
                            err instanceof Error ? err.message : "ไม่สำเร็จ",
                          ),
                        )
                    }
                  >
                    รับชำระ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="setup">
          <Card>
            <CardContent className="p-4">
              <form
                onSubmit={(e) => void handleUpsert(e)}
                className="grid gap-3 max-w-md"
              >
                <div>
                  <Label>User ID (UUID)</Label>
                  <Input
                    value={form.userId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, userId: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <Label>วงเงิน (บาท)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.creditLimit}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        creditLimit: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>เครดิต (วัน)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.creditTermDays}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        creditTermDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>ขั้นต่ำต่อบิล (บาท)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        minOrderAmount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <Button type="submit">บันทึกวงเงิน</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
