import { describe, expect, test } from "bun:test";
import { formatNumber, formatRaw } from "../src/i18n/format";

describe("formatNumber", () => {
  test("english formatting", () => {
    expect(formatNumber(1234.5, 1, "en")).toBe("1,234.5");
  });
  test("french formatting uses a comma decimal separator", () => {
    const fr = formatNumber(1234.5, 1, "fr");
    expect(fr).toContain(",");
    expect(fr.startsWith("1")).toBe(true);
    expect(fr).not.toBe(formatNumber(1234.5, 1, "en"));
  });
});

describe("formatRaw", () => {
  // These pin the property that makes the dataset preview table safe to route
  // through the locale-aware formatter: English output is byte-identical to the
  // raw React number rendering, so the EN page copy does not change.
  test("english output is byte-identical to the raw number for table shapes", () => {
    expect(formatRaw(16.79, "en")).toBe("16.79");
    expect(formatRaw(972.7, "en")).toBe("972.7");
    expect(formatRaw(1.7, "en")).toBe("1.7");
  });
  test("an integer stays an integer (no forced decimals)", () => {
    expect(formatRaw(972, "en")).toBe("972");
  });
  test("french localizes the decimal separator to a comma", () => {
    const fr = formatRaw(972.7, "fr");
    expect(fr).toContain(",");
    expect(fr).not.toBe(formatRaw(972.7, "en"));
  });
});

