import { useRouterState } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, useLocale, type Locale } from "@/i18n/locale";

/**
 * Two-option segmented control. Lives outside the `hidden md:flex` nav so it stays reachable on
 * mobile, where the site has no menu.
 * Labels stay "EN"/"FR" in every language — they name languages, they are not copy.
 */
const LABELS: Record<Locale, string> = { en: "EN", fr: "FR" };

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const current = useLocale();
  // Same page, only the locale segment replaced: /fr/explore -> /en/explore
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <div
      className="flex shrink-0 items-center rounded-lg border border-border p-0.5"
      role="group"
      aria-label={t("a11y.language")}
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === current;
        const rest = pathname.split("/").filter(Boolean).slice(1);
        const target = `/${locale}${rest.length ? `/${rest.join("/")}` : ""}`;
        return (
          <a
            key={locale}
            href={target}
            aria-current={active ? "true" : undefined}
            onClick={() => {
              try {
                window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
              } catch {
                // storage unavailable (private mode) — the URL still carries the locale
              }
            }}
            className={`num rounded-md px-2 py-1 text-[11px] font-bold tracking-wider transition-colors ${
              active
                ? "bg-ink text-ink-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            {LABELS[locale]}
          </a>
        );
      })}
    </div>
  );
}
