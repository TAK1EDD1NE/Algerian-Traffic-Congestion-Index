import i18next, { type i18n as I18nInstance, type TFunction } from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";
import { fr } from "./locales/fr";
import { SUPPORTED_LOCALES, type Locale } from "./locale";

/**
 * One instance per render pass.
 *
 * A module-level singleton would be shared by concurrent server requests, so an in-flight
 * `/fr` render could read English strings. Instances are therefore created per render and
 * handed to react-i18next's provider.
 *
 * `initAsync: false` (i18next 26 — the old name was `initImmediate`) makes `init` synchronous
 * because the resources are bundled, so `t()` is usable in the very first render instead of
 * falling back to English on the server and mismatching on hydration.
 */
export function createI18n(locale: Locale): I18nInstance {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "en",
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    resources: { en: { translation: en }, fr: { translation: fr } },
    defaultNS: "translation",
    interpolation: { escapeValue: false },
    initAsync: false,
    returnNull: false,
  });
  return instance;
}

/**
 * Cached one instance per locale for non-React contexts (`head`, loaders).
 *
 * This is NOT the render path and it does not reintroduce the cross-request race: an instance
 * is only ever created with, and used for, a single locale, and it is never re-`changeLanguage`d.
 * A render must still use its own instance — see Task 3.
 */
const translationCache = new Map<Locale, I18nInstance>();

/** Synchronous translator for route `head` and other non-React call sites. */
export function translateFor(locale: Locale): TFunction {
  let instance = translationCache.get(locale);
  if (!instance) {
    instance = createI18n(locale);
    translationCache.set(locale, instance);
  }
  return instance.t.bind(instance);
}
