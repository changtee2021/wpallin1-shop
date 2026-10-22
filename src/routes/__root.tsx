import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  redirect,
  type ErrorComponentProps,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { ErrorPageShell } from "@/components/errors/error-page-shell";
import { SkipLink } from "@/components/layout/skip-link";
import { ChatWidget } from "@/components/chat/chat-widget";
import { CookieConsent } from "@/components/cookie-consent";
import { DealerPasswordGate } from "@/components/dealer/dealer-password-gate";
import { Toaster } from "@/components/ui/sonner";
import { LocaleSync } from "@/components/locale-sync";
import { AuthProvider } from "@/hooks/use-auth";
import { CartProvider } from "@/hooks/use-cart";
import { ChatUiProvider } from "@/hooks/use-chat-ui";
import {
  DEFAULT_LOCALE,
  I18nProvider,
  fontStylesheetForLocale,
  HTML_LANG,
  localeFromHref,
  translate,
  type Locale,
} from "@/i18n";
import { COMMERCE_ENABLED } from "@/lib/features";
import { resolveLegacyRedirect } from "@/lib/legacy-redirects";
import appCss from "@/styles.css?url";
import { getDefaultOgImageUrl, getPublicUrl } from "@/lib/public-url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <ErrorPageShell kind="404" />;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <ErrorPageShell
      kind="500"
      errorMessage={error instanceof Error ? error.message : undefined}
      onRetry={() => {
        router.invalidate();
        reset();
      }}
    />
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  locale?: Locale;
}>()({
  beforeLoad: ({ location }) => {
    // Old ReadyPlanet pages live on the brand site only; the dealer shop has its own paths.
    const target = COMMERCE_ENABLED
      ? null
      : resolveLegacyRedirect(location.pathname);
    if (target) throw redirect({ href: target, statusCode: 301 });
    return { locale: localeFromHref(location.publicHref ?? location.href) };
  },
  head: ({ match }) => {
    const locale = match.context.locale ?? DEFAULT_LOCALE;
    const fontHref = fontStylesheetForLocale(locale);
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title: translate(locale, "site.meta.title"),
        },
        {
          name: "description",
          content: translate(locale, "site.meta.description"),
        },
        { name: "theme-color", content: "#188F8B" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "WP ALL" },
        {
          property: "og:url",
          content: getPublicUrl(),
        },
        { property: "og:image", content: getDefaultOgImageUrl() },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: getDefaultOgImageUrl() },
        { name: "apple-mobile-web-app-title", content: "WP ALL" },
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
          href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600&display=swap",
        },
        ...(fontHref ? [{ rel: "stylesheet" as const, href: fontHref }] : []),
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500&text=WPAL&display=swap",
        },
        {
          rel: "preconnect",
          href: "https://use.typekit.net",
          crossOrigin: "anonymous",
        },
        { rel: "stylesheet", href: "https://use.typekit.net/kts4wjg.css" },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        {
          rel: "icon",
          href: "/favicon-48.png",
          type: "image/png",
          sizes: "48x48",
        },
        {
          rel: "icon",
          href: "/favicon-96.png",
          type: "image/png",
          sizes: "96x96",
        },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const publicHref = useRouterState({
    select: (s) => s.location.publicHref ?? s.location.href,
  });
  const lang = HTML_LANG[localeFromHref(publicHref)];
  return (
    <html lang={lang}>
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
  // <Link> memoizes its localized href; remount pages so hrefs pick up a new locale.
  const locale = useRouterState({
    select: (s) => localeFromHref(s.location.publicHref ?? s.location.href),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <CartProvider>
            <ChatUiProvider>
              <LocaleSync />
              <SkipLink />
              <Outlet key={locale} />
              <ChatWidget />
              <Toaster position="top-center" richColors />
              <CookieConsent />
              <DealerPasswordGate />
            </ChatUiProvider>
          </CartProvider>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
