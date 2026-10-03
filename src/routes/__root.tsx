import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useMemo, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { createI18n } from "@/i18n/createI18n";
import { LOCALE_DIR, useLocale } from "@/i18n/locale";

/** One i18n instance per render pass — see createI18n for why it is not a module singleton. */
function useI18n() {
  const locale = useLocale();
  const i18n = useMemo(() => createI18n(locale), [locale]);
  return { locale, i18n };
}

function NotFoundComponent() {
  const { i18n } = useI18n();
  const { t } = useTranslation(undefined, { i18n });
  const locale = useLocale();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{t("errors.notFoundTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.notFoundBody")}</p>
        <div className="mt-6">
          {/* Plain anchor in Task 3: the typed `/$locale/` route does not exist until Task 4, and a
              typed `to` pointing at a non-existent route fails typecheck. Task 4 upgrades this to
              the typed <Link to="/$locale/" params={{ locale }}>. Task 3 must NOT use <Link> here. */}
          <a
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  const { i18n } = useI18n();
  const { t } = useTranslation(undefined, { i18n });
  const locale = useLocale();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {t("errors.crashTitle")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("errors.crashBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.tryAgain")}
          </button>
          <a
            href={`/${locale}`}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("errors.goHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "A congestion index for Algerian cities: rankings, peak-hour analysis, road-network coverage and daily trends.",
      },
      { name: "author", content: "Algeria Urban Congestion Index" },
      { property: "og:title", content: "Algeria Urban Congestion Index" },
      {
        property: "og:description",
        content: "Congestion rankings and mobility analytics for Algerian cities.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  // The shell renders above the route match, so it has no `params` — but it does have router
  // state, which is where the locale comes from.
  const locale = useLocale();
  return (
    <html lang={locale} dir={LOCALE_DIR[locale]}>
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
  const { i18n } = useI18n();

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <div className="flex min-h-screen flex-col bg-background">
          <Header />
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </I18nextProvider>
    </QueryClientProvider>
  );
}
