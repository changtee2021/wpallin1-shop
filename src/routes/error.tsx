import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ErrorPageShell } from "@/components/errors/error-page-shell";
import { ERROR_PAGE_KINDS, type ErrorPageKind } from "@/lib/error-feedback";

const errorSearchSchema = z.object({
  // The router parses `?code=404` as a number, so coerce before matching.
  code: z.coerce.string().pipe(z.enum(ERROR_PAGE_KINDS)).catch("500"),
  from: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/error")({
  validateSearch: (search) => errorSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "WP ALL — เกิดข้อผิดพลาด" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ErrorRoutePage,
});

function ErrorRoutePage() {
  const search = Route.useSearch();
  const kind = search.code as ErrorPageKind;

  return (
    <ErrorPageShell
      kind={kind}
      sourceUrl={search.from}
      errorMessage={search.message}
    />
  );
}
