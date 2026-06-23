import { Link, useRouter } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorFeedbackForm } from "@/components/errors/error-feedback-form";
import {
  ERROR_PAGE_COPY,
  type ErrorPageKind,
  defaultFeedbackSubject,
  feedbackCategoryFromKind,
} from "@/lib/error-feedback";

type ErrorPageShellProps = {
  kind: ErrorPageKind;
  sourceUrl?: string;
  errorMessage?: string;
  onRetry?: () => void;
  showFeedbackForm?: boolean;
};

export function ErrorPageShell({
  kind,
  sourceUrl,
  errorMessage,
  onRetry,
  showFeedbackForm = true,
}: ErrorPageShellProps) {
  const router = useRouter();
  const copy = ERROR_PAGE_COPY[kind];
  const path =
    sourceUrl ??
    (typeof window !== "undefined" ? window.location.pathname : undefined);
  const feedbackSubject = defaultFeedbackSubject(kind, path);
  const feedbackMessage =
    errorMessage && kind !== "404"
      ? `ข้อความ error: ${errorMessage.slice(0, 500)}`
      : "";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary/20">{copy.code}</p>
          <h1 className="mt-2 text-xl font-semibold text-foreground">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy.description}
          </p>
          {path && kind !== "generic" && (
            <p className="mt-2 break-all text-xs text-muted-foreground">
              {path}
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {onRetry && (
            <Button type="button" onClick={onRetry}>
              ลองอีกครั้ง
            </Button>
          )}
          <Button asChild variant={onRetry ? "outline" : "default"}>
            <Link to="/">กลับหน้าแรก</Link>
          </Button>
          <Button asChild variant="outline">
            <Link
              to="/contact"
              search={{
                type: "feedback",
                code: kind === "generic" ? "error" : kind,
                from: path,
                message: feedbackMessage || undefined,
              }}
            >
              ติดต่อทีมงาน
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.history.back()}
          >
            ย้อนกลับ
          </Button>
        </div>

        {showFeedbackForm && (
          <Card>
            <CardContent className="p-4 pt-5">
              <ErrorFeedbackForm
                compact
                category={feedbackCategoryFromKind(kind)}
                errorCode={copy.code}
                sourceUrl={path}
                defaultSubject={feedbackSubject}
                defaultMessage={feedbackMessage}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
