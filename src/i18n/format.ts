import { useCallback } from "react";
import { BCP47, useLocale, type Locale } from "./locale";

/** Locale-aware number formatting. `fr` uses a comma decimal separator. */
export const formatNumber = (value: number, digits = 1, locale: Locale = "en"): string =>
  value.toLocaleString(BCP47[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

/**
 * Locale-aware formatting that preserves the value's own precision (no forced
 * fraction digits), so the English rendering is byte-identical to the raw number.
 */
export const formatRaw = (value: number, locale: Locale = "en"): string =>
  value.toLocaleString(BCP47[locale]);

export function useFormat() {
  const locale = useLocale();
  const fmt = useCallback(
    (value: number, digits = 1) => formatNumber(value, digits, locale),
    [locale],
  );
  const raw = useCallback((value: number) => formatRaw(value, locale), [locale]);
  return { fmt, raw, locale };
}
