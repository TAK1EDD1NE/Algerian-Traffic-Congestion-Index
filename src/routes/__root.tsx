import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  notFound,
  redirect,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useMemo, useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { createI18n, translateFor } from "@/i18n/createI18n";
import { LOCALE_DIR, isLocale, localeFromPath, preferredLocale, useLocale } from "@/i18n/locale";

/** Pre-locale paths that users may have bookmarked or shared; they are rescued, not 404'd. */
const LEGACY_SEGMENTS = new Set(["cities", "explore", "data", "methodology", "about", "city"]);

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
          <Link
            to="/$locale"
            params={{ locale }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("errors.goHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
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

/**
 * The tab icons are baked into the image, so their URLs never change between builds — and the
 * public origin sits behind an edge cache that holds a static file for hours. A version on the URL
 * is what makes a replaced icon show up immediately; bump it whenever the files change.
 */
const ICON_VERSION = "20261021";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    const first = location.pathname.split("/").filter(Boolean)[0];
    if (first === undefined) return undefined; // `/` is handled by the index route
    if (isLocale(first)) return undefined;
    // An unknown prefix would otherwise match the `$locale` segment and serve `/xx/about` as a
    // duplicate of `/about` in the default language.
    if (LEGACY_SEGMENTS.has(first)) {
      // `href` (not `to`) because the target is built at runtime; `to` is a literal-path union
      // and a template string does not typecheck against it.
      throw redirect({
        href: `/${preferredLocale()}${location.pathname}${location.searchStr ?? ""}`,
        replace: true,
      });
    }
    throw notFound();
  },
  head: ({ matches }) => {
    // The root route has no `$locale` param, so derive the locale from the deepest match's
    // pathname. A page's own `head` still wins for its `title` because TanStack Router merges
    // metadata from the shallowest to the deepest match, deepest last.
    const pathname = matches.at(-1)?.pathname ?? "/";
    const t = translateFor(localeFromPath(pathname));
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: t("meta.siteName") },
        { name: "description", content: t("meta.rootDescription") },
        { name: "author", content: t("meta.siteName") },
        { property: "og:title", content: t("meta.siteName") },
        { property: "og:description", content: t("meta.rootDescription") },
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
        { rel: "icon", href: `/favicon.ico?v=${ICON_VERSION}`, type: "image/x-icon" },
        {
          rel: "icon",
          href: `/favicon-192.png?v=${ICON_VERSION}`,
          type: "image/png",
          sizes: "192x192",
        },
        { rel: "apple-touch-icon", href: `/apple-touch-icon.png?v=${ICON_VERSION}` },
      ],
    };
  },

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
