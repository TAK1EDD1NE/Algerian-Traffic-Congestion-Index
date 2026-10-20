import { describe, expect, test } from "bun:test";
import {
  datedDays,
  daysInRange,
  previousDate,
  rankedCityRows,
  slotBefore,
  type CityRow,
  type DatedHourlyRow,
  type Dataset,
  type HourlyRow,
  type RoadClassHourlyRow,
  type RoadClassRow,
} from "../src/lib/traffic";

const city = (
  name: string,
  congestionIndex: number,
  previousIndex: number,
  coveragePct: number,
  capacityKm: number,
  nAreas: number,
): CityRow => ({
  city: name,
  wilaya: name,
  population: 1,
  congestionIndex,
  previousIndex,
  dayChange: congestionIndex - previousIndex,
  freeFlowMinPer10km: 0,
  peakAmDelayMin: 0,
  peakPmDelayMin: 0,
  latitude: 0,
  longitude: 0,
  coveragePct,
  capacityKm,
  nAreas,
  nSnapshots: 0,
  highwaySharePct: 0,
});

/** Eight published days with their real weekday (2026-06-11 is a Thursday). */
const DATES = [
  "2026-06-11",
  "2026-06-12",
  "2026-06-13",
  "2026-06-14",
  "2026-06-15",
  "2026-06-16",
  "2026-06-17",
  "2026-06-18",
];
const DOW = [4, 5, 6, 0, 1, 2, 3, 4] as const;

/** [slot, value on the first four days, value on the last four] */
type SlotSpec = [hour: number, early: number, late: number];

/**
 * A and B trade places across the window: A is calm early and busy late, B the reverse, and at
 * 20:00 B is gridlocked while A is free. Every row is weighted 1 except where a test builds its
 * own fixture, so means are plain averages over (day x slot) rows.
 */
const dated = (
  cityName: string,
  specs: SlotSpec[],
  roadClass: DatedHourlyRow["roadClass"] = "combined",
): DatedHourlyRow[] =>
  DATES.flatMap((date, i) =>
    specs.map(([hour, early, late]) => ({
      city: cityName,
      date,
      dayOfWeek: DOW[i]!,
      hour,
      roadClass,
      congestionIndex: i < 4 ? early : late,
    })),
  );

const SLOTS: SlotSpec[] = [
  [8, 10, 20],
  [18, 0, 7],
  [20, 1, 8],
  [22, 30, 30],
  [0, 5, 5],
];

const hourlyDated: DatedHourlyRow[] = [
  ...dated("A", SLOTS),
  ...dated("B", [
    [8, 12, 4],
    [18, 45, 10],
    [20, 40, 8],
    [22, 20, 20],
    [0, 20, 20],
  ]),
  // Each class carries its own series and its own reference network.
  ...dated(
    "A",
    [
      [8, 60, 2],
      [18, 60, 2],
      [20, 5, 10],
    ],
    "highway",
  ),
  ...dated(
    "B",
    [
      [8, 12, 12],
      [18, 12, 12],
      [20, 45, 45],
    ],
    "highway",
  ),
];

const roadClasses: RoadClassRow[] = [
  {
    city: "A",
    roadClass: "highway",
    congestionIndex: 55,
    calmFloor: 0.2,
    coveragePct: 70,
    capacityKm: 30,
  },
  {
    city: "A",
    roadClass: "normal",
    congestionIndex: 20,
    calmFloor: 0.1,
    coveragePct: 95,
    capacityKm: 70,
  },
  {
    city: "B",
    roadClass: "highway",
    congestionIndex: 11,
    calmFloor: 0.2,
    coveragePct: 65,
    capacityKm: 20,
  },
  {
    city: "B",
    roadClass: "normal",
    congestionIndex: 9,
    calmFloor: 0.1,
    coveragePct: 88,
    capacityKm: 30,
  },
];

const data = {
  cities: [city("A", 20, 18, 90, 100, 3), city("B", 8, 4, 80, 50, 2)],
  hourly: [] as HourlyRow[],
  roadClasses,
  roadClassesHourly: [] as RoadClassHourlyRow[],
  hourlyDated,
} as Pick<Dataset, "cities" | "hourly" | "roadClasses" | "roadClassesHourly" | "hourlyDated">;

const names = (rows: { city: string }[]) => rows.map((r) => r.city);
const ALL = { dates: null, roadClass: "combined", hour: null, metric: "level" } as const;
const window = (from: number, to: number) => ({ from: DATES[from]!, to: DATES[to]! });

describe("day-range helpers", () => {
  test("previousDate walks the real calendar, across a month boundary", () => {
    expect(previousDate("2026-06-12")).toBe("2026-06-11");
    expect(previousDate("2026-07-01")).toBe("2026-06-30");
    expect(previousDate("2026-03-01")).toBe("2026-02-28");
  });

  test("slotBefore wraps 00:00 onto 22:00 of the previous date", () => {
    expect(slotBefore("2026-06-11", 8)).toEqual({ date: "2026-06-11", hour: 6 });
    expect(slotBefore("2026-06-11", 0)).toEqual({ date: "2026-06-10", hour: 22 });
  });

  test("datedDays and daysInRange bound the calendar and count captured days", () => {
    const days = datedDays(hourlyDated)!;
    expect(days.dates).toEqual(DATES);
    expect(days.first).toBe("2026-06-11");
    expect(days.last).toBe("2026-06-18");
    expect(daysInRange(days.dates, null)).toEqual(DATES);
    expect(daysInRange(days.dates, window(2, 5))).toEqual(DATES.slice(2, 6));
    // A window that opens before the series still only counts published days.
    expect(daysInRange(days.dates, { from: "2026-01-01", to: DATES[1]! })).toEqual([
      DATES[0]!,
      DATES[1]!,
    ]);
  });

  test("an empty series has no calendar", () => {
    expect(datedDays([])).toBeNull();
  });
});

describe("rankedCityRows - level", () => {
  test("default state keeps the canonical index, order and network", () => {
    const rows = rankedCityRows(data, { ...ALL });
    expect(names(rows)).toEqual(["A", "B"]);
    expect(rows[0]!.congestion).toBe(20); // cities.csv value, not a series mean
    expect(rows[0]!.capacityKm).toBe(100);
    expect(rows[0]!.nAreas).toBe(3);
  });

  test("the day window recomputes the mean over exactly those dates", () => {
    // A's first four days: (10+0+1+30+5)/5 = 9.2 per day; B's: (12+45+40+20+20)/5 = 27.4.
    const early = rankedCityRows(data, { ...ALL, dates: window(0, 3) });
    expect(names(early)).toEqual(["B", "A"]);
    expect(early[0]!.congestion).toBeCloseTo(27.4, 6);
    expect(early[1]!.congestion).toBeCloseTo(9.2, 6);

    // The last four days reverse it: A 70/5 = 14 per day, B 62/5 = 12.4.
    const late = rankedCityRows(data, { ...ALL, dates: window(4, 7) });
    expect(names(late)).toEqual(["A", "B"]);
    expect(late[0]!.congestion).toBeCloseTo(14, 6);
    expect(late[1]!.congestion).toBeCloseTo(12.4, 6);
  });

  test("a whole-corpus window is that window's mean, not the canonical figure", () => {
    const rows = rankedCityRows(data, { ...ALL, dates: window(0, 7) });
    expect(rows[0]!.city).toBe("B");
    expect(rows[0]!.congestion).toBeCloseTo(796 / 40, 6); // (548 + 248) / 40 rows
    expect(rows[1]!.congestion).toBeCloseTo(464 / 40, 6);
  });

  test("day and hour compose, and can flip the ranking", () => {
    const morning = rankedCityRows(data, { ...ALL, hour: 8, dates: window(0, 3) });
    expect(morning[0]!.city).toBe("B"); // 12 vs 10
    expect(morning[0]!.congestion).toBe(12);
    expect(morning[1]!.congestion).toBe(10);

    const morningLate = rankedCityRows(data, { ...ALL, hour: 8, dates: window(4, 7) });
    expect(morningLate[0]!.city).toBe("A"); // 20 vs 4
    expect(morningLate[1]!.congestion).toBe(4);

    const evening = rankedCityRows(data, { ...ALL, hour: 20, dates: window(0, 3) });
    expect(evening[0]!.city).toBe("B"); // 40 vs 1
  });

  test("a window is the mean of its (date x slot) cells, each counted once", () => {
    // Day 0 captured two slots, day 1 only one: the window mean is over the three cells (40),
    // not the mean of the two daily means (52.5), and not weighted by slot count.
    const sparse: DatedHourlyRow[] = [
      {
        city: "A",
        date: DATES[0]!,
        dayOfWeek: 4,
        hour: 8,
        roadClass: "combined",
        congestionIndex: 10,
      },
      {
        city: "A",
        date: DATES[0]!,
        dayOfWeek: 4,
        hour: 20,
        roadClass: "combined",
        congestionIndex: 20,
      },
      {
        city: "A",
        date: DATES[1]!,
        dayOfWeek: 5,
        hour: 8,
        roadClass: "combined",
        congestionIndex: 90,
      },
    ];
    const rows = rankedCityRows({ ...data, hourlyDated: sparse } as typeof data, {
      ...ALL,
      dates: window(0, 1),
    });
    expect(rows.find((r) => r.city === "A")!.congestion).toBe(40);
    // A single-day window still answers with that day's own cells.
    const single = rankedCityRows({ ...data, hourlyDated: sparse } as typeof data, {
      ...ALL,
      dates: window(0, 0),
    });
    expect(single.find((r) => r.city === "A")!.congestion).toBe(15);
  });

  test("a road class scores on that class's own series and network", () => {
    const early = rankedCityRows(data, {
      ...ALL,
      roadClass: "highway",
      hour: 8,
      dates: window(0, 3),
    });
    expect(early[0]!.city).toBe("A"); // 60 vs 12
    expect(early[1]!.congestion).toBe(12);
    expect(early[0]!.coveragePct).toBe(70); // highway coverage, not the city's 90
    expect(early[0]!.capacityKm).toBe(30); // highway network, not the city's 100

    const late = rankedCityRows(data, {
      ...ALL,
      roadClass: "highway",
      hour: 20,
      dates: window(4, 7),
    });
    expect(late[0]!.city).toBe("B"); // 45 vs 10
  });

  test("monitored areas stay city-wide whatever the filters", () => {
    const rows = rankedCityRows(data, {
      ...ALL,
      dates: window(0, 3),
      roadClass: "normal",
      hour: 20,
    });
    expect(rows.find((r) => r.city === "A")!.nAreas).toBe(3);
    expect(rows.find((r) => r.city === "B")!.nAreas).toBe(2);
  });
});

describe("rankedCityRows - change", () => {
  test("the change scores the selected slot against the slot before it", () => {
    const rows = rankedCityRows(data, { ...ALL, hour: 20, metric: "change" });
    // A rises by 1 pt into 20:00 on every day; B falls by 5 early and 2 late -> -3.5.
    expect(names(rows)).toEqual(["A", "B"]);
    expect(rows[0]!.congestion).toBe(1);
    expect(rows[1]!.congestion).toBeCloseTo(-3.5, 6);
  });

  test("the change follows the day window", () => {
    const early = rankedCityRows(data, {
      ...ALL,
      hour: 20,
      metric: "change",
      dates: window(0, 3),
    });
    expect(early.find((r) => r.city === "B")!.congestion).toBe(-5);
    const late = rankedCityRows(data, {
      ...ALL,
      hour: 20,
      metric: "change",
      dates: window(4, 7),
    });
    expect(late.find((r) => r.city === "B")!.congestion).toBe(-2);
  });

  test("the change at 00:00 is measured against 22:00 of the previous date", () => {
    const rows = rankedCityRows(data, { ...ALL, hour: 0, metric: "change" });
    // The first published day has no day before it, so it drops out of the mean (7 days).
    expect(rows.find((r) => r.city === "A")!.congestion).toBe(-25); // 5 - 30
    expect(rows.find((r) => r.city === "B")!.congestion).toBe(0); // 20 - 20
  });

  test("a day whose earlier slot was never captured drops out", () => {
    const base = dated("A", [
      [0, 10, 10],
      [22, 5, 5],
    ]);
    const missing = base.filter((r) => !(r.date === DATES[2] && r.hour === 22));
    const rows = rankedCityRows({ ...data, hourlyDated: missing } as typeof data, {
      ...ALL,
      hour: 0,
      metric: "change",
    });
    // Day 0 has no previous date and day 3's 22:00 is missing, so two days remain and each
    // gives +5. A missing slot scored as zero would have pushed the mean to 6.7 instead.
    expect(rows.find((r) => r.city === "A")!.congestion).toBe(5);
  });

  test("the change metric without an hour falls back to the corpus's last slot", () => {
    const rows = rankedCityRows(data, { ...ALL, metric: "change" });
    const atLastSlot = rankedCityRows(data, { ...ALL, hour: 22, metric: "change" });
    expect(rows.map((r) => r.congestion)).toEqual(atLastSlot.map((r) => r.congestion));
    // 22:00 against 20:00: A (30-1) early and (30-8) late -> 25.5; B (20-40) and (20-8) -> -4.
    expect(rows.find((r) => r.city === "A")!.congestion).toBeCloseTo(25.5, 6);
    expect(rows.find((r) => r.city === "B")!.congestion).toBeCloseTo(-4, 6);
  });

  test("the change metric follows the road-class filter's own series and network", () => {
    const rows = rankedCityRows(data, {
      ...ALL,
      roadClass: "highway",
      hour: 20,
      metric: "change",
    });
    // A: 5-60 = -55 early, 10-2 = +8 late -> -23.5. B: 45-12 = +33 every day.
    expect(names(rows)).toEqual(["B", "A"]);
    expect(rows[0]!.congestion).toBe(33);
    expect(rows[1]!.congestion).toBeCloseTo(-23.5, 6);
    expect(rows[0]!.capacityKm).toBe(20);
    expect(rows[0]!.coveragePct).toBe(65);
  });
});

describe("rankedCityRows - a dataset without the dated series", () => {
  const undatedHourly: HourlyRow[] = [
    ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({
      city: "A",
      dayOfWeek: d,
      hour: 8,
      congestionIndex: 10,
    })),
    ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({
      city: "B",
      dayOfWeek: d,
      hour: 8,
      congestionIndex: 30,
    })),
    ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 6, congestionIndex: 4 })),
    ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({
      city: "B",
      dayOfWeek: d,
      hour: 6,
      congestionIndex: 20,
    })),
  ];
  const undated = {
    cities: data.cities,
    hourly: undatedHourly,
    roadClasses,
    roadClassesHourly: [] as RoadClassHourlyRow[],
    hourlyDated: [] as DatedHourlyRow[],
  } as Pick<Dataset, "cities" | "hourly" | "roadClasses" | "roadClassesHourly" | "hourlyDated">;

  test("the day window is ignored rather than half-applied", () => {
    const all = rankedCityRows(undated, { ...ALL, hour: 8 });
    const narrowed = rankedCityRows(undated, { ...ALL, hour: 8, dates: window(0, 3) });
    expect(narrowed.map((r) => r.congestion)).toEqual(all.map((r) => r.congestion));
    expect(names(all)).toEqual(["B", "A"]);
    expect(all[0]!.congestion).toBe(30);
  });

  test("the change metric still uses the weekday series", () => {
    const rows = rankedCityRows(undated, { ...ALL, hour: 8, metric: "change" });
    // 08:00 against 06:00 on every weekday: A +6, B +10.
    expect(rows.find((r) => r.city === "A")!.congestion).toBe(6);
    expect(rows.find((r) => r.city === "B")!.congestion).toBe(10);
  });
});
