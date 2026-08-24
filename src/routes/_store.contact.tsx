import { createFileRoute, Link } from "@tanstack/react-router";
import { Factory, Handshake, MessageCircle } from "lucide-react";
import { z } from "zod";

import { BusinessContactForm } from "@/components/storefront/business-contact-form";
import { ErrorFeedbackForm } from "@/components/errors/error-feedback-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useT } from "@/i18n";
import { LINE_OA_URL } from "@/lib/catalog-config";
import { isContactTopic } from "@/lib/contact-inquiry";
import {
  defaultFeedbackSubject,
  feedbackCategoryFromKind,
  type ErrorPageKind,
} from "@/lib/error-feedback";

const contactSearchSchema = z.object({
  type: z.enum(["feedback"]).optional(),
  topic: z
    .enum(["project", "quote", "factory-visit", "dealer", "profile", "other"])
    .optional(),
  code: z.preprocess(
    (value) => (value == null || value === "" ? undefined : String(value)),
    z.enum(["404", "403", "500", "error", "generic"]).optional(),
  ),
  from: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/_store/contact")({
  validateSearch: (search) => contactSearchSchema.parse(search),
  component: ContactPage,
});

function ContactPage() {
  const { locale } = useT();
  const search = Route.useSearch();
  const isFeedback = search.type === "feedback";
  const kind: ErrorPageKind =
    search.code === "404" ||
    search.code === "403" ||
    search.code === "500" ||
    search.code === "generic"
      ? search.code
      : "error";

  const defaultSubject = isFeedback
    ? defaultFeedbackSubject(kind, search.from)
    : "";
  const defaultMessage = search.message ?? "";
  const initialTopic = isContactTopic(search.topic) ? search.topic : undefined;
  const isVisit = initialTopic === "factory-visit";

  if (isFeedback) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <PageHeader
          title="แจ้งปัญหา / Feedback"
          description="ส่งรายงานปัญหาให้ทีมงาน WP ALL — ไม่ต้องเข้าสู่ระบบก็ส่งได้"
        />
        {search.from ? (
          <p className="mb-4 break-all text-xs text-muted-foreground">
            จากหน้า: {search.from}
          </p>
        ) : null}
        <Card>
          <CardContent className="p-4 pt-5">
            <ErrorFeedbackForm
              category={feedbackCategoryFromKind(kind)}
              errorCode={kind}
              sourceUrl={search.from}
              defaultSubject={defaultSubject}
              defaultMessage={defaultMessage}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <PageHeader
        title={
          isVisit
            ? locale === "en"
              ? "Book a factory visit"
              : "นัดเยี่ยมชมโรงงาน"
            : locale === "en"
              ? "Contact us"
              : "ติดต่อเรา"
        }
        description={
          isVisit
            ? locale === "en"
              ? "Pick a date and production line — the sales team will confirm within 1 business day."
              : "เลือกวันและสายผลิตที่อยากดู — ทีมขายจะยืนยันภายใน 1 วันทำการ"
            : locale === "en"
              ? "For companies, projects, dealers, and factory visits — not a general inbox."
              : "เน้นติดต่อธุรกิจ งานโครงการ ตัวแทน และนัดชมโรงงาน"
        }
      />

      <div className="grid items-start gap-8 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] md:gap-10">
        <aside className="space-y-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-accent uppercase">
            {locale === "en" ? "For business" : "สำหรับบริษัทและองค์กร"}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {locale === "en"
              ? "Tell us the topic first. If you want to see the factory, choose a date and session — we will confirm before you come."
              : "เลือกเรื่องที่ต้องการก่อน ถ้านัดชมโรงงานให้ระบุวันและรอบ ทีมงานจะยืนยันก่อนวันเข้าชม"}
          </p>
          <div className="grid gap-2">
            <a
              href={LINE_OA_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#06C755] px-3.5 text-sm font-semibold text-white hover:brightness-95 active:opacity-90"
            >
              <MessageCircle className="size-4 shrink-0" aria-hidden />
              LINE @wpfordealer
            </a>
            <Link
              to="/contact"
              search={{ topic: "factory-visit" }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3.5 text-sm font-semibold hover:bg-muted/60"
            >
              <Factory className="size-4 shrink-0" aria-hidden />
              {locale === "en" ? "Book factory visit" : "นัดเยี่ยมชมโรงงาน"}
            </Link>
            <Link
              to="/dealer/register"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-white px-3.5 text-sm font-semibold hover:bg-muted/60"
            >
              <Handshake className="size-4 shrink-0" aria-hidden />
              {locale === "en" ? "Dealer registration" : "สมัครตัวแทน"}
            </Link>
          </div>
        </aside>

        <Card>
          <CardContent className="p-4 pt-5 sm:p-6">
            <BusinessContactForm
              key={initialTopic ?? "default"}
              initialTopic={initialTopic}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
