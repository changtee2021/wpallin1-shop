import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import {
  adminReviewCustomerDocument,
  adminUpsertCreditAccount,
  fetchAdminCreditInvoices,
  fetchAdminCustomerDocuments,
  fetchAdminMemberProfile,
  fetchAdminMembers,
} from "@/lib/api.functions";
import { customerTypeLabel, tierLabel } from "@/lib/member-tier";
import { formatPrice } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import {
  docTypeLabel,
  type CustomerDocumentDto,
} from "@/services/documents.service";
import type { CreditInvoiceDto } from "@/services/credit.service";
import type { AdminMemberDto } from "@/services/tier.service";
import type { AccountProfileDto } from "@/types/api/profile";

export const Route = createFileRoute("/admin/members/$userId")({
  component: AdminMemberDetailPage,
});

function AdminMemberDetailPage() {
  const { session } = useAuth();
  const { userId } = Route.useParams();
  const [member, setMember] = useState<AdminMemberDto | null>(null);
  const [profile, setProfile] = useState<AccountProfileDto | null>(null);
  const [docs, setDocs] = useState<CustomerDocumentDto[]>([]);
  const [invoices, setInvoices] = useState<CreditInvoiceDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditForm, setCreditForm] = useState({
    creditLimit: 50000,
    creditTermDays: 30,
    minOrderAmount: 5000,
  });

  async function load() {
    const [members, prof, docList, invList] = await Promise.all([
      fetchAdminMembers(authServerFnOptions(session)),
      fetchAdminMemberProfile({
        data: { userId },
        ...authServerFnOptions(session),
      }),
      fetchAdminCustomerDocuments({
        data: { userId },
        ...authServerFnOptions(session),
      }),
      fetchAdminCreditInvoices({
        data: { userId },
        ...authServerFnOptions(session),
      }),
    ]);
    setMember(members.find((m) => m.userId === userId) ?? null);
    setProfile(prof);
    setDocs(docList);
    setInvoices(invList);
  }

  useEffect(() => {
    void load().finally(() => setLoading(false));
  }, [session, userId]);

  if (loading) return <PageLoading variant="detail" />;
  if (!member) return <p className="text-muted-foreground">ไม่พบสมาชิก</p>;

  return (
    <div>
      <PageHeader
        title={member.fullName ?? member.email ?? "สมาชิก"}
        description={member.email ?? ""}
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/members">กลับ</Link>
          </Button>
        }
      />

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">โปรไฟล์</TabsTrigger>
          <TabsTrigger value="documents">เอกสาร</TabsTrigger>
          <TabsTrigger value="credit">เครดิต</TabsTrigger>
          <TabsTrigger value="wallet">กระเป๋า</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="space-y-2 p-4 text-sm">
              <p>
                Tier: <Badge>{tierLabel(member.memberTier)}</Badge>
              </p>
              {profile && (
                <>
                  <p>ประเภท: {customerTypeLabel(profile.customerType)}</p>
                  <p>โทร: {profile.phone ?? "—"}</p>
                  <p>
                    ยอดสะสม: {formatPrice(member.totalSpent)} ·{" "}
                    {member.orderCount} ออเดอร์
                  </p>
                </>
              )}
              <div className="flex flex-wrap gap-2 pt-2">
                {member.roles.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
              <Button size="sm" variant="outline" asChild className="mt-2">
                <Link to="/admin/sales-order" search={{ customerId: userId }}>
                  สั่งแทน
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          {docs.length === 0 ? (
            <p className="text-muted-foreground">ยังไม่มีเอกสาร</p>
          ) : (
            docs.map((d) => (
              <Card key={d.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
                  <div>
                    <p className="font-medium">{docTypeLabel(d.docType)}</p>
                    <Badge>{d.status}</Badge>
                  </div>
                  {d.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          void adminReviewCustomerDocument({
                            data: { docId: d.id, status: "approved" },
                            ...authServerFnOptions(session),
                          })
                            .then(() => {
                              toast.success("อนุมัติเอกสารแล้ว");
                              return load();
                            })
                            .catch((err) =>
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "ไม่สำเร็จ",
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
                          void adminReviewCustomerDocument({
                            data: { docId: d.id, status: "rejected" },
                            ...authServerFnOptions(session),
                          })
                            .then(() => {
                              toast.success("ปฏิเสธแล้ว");
                              return load();
                            })
                            .catch((err) =>
                              toast.error(
                                err instanceof Error
                                  ? err.message
                                  : "ไม่สำเร็จ",
                              ),
                            )
                        }
                      >
                        ปฏิเสธ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="credit" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <form
                className="grid max-w-md gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void adminUpsertCreditAccount({
                    data: { userId, ...creditForm },
                    ...authServerFnOptions(session),
                  })
                    .then(() => {
                      toast.success("บันทึกวงเงินแล้ว");
                      return load();
                    })
                    .catch((err) =>
                      toast.error(
                        err instanceof Error ? err.message : "ไม่สำเร็จ",
                      ),
                    );
                }}
              >
                <div>
                  <Label>วงเงิน</Label>
                  <Input
                    type="number"
                    value={creditForm.creditLimit}
                    onChange={(e) =>
                      setCreditForm((f) => ({
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
                    value={creditForm.creditTermDays}
                    onChange={(e) =>
                      setCreditForm((f) => ({
                        ...f,
                        creditTermDays: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>ขั้นต่ำ/บิล</Label>
                  <Input
                    type="number"
                    value={creditForm.minOrderAmount}
                    onChange={(e) =>
                      setCreditForm((f) => ({
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
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-4 text-sm">
                {inv.orderNumber} · ค้าง {formatPrice(inv.remaining)} ·{" "}
                {inv.status}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="wallet">
          <Card>
            <CardContent className="p-4">
              <p className="text-lg font-semibold">
                ยอดกระเป๋า {formatPrice(member.walletBalance)}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
