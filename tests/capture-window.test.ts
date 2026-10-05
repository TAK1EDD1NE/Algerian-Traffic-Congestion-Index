import { describe, expect, test } from "bun:test";
import { captureWindow, type DailyRow } from "../src/lib/traffic";

const day = (date: string): DailyRow => ({ city: "Alger", date, dayOfWeek: 2, congestionIndex: 1 });

describe("captureWindow", () => {
  const daily = [day("2026-06-20"), day("2026-06-09"), day("2026-07-02"), day("2026-06-15")];

  test("spans the earliest and latest date, in English (en-US, as the rest of the site formats dates)", () => {
    expect(captureWindow(daily, "en")).toEqual({ from: "June 9, 2026", to: "July 2, 2026" });
  });

  test("uses the locale's own month names in French", () => {
    expect(captureWindow(daily, "fr")).toEqual({ from: "9 juin 2026", to: "2 juillet 2026" });
  });

  test("returns null when there is no daily series to bound the window", () => {
    expect(captureWindow([], "en")).toBeNull();
  });
});
