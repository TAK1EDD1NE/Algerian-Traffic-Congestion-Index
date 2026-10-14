import { describe, expect, test } from "bun:test";
import {
  rankedCityRows,
  type CityRow,
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

/**
 * A: busy on workdays, calm at the weekend, terrible on highways — and quiet in the 20:00
 * slot. B is flat at 08:00 and gridlocked at 20:00, so the hour filter swaps the order.
 * Each class carries its own network: A is 30 km of highway + 70 km of normal routes,
 * B is 20 + 30, against city totals of 100 and 50.
 */
const hourly: HourlyRow[] = [
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 8, congestionIndex: 30 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 8, congestionIndex: 4 })),
  ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 8, congestionIndex: 10 })),
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 20, congestionIndex: 1 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 20, congestionIndex: 8 })),
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "B", dayOfWeek: d, hour: 20, congestionIndex: 40 })),
  ...[5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 20, congestionIndex: 8 })),
];

const roadClassesHourly: RoadClassHourlyRow[] = [
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 8,
    congestionIndex: 60,
  })),
  ...[5, 6].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 8,
    congestionIndex: 2,
  })),
  ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({
    city: "B",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 8,
    congestionIndex: 12,
  })),
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 20,
    congestionIndex: 5,
  })),
  ...[5, 6].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 20,
    congestionIndex: 10,
  })),
  ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({
    city: "B",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 20,
    congestionIndex: 45,
  })),
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
  hourly,
  roadClasses,
  roadClassesHourly,
} as Pick<Dataset, "cities" | "hourly" | "roadClasses" | "roadClassesHourly">;

/**
 * Slot-to-slot change needs the slot BEFORE the one under test, so this fixture carries
 * 18:00 (before 20:00), 22:00 and 00:00 (the day-boundary wrap) next to the 20:00 slot the
 * change tests score on. A's evening is calm and B's is gridlocked, but A *rises* into the
 * 20:00 slot while B *falls* into it, so the change ranking is the reverse of the level one.
 */
const deltaHourly: HourlyRow[] = [
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 18, congestionIndex: 0 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 18, congestionIndex: 7 })),
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "B", dayOfWeek: d, hour: 18, congestionIndex: 45 })),
  ...[5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 18, congestionIndex: 10 })),

  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 20, congestionIndex: 1 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 20, congestionIndex: 8 })),
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "B", dayOfWeek: d, hour: 20, congestionIndex: 40 })),
  ...[5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 20, congestionIndex: 8 })),

  // The end of the day and the start of the next one, for the 00:00 wrap.
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 22, congestionIndex: 30 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 22, congestionIndex: 3 })),
  ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 22, congestionIndex: 20 })),
  ...[0, 1, 2, 3, 4].map((d) => ({ city: "A", dayOfWeek: d, hour: 0, congestionIndex: 5 })),
  ...[5, 6].map((d) => ({ city: "A", dayOfWeek: d, hour: 0, congestionIndex: 6 })),
  ...[0, 1, 2, 3, 4, 5, 6].map((d) => ({ city: "B", dayOfWeek: d, hour: 0, congestionIndex: 20 })),
];

const deltaRoadClassesHourly: RoadClassHourlyRow[] = [
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 18,
    congestionIndex: 40,
  })),
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "B",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 18,
    congestionIndex: 50,
  })),
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "A",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 20,
    congestionIndex: 5,
  })),
  ...[0, 1, 2, 3, 4].map((d) => ({
    city: "B",
    roadClass: "highway" as const,
    dayOfWeek: d,
    hour: 20,
    congestionIndex: 45,
  })),
];

const deltaData = {
  ...data,
  hourly: deltaHourly,
  roadClassesHourly: deltaRoadClassesHourly,
} as Pick<Dataset, "cities" | "hourly" | "roadClasses" | "roadClassesHourly">;

const names = (rows: { city: string }[]) => rows.map((r) => r.city);
const ALL = { dayKey: "all", roadClass: "combined", hour: null, metric: "level" } as const;

describe("rankedCityRows", () => {
  test("default state keeps the canonical index, order and network", () => {
    const rows = rankedCityRows(data, { ...ALL });
    expect(names(rows)).toEqual(["A", "B"]);
    expect(rows[0]!.congestion).toBe(20); // cities.csv value, not the hourly mean
    expect(rows[0]!.capacityKm).toBe(100); // city network
  });

  test("a day group recomputes the mean over exactly those days", () => {
    const weekday = rankedCityRows(data, { ...ALL, dayKey: "weekday" });
    expect(names(weekday)).toEqual(["B", "A"]);
    expect(weekday[0]!.congestion).toBe(25); // B: (5x10 + 5x40) / 10

    const weekend = rankedCityRows(data, { ...ALL, dayKey: "weekend" });
    expect(names(weekend)).toEqual(["B", "A"]);
    expect(weekend[0]!.congestion).toBe(9); // B: (2x10 + 2x8) / 4
  });

  test("the hour filter narrows to one 2-hour slot and can flip the ranking", () => {
    const morning = rankedCityRows(data, { ...ALL, hour: 8 });
    expect(names(morning)).toEqual(["A", "B"]);
    expect(morning[0]!.congestion).toBeCloseTo(158 / 7, 6); // A: (5x30 + 2x4) / 7

    const evening = rankedCityRows(data, { ...ALL, hour: 20 });
    expect(names(evening)).toEqual(["B", "A"]);
    expect(evening[0]!.congestion).toBeCloseTo(216 / 7, 6); // B: (5x40 + 2x8) / 7
    expect(evening[1]!.congestion).toBe(3); // A: (5x1 + 2x8) / 7
  });

  test("day, class and hour compose", () => {
    const rows = rankedCityRows(data, {
      ...ALL,
      dayKey: "weekday",
      roadClass: "highway",
      hour: 20,
    });
    expect(names(rows)).toEqual(["B", "A"]);
    expect(rows[0]!.congestion).toBe(45); // B highway, weekday 20:00
    expect(rows[1]!.congestion).toBe(5);
    expect(rows[0]!.coveragePct).toBe(65); // highway coverage, not the city's 80
    expect(rows[0]!.capacityKm).toBe(20); // highway network, not the city's 50
    expect(rows[1]!.capacityKm).toBe(30);
  });

  test("a road class scores on that class's own hours and network", () => {
    const rows = rankedCityRows(data, { ...ALL, dayKey: "weekend", roadClass: "highway" });
    expect(names(rows)).toEqual(["B", "A"]);
    expect(rows[0]!.congestion).toBe(28.5); // B: (2x12 + 2x45) / 4
    expect(rows[1]!.congestion).toBe(6); // A: (2x2 + 2x10) / 4
    expect(rows[1]!.coveragePct).toBe(70);
    expect(rows[1]!.capacityKm).toBe(30);

    const normal = rankedCityRows(data, { ...ALL, roadClass: "normal" });
    const a = normal.find((r) => r.city === "A")!;
    expect(a.capacityKm).toBe(70); // the normal-route network
    expect(a.coveragePct).toBe(95);
  });

  test("the change metric scores the selected slot against the slot before it", () => {
    const rows = rankedCityRows(deltaData, { ...ALL, hour: 20, metric: "change" });
    // A rises into 20:00 (+1) while B falls into it (-29/7), so the order is the reverse of
    // the level ranking at the same slot.
    expect(names(rows)).toEqual(["A", "B"]);
    expect(rows[0]!.congestion).toBe(1); // A: (5x(1-0) + 2x(8-7)) / 7
    expect(rows[1]!.congestion).toBeCloseTo(-29 / 7, 6); // B: (5x(40-45) + 2x(8-10)) / 7

    const level = rankedCityRows(deltaData, { ...ALL, hour: 20 });
    expect(names(level)).toEqual(["B", "A"]);
  });

  test("the change metric averages the slot transition over the selected days", () => {
    const weekday = rankedCityRows(deltaData, {
      ...ALL,
      dayKey: "weekday",
      hour: 20,
      metric: "change",
    });
    expect(weekday[0]!.congestion).toBe(1); // A: 1 - 0
    expect(weekday[1]!.congestion).toBe(-5); // B: 40 - 45

    const weekend = rankedCityRows(deltaData, {
      ...ALL,
      dayKey: "weekend",
      hour: 20,
      metric: "change",
    });
    expect(weekend[1]!.congestion).toBe(-2); // B: 8 - 10
  });

  test("the change at 00:00 is measured against 22:00 of the previous day", () => {
    const rows = rankedCityRows(deltaData, {
      ...ALL,
      dayKey: "weekday",
      hour: 0,
      metric: "change",
    });
    // A: Sunday 00:00 (5) follows Saturday 22:00 (3) -> +2, the rest follow their own 22:00 (30).
    expect(names(rows)).toEqual(["B", "A"]);
    expect(rows.find((r) => r.city === "A")!.congestion).toBeCloseTo((2 + 4 * -25) / 5, 6); // -19.6
    expect(rows.find((r) => r.city === "B")!.congestion).toBe(0);
  });

  test("the change metric follows the road-class filter's own series and network", () => {
    const rows = rankedCityRows(deltaData, {
      ...ALL,
      roadClass: "highway",
      hour: 20,
      metric: "change",
    });
    expect(names(rows)).toEqual(["B", "A"]); // B: 45 - 50 = -5, A: 5 - 40 = -35
    expect(rows[0]!.congestion).toBe(-5);
    expect(rows[1]!.congestion).toBe(-35);
    expect(rows[0]!.capacityKm).toBe(20); // the highway network, not the city's 50
    expect(rows[0]!.coveragePct).toBe(65); // highway coverage, not the city's 80
  });

  test("the change metric without an hour falls back to the corpus's last slot", () => {
    const rows = rankedCityRows(deltaData, { ...ALL, metric: "change" });
    const atLastSlot = rankedCityRows(deltaData, { ...ALL, hour: 22, metric: "change" });
    expect(rows.map((r) => r.congestion)).toEqual(atLastSlot.map((r) => r.congestion));
    // 22:00 against 20:00, not the city's period gap (A is 20 - 18 = +2).
    expect(rows.find((r) => r.city === "A")!.congestion).toBeCloseTo(135 / 7, 6);
  });

  test("monitored areas stay city-wide whatever the filters", () => {
    const rows = rankedCityRows(data, { ...ALL, dayKey: "weekend", roadClass: "normal", hour: 20 });
    expect(rows.find((r) => r.city === "A")!.nAreas).toBe(3);
    expect(rows.find((r) => r.city === "B")!.nAreas).toBe(2);
  });
});
