import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageLoading } from "@/components/loading";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchAdminGuestFeedback,
  fetchAdminSupportTicketDetail,
  fetchAdminSupportTickets,
  updateAdminSupportTicket,
} from "@/lib/api.functions";
import { formatDate } from "@/lib/format";
import { authServerFnOptions } from "@/lib/server-fn-auth";
import type {
  GuestFeedbackDto,
  SupportTicketDetailDto,
  SupportTicketDto,
} from "@/services/support.service";

export const Route = createFileRoute("/admin/support")({
  component: AdminSupportPage,
});

const STATUS_LABELS: Record<string, string> = {
  open: "เปิด",
  in_progress: "กำลังดำเนินการ",
  resolved: "แก้แล้ว",
  closed: "ปิด",
};

function statusBadgeVariant(status: string) {
  if (status === "open") return "destructive" as const;
  if (status === "in_progress") return "default" as const;
  return "secondary" as const;
}

function AdminSupportPage() {
  const { session } = useAuth();
  const [tab, setTab] = useState<"tickets" | "guest">("tickets");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets] = useState<SupportTicketDto[]>([]);
  const [guestItems, setGuestItems] = useState<GuestFeedbackDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SupportTicketDetailDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [nextStatus, setNextStatus] = useState<
    "open" | "in_progress" | "resolved" | "closed"
  >("in_progress");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadTickets() {
    const data = await fetchAdminSupportTickets({
      data: {
        status: statusFilter as
          | "all"
          | "open"
          | "in_progress"
          | "resolved"
          | "closed",
      },
      ...authServerFnOptions(session),
    });
    setTickets(data);
  }

  async function loadGuest() {
    const data = await fetchAdminGuestFeedback({
      ...authServerFnOptions(session),
    });
    setGuestItems(data);
  }

  async function reload() {
    setLoading(true);
    try {
      if (tab === "tickets") {
        await loadTickets();
      } else {
        await loadGuest();
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tab, statusFilter]);

  async function openTicket(ticketId: string) {
    setDetailOpen(true);
    setDetailLoading(true);
    setAdminNote("");
    try {
      const data = await fetchAdminSupportTicketDetail({
        data: { ticketId },
        ...authServerFnOptions(session),
      });
      setDetail(data);
      setNextStatus(
        (data.status as "open" | "in_progress" | "resolved" | "closed") ||
          "in_progress",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "โหลดไม่สำเร็จ");
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleUpdateTicket() {
    if (!detail) return;
    setSaving(true);
    try {
      await updateAdminSupportTicket({
        data: {
          ticketId: detail.id,
          status: nextStatus,
          note: adminNote.trim() || undefined,
        },
        ...authServerFnOptions(session),
      });
      toast.success("อัปเดตแล้ว");
      setDetailOpen(false);
      setDetail(null);
      await loadTickets();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="ติดต่อ / Feedback"
        description="ดู ticket จากสมาชิกและ feedback จากผู้เยี่ยมชม"
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/chat">เปิดแชทลูกค้า</Link>
          </Button>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as "tickets" | "guest")}
      >
        <TabsList>
          <TabsTrigger value="tickets">Support tickets</TabsTrigger>
          <TabsTrigger value="guest">Guest feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Label htmlFor="status-filter">สถานะ</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter" className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="open">เปิด</SelectItem>
                <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                <SelectItem value="resolved">แก้แล้ว</SelectItem>
                <SelectItem value="closed">ปิด</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              รีเฟรช
            </Button>
          </div>

          {loading ? (
            <PageLoading variant="table" />
          ) : tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                ไม่มี ticket
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{ticket.subject}</p>
                      {ticket.preview ? (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {ticket.preview}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDate(ticket.createdAt)} · {ticket.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusBadgeVariant(ticket.status)}>
                        {STATUS_LABELS[ticket.status] ?? ticket.status}
                      </Badge>
                      <Badge variant="outline">{ticket.priority}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void openTicket(ticket.id)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="guest" className="space-y-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              รีเฟรช
            </Button>
          </div>

          {loading ? (
            <PageLoading variant="table" />
          ) : guestItems.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                ไม่มี guest feedback
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {guestItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="space-y-2 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold">{item.subject}</p>
                      <Badge variant="outline">
                        {item.category ?? "contact"}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      {item.name} · {item.email}
                      {item.phone ? ` · ${item.phone}` : ""}
                    </p>
                    {item.errorCode ? (
                      <p className="text-xs text-destructive">
                        Error: {item.errorCode}
                      </p>
                    ) : null}
                    {item.sourceUrl ? (
                      <p className="break-all text-xs text-muted-foreground">
                        {item.sourceUrl}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap text-sm">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.createdAt)} · ref {item.id.slice(0, 8)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.subject ?? "Ticket"}</DialogTitle>
          </DialogHeader>
          {detailLoading || !detail ? (
            <PageLoading variant="table" />
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={statusBadgeVariant(detail.status)}>
                  {STATUS_LABELS[detail.status] ?? detail.status}
                </Badge>
                <Badge variant="outline">{detail.priority}</Badge>
              </div>
              <div className="space-y-2">
                {detail.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-md border bg-muted/30 p-3 text-sm"
                  >
                    <p className="whitespace-pre-wrap">{note.note}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(note.createdAt)}
                      {note.isInternal ? " · internal" : ""}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>อัปเดตสถานะ</Label>
                <Select
                  value={nextStatus}
                  onValueChange={(value) =>
                    setNextStatus(
                      value as "open" | "in_progress" | "resolved" | "closed",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">เปิด</SelectItem>
                    <SelectItem value="in_progress">กำลังดำเนินการ</SelectItem>
                    <SelectItem value="resolved">แก้แล้ว</SelectItem>
                    <SelectItem value="closed">ปิด</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-note">บันทึกภายใน (ไม่บังคับ)</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>
              ปิด
            </Button>
            <Button
              disabled={saving || detailLoading || !detail}
              onClick={() => void handleUpdateTicket()}
            >
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
