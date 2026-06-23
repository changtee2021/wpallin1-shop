import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ErrorFeedbackForm } from "@/components/errors/error-feedback-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import {
  defaultFeedbackSubject,
  feedbackCategoryFromKind,
  type ErrorPageKind,
} from "@/lib/error-feedback";

const contactSearchSchema = z.object({
  type: z.enum(["feedback"]).optional(),
  code: z.enum(["404", "403", "500", "error", "generic"]).optional(),
  from: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/_store/contact")({
  validateSearch: (search) => contactSearchSchema.parse(search),
  component: ContactPage,
});

function ContactPage() {
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

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <PageHeader
        title={isFeedback ? "แจ้งปัญหา / Feedback" : "ติดต่อเรา"}
        description={
          isFeedback
            ? "ส่งรายงานปัญหาให้ทีมงาน WP ALL — ไม่ต้องเข้าสู่ระบบก็ส่งได้"
            : "ส่งข้อความถึงทีมขาย WP ALL"
        }
      />

      {isFeedback && search.from && (
        <p className="mb-4 break-all text-xs text-muted-foreground">
          จากหน้า: {search.from}
        </p>
      )}

      <Card>
        <CardContent className="p-4 pt-5">
          <ErrorFeedbackForm
            category={isFeedback ? feedbackCategoryFromKind(kind) : "contact"}
            errorCode={isFeedback ? kind : undefined}
            sourceUrl={search.from}
            defaultSubject={defaultSubject}
            defaultMessage={defaultMessage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
