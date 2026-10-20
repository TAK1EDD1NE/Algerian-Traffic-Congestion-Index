import { describe, expect, test } from "bun:test";
import {
  dailyCitySeries,
  dailyNationalSeries,
  RECENT_DAYS,
  recentDates,
  type DailyRow,
} from "../src/lib/traffic";

const day = (date: string, congestionIndex = 1, city = "Alger"): DailyRow => ({
  city,
  date,
  dayOfWeek: 2,
  congestionIndex,
});

/** Consecutive ISO dates — synthetic series, so the window maths is checked on exact strings. */
const consecutive = (from: string, count: number) => {
  const [y, m, d] = from.split("-").map(Number);
  return Array.from({ length: count }, (_, i) =>
    new Date(Date.UTC(y ?? 1970, (m ?? 1) - 1, (d ?? 1) + i)).toISOString().slice(0, 10),
  );
};

/** The live shape: 21 retained corpus days, a pause, then the October captures. */
const CORPUS = consecutive("2026-06-11", 21); // 06-11 .. 07-01
const LIVE = ["2026-10-17", "2026-10-18", "2026-10-19"];

describe("the day-by-day window", () => {
  const daily: DailyRow[] = [...CORPUS, ...LIVE].map((d, i) => day(d, i));

  test("shows every captured day when the series holds fewer than 30 of them", () => {
    expect(recentDates(daily)).toEqual([...CORPUS, ...LIVE]);
    expect(dailyNationalSeries(daily)).toHaveLength(24);
  });

  test("keeps the newest 30 captured dates once the series is longer", () => {
    const long = consecutive("2026-05-01", 45).map((d, i) => day(d, i));
    const dates = recentDates(long);
    expect(dates).toHaveLength(RECENT_DAYS);
    expect(dates[0]).toBe("2026-05-16");
    expect(dates[dates.length - 1]).toBe("2026-06-14");
  });

  test("a shorter window keeps the newest dates of the same series", () => {
    expect(recentDates(daily, { days: 3 })).toEqual(LIVE);
  });

  test("the national series aggregates only the windowed dates", () => {
    const flat = [...CORPUS, ...LIVE].map((d) => day(d, 5));
    expect(dailyNationalSeries(flat)[0]).toEqual({ label: "06-11", value: 5 });
    expect(dailyNationalSeries(flat).at(-1)).toEqual({ label: "10-19", value: 5 });
    expect(dailyNationalSeries(flat, { days: 2 }).map((p) => p.label)).toEqual(["10-18", "10-19"]);
  });

  test("a city filter uses the same window as the national series", () => {
    const mixed = [...CORPUS, ...LIVE].flatMap((d) => [day(d, 4), day(d, 9, "Oran")]);
    expect(dailyCitySeries(mixed, "Oran", { days: 2 })).toEqual([
      { label: "10-18", value: 9 },
      { label: "10-19", value: 9 },
    ]);
  });

  test("no captures at all stays empty rather than inventing points", () => {
    expect(recentDates([])).toEqual([]);
    expect(dailyNationalSeries([])).toEqual([]);
  });
});
