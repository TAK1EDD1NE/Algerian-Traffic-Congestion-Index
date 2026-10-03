import { describe, expect, test } from "bun:test";
import { formatNumber } from "../src/i18n/format";

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
