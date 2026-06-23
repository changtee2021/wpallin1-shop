import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { ErrorPageShell } from "@/components/errors/error-page-shell";
import { CookieConsent } from "@/components/cookie-consent";
import { Toaster } from "@/components/ui/sonner";
import { LocaleSync } from "@/components/locale-sync";
import { AuthProvider } from "@/hooks/use-auth";
import { I18nProvider } from "@/i18n";
import appCss from "@/styles.css?url";
import { getDefaultOgImageUrl, getPublicUrl } from "@/lib/public-url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <ErrorPageShell kind="404" />;
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <ErrorPageShell
      kind="500"
      errorMessage={error.message}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: "WP ALL — ศูนย์กลางผ้าม่าน" },
        {
          name: "description",
          content:
            "ร้านค้าผ้าม่านและมู่ลี่ ขายปลีกและขายส่ง สั่งทำพิเศษ ใบเสนอราคา และติดตามออเดอร์",
        },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "WP ALL" },
        {
          property: "og:url",
          content: getPublicUrl(),
        },
        { property: "og:image", content: getDefaultOgImageUrl() },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: getDefaultOgImageUrl() },
      ],
      links: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossOrigin: "anonymous",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap",
        },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/brand/logo-mono-dark.png", type: "image/png" },
      ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <LocaleSync />
          <Outlet />
          <Toaster position="top-center" richColors />
          <CookieConsent />
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
