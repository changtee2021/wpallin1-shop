import { Link, useLocation } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  ERROR_PAGE_COPY,
  type ErrorPageKind,
  isRetryableKind,
} from "@/lib/error-feedback";

type ErrorPageShellProps = {
  kind: ErrorPageKind;
  sourceUrl?: string;
  errorMessage?: string;
  onRetry?: () => void;
};

/**
 * One quiet page for every error code: a large number revealed by opening blind slats,
 * a one-line explanation, and at most two buttons. Rendered outside the store layout
 * (and outside the i18n provider when the root boundary catches), so copy is static.
 */
export function ErrorPageShell({
  kind,
  sourceUrl,
  errorMessage,
  onRetry,
}: ErrorPageShellProps) {
  const copy = ERROR_PAGE_COPY[kind];
  const pathname = useLocation({ select: (location) => location.pathname });
  const path = sourceUrl ?? (pathname === "/error" ? undefined : pathname);
  const retry =
    onRetry ??
    (isRetryableKind(kind) ? () => window.location.reload() : undefined);
  const reportSearch = {
    type: "feedback" as const,
    // The contact form only knows these codes; the rest are reported as a generic error.
    code:
      kind === "404" || kind === "403" || kind === "500"
        ? kind
        : ("generic" as const),
    from: path,
    message:
      errorMessage && kind !== "404"
        ? `ข้อความ error: ${errorMessage.slice(0, 500)}`
        : undefined,
  };

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          aria-label="WP ALL"
          className="inline-flex min-h-11 items-center"
        >
          <img
            src="/brand/logo-color.png"
            alt="WP ALL"
            width={120}
            height={40}
            className="h-9 w-auto"
          />
        </Link>
        <Link
          to="/contact"
          search={reportSearch}
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          แจ้งปัญหา
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-20 text-center">
        <p className="error-rise brand-kicker text-primary">{copy.kicker}</p>
        <p
          aria-hidden
          className="relative mt-2 text-[clamp(7rem,26vw,17rem)] leading-[0.9] font-normal tracking-[-0.06em] tabular-nums select-none"
        >
          {copy.code}
          <span className="error-blinds pointer-events-none absolute inset-0" />
        </p>
        <h1
          className="error-rise mt-6 text-xl font-medium sm:text-2xl"
          style={{ ["--delay" as string]: "700ms" }}
        >
          {copy.title}
        </h1>
        <p
          className="error-rise mt-3 max-w-sm text-sm leading-6 text-pretty text-muted-foreground"
          style={{ ["--delay" as string]: "800ms" }}
        >
          {copy.description}
        </p>

        <div
          className="error-rise mt-10 flex flex-wrap justify-center gap-3"
          style={{ ["--delay" as string]: "900ms" }}
        >
          {retry ? (
            <Button
              type="button"
              onClick={retry}
              className="h-12 rounded-full bg-foreground px-7 text-background hover:bg-primary"
            >
              ลองอีกครั้ง
            </Button>
          ) : null}
          <Button
            asChild
            variant={retry ? "outline" : "default"}
            className={
              retry
                ? "h-12 rounded-full px-7"
                : "h-12 rounded-full bg-foreground px-7 text-background hover:bg-primary"
            }
          >
            <Link to="/">กลับหน้าแรก</Link>
          </Button>
        </div>
      </main>

      <footer className="brand-index pb-6 text-center text-muted-foreground">
        WP ALL IN 1 · Center of Curtain
      </footer>
    </div>
  );
}
