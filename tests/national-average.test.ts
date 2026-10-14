import { describe, expect, test } from "bun:test";
import { nationalAverage, type CityRow } from "../src/lib/traffic";

const city = (
  name: string,
  population: number,
  congestionIndex: number,
  dayChange: number,
): CityRow => ({
  city: name,
  wilaya: name,
  population,
  congestionIndex,
  previousIndex: congestionIndex,
  dayChange,
  freeFlowMinPer10km: 0,
  peakAmDelayMin: 0,
  peakPmDelayMin: 0,
  latitude: 0,
  longitude: 0,
  coveragePct: 0,
  capacityKm: 0,
  nAreas: 0,
  nSnapshots: 0,
  highwaySharePct: 0,
});

describe("nationalAverage", () => {
  test("weights the index by population", () => {
    // A (pop 3) 20 pts, B (pop 1) 8 pts -> (3x20 + 1x8) / 4
    const national = nationalAverage([city("A", 3, 20, 0), city("B", 1, 8, 0)]);
    expect(national.index).toBe(17);
  });

  test("reports the population-weighted day-over-day change", () => {
    // A (pop 2) +1 pt, B (pop 1) -1 pt -> (2x1 + 1x-1) / 3
    const national = nationalAverage([city("A", 2, 20, 1), city("B", 1, 8, -1)]);
    expect(national.dayChange).toBeCloseTo(1 / 3, 6);
  });

  test("averages only the cities that carry a day-over-day figure", () => {
    // An uploaded cities.csv without day_change parses it as NaN: that city drops out and
    // B's own figure stands alone.
    const national = nationalAverage([city("A", 5, 20, Number.NaN), city("B", 1, 8, -2)]);
    expect(national.dayChange).toBe(-2);
  });

  test("reports NaN when no city carries a day-over-day figure", () => {
    const national = nationalAverage([city("A", 1, 20, Number.NaN)]);
    expect(Number.isNaN(national.dayChange)).toBe(true);
  });
});
