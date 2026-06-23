import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ErrorPageShell } from "@/components/errors/error-page-shell";
import type { ErrorPageKind } from "@/lib/error-feedback";

const errorSearchSchema = z.object({
  code: z.enum(["404", "403", "500", "generic"]).catch("500"),
  from: z.string().optional(),
  message: z.string().optional(),
});

export const Route = createFileRoute("/_store/error")({
  validateSearch: (search) => errorSearchSchema.parse(search),
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
      showFeedbackForm
    />
  );
}
