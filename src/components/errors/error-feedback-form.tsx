import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import type { FeedbackCategory } from "@/lib/error-feedback";
import { submitContactForm } from "@/lib/api.functions";
import { authServerFnOptions } from "@/lib/server-fn-auth";

type ErrorFeedbackFormProps = {
  category?: FeedbackCategory;
  errorCode?: string;
  sourceUrl?: string;
  defaultSubject?: string;
  defaultMessage?: string;
  compact?: boolean;
  onSubmitted?: () => void;
};

export function ErrorFeedbackForm({
  category = "error",
  errorCode,
  sourceUrl,
  defaultSubject = "",
  defaultMessage = "",
  compact = false,
  onSubmitted,
}: ErrorFeedbackFormProps) {
  const { session, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: (user?.user_metadata?.full_name as string) ?? "",
    email: user?.email ?? "",
    phone: "",
    subject: defaultSubject,
    message: defaultMessage,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitContactForm({
        data: {
          ...form,
          category,
          errorCode,
          sourceUrl: sourceUrl ?? window.location.href,
        },
        ...authServerFnOptions(session),
      });
      toast.success(
        result.ticketId
          ? "ส่งรายงานแล้ว — ทีมงานจะติดต่อกลับทางอีเมล"
          : `รับเรื่องแล้ว (Ref: ${result.referenceId.slice(0, 8)})`,
      );
      setForm({ ...form, subject: "", message: "" });
      onSubmitted?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={compact ? "space-y-3 text-left" : "space-y-4 text-left"}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <p className="text-sm font-medium text-foreground">
        แจ้งปัญหา / ส่ง feedback
      </p>
      {!user && (
        <p className="text-xs text-muted-foreground">
          ไม่ต้องเข้าสู่ระบบก็ส่งได้ — ทีมงานจะติดต่อกลับทางอีเมล
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fb-name">ชื่อ</Label>
          <Input
            id="fb-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fb-email">อีเมล</Label>
          <Input
            id="fb-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>
      {!compact && (
        <div className="space-y-1.5">
          <Label htmlFor="fb-phone">เบอร์โทร (ถ้ามี)</Label>
          <Input
            id="fb-phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="fb-subject">หัวข้อ</Label>
        <Input
          id="fb-subject"
          required
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fb-message">รายละเอียด</Label>
        <Textarea
          id="fb-message"
          rows={compact ? 3 : 4}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="อธิบายว่าเกิดอะไรขึ้น ทำอะไรก่อนเกิดปัญหา"
        />
      </div>
      <Button disabled={submitting} type="submit" className="w-full sm:w-auto">
        {submitting ? "กำลังส่ง..." : "ส่ง feedback"}
      </Button>
    </form>
  );
}
