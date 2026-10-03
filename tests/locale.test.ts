import { describe, expect, test } from "bun:test";
import { localeFromPath, isLocale, otherLocale, SUPPORTED_LOCALES } from "../src/i18n/locale";

describe("localeFromPath", () => {
  test("extracts a supported first segment", () => {
    expect(localeFromPath("/fr/explore")).toBe("fr");
    expect(localeFromPath("/en")).toBe("en");
    expect(localeFromPath("/en/")).toBe("en");
  });
  test("falls back to the default locale", () => {
    expect(localeFromPath("/")).toBe("en");
    expect(localeFromPath("")).toBe("en");
    expect(localeFromPath("/xx/about")).toBe("en");
  });
  test("is case-insensitive and ignores the fragment/query", () => {
    expect(localeFromPath("/FR/explore?cities=Alger")).toBe("fr");
  });
});

describe("helpers", () => {
  test("isLocale narrows only supported codes", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("xx")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
  test("otherLocale flips", () => {
    expect(otherLocale("en")).toBe("fr");
    expect(otherLocale("fr")).toBe("en");
  });
  test("supported set is exactly en/fr", () => {
    expect(SUPPORTED_LOCALES).toEqual(["en", "fr"]);
  });
});
