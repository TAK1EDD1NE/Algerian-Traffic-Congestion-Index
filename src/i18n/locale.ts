import { useRouterState } from "@tanstack/react-router";

export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Writing direction per locale. `ar: "rtl"` is the intended future entry. */
export const LOCALE_DIR: Record<Locale, "ltr" | "rtl"> = { en: "ltr", fr: "ltr" };

/** BCP-47 tag used for Intl formatting (numbers, dates). */
export const BCP47: Record<Locale, string> = { en: "en-US", fr: "fr-FR" };

/** Persisted manual choice, read by the `/` redirect and written by the switcher. */
export const LOCALE_STORAGE_KEY = "auci:locale";

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * First path segment, validated. `/fr/explore?x=1` -> "fr"; anything unsupported -> default.
 * Pure so it can run on the server and inside `head`/`beforeLoad`.
 */
export function localeFromPath(pathname: string): Locale {
  const segment = pathname.split("?")[0]?.split("#")[0]?.split("/")[1]?.toLowerCase() ?? "";
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "en" ? "fr" : "en";
}

/**
 * Client-side preference for a bare `/` visit: saved choice, then the browser language,
 * then the default. On the server there is no `window`, so this returns the default.
 */
export function preferredLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY) ?? undefined;
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage can throw in private modes; fall through to detection.
  }
  const tag = window.navigator.language?.slice(0, 2).toLowerCase();
  return isLocale(tag) ? tag : DEFAULT_LOCALE;
}

/** Current locale derived from the router location. Safe anywhere inside the router tree. */
export function useLocale(): Locale {
  return useRouterState({ select: (state) => localeFromPath(state.location.pathname) });
}
