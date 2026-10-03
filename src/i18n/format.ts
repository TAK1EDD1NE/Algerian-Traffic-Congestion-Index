import { useCallback } from "react";
import { BCP47, useLocale, type Locale } from "./locale";

/** Locale-aware number formatting. `fr` uses a comma decimal separator. */
export const formatNumber = (value: number, digits = 1, locale: Locale = "en"): string =>
  value.toLocaleString(BCP47[locale], {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

export function useFormat() {
  const locale = useLocale();
  const fmt = useCallback(
    (value: number, digits = 1) => formatNumber(value, digits, locale),
    [locale],
  );
  return { fmt, locale };
}
