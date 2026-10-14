import { queryOptions } from "@tanstack/react-query";
import { formatNumber } from "@/i18n/format";
import { BCP47, type Locale } from "@/i18n/locale";
import { parseCsv, num, type CsvRow } from "./csv";

const g = (r: CsvRow, k: string) => r[k] ?? "";

export type CityRow = {
  city: string;
  wilaya: string;
  population: number;
  congestionIndex: number;
  previousIndex: number;
  /**
   * The city's index on the latest day that can be compared with the day before it, minus
   * that previous day's index (both measured over the slots the two days share). NaN when
   * the dataset carries no `day_change` column.
   */
  dayChange: number;
  freeFlowMinPer10km: number;
  peakAmDelayMin: number;
  peakPmDelayMin: number;
  latitude: number;
  longitude: number;
  coveragePct: number;
  capacityKm: number;
  nAreas: number;
  nSnapshots: number;
  highwaySharePct: number;
};

export type HourlyRow = { city: string; dayOfWeek: number; hour: number; congestionIndex: number };
export type MonthlyRow = { city: string; year: number; month: number; congestionIndex: number };
export type AreaRow = {
  city: string;
  area: number;
  congestionIndex: number;
  freeflowRaw: number;
  capacityKm: number;
  avgCoveragePct: number;
  nSnapshots: number;
};
export type ColorClass = "green" | "yellow" | "red" | "dark_red";
export type ColorCompRow = {
  city: string;
  class: ColorClass;
  normalPct: number;
  highwayPct: number;
};
export type DailyRow = { city: string; date: string; dayOfWeek: number; congestionIndex: number };
export type RoadClassRow = {
  city: string;
  roadClass: "highway" | "normal";
  congestionIndex: number;
  calmFloor: number;
  coveragePct: number;
  capacityKm: number;
};
export type HourlyDeltaRow = { city: string; fromHour: number; toHour: number; delta: number };
export type RoadClassHourlyRow = {
  city: string;
  roadClass: "highway" | "normal";
  dayOfWeek: number;
  hour: number;
  congestionIndex: number;
};

export type Dataset = {
  cities: CityRow[];
  hourly: HourlyRow[];
  monthly: MonthlyRow[];
  areas: AreaRow[];
  colorComp: ColorCompRow[];
  daily: DailyRow[];
  roadClasses: RoadClassRow[];
  hourlyDelta: HourlyDeltaRow[];
  roadClassesHourly: RoadClassHourlyRow[];
  source: "bundled" | "uploaded";
};

/** Display keys for the weekday labels, indexed by day-of-week (Sun=0 … Sat=6). Render with t(DAYS_KEY[dow]). */
export const DAYS_KEY = [
  "common.days.sun",
  "common.days.mon",
  "common.days.tue",
  "common.days.wed",
  "common.days.thu",
  "common.days.fri",
  "common.days.sat",
] as const;
export const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const STORAGE_KEYS = {
  // v2.2: cities.csv gained day_change (the day-over-day figure the home card shows), so
  // stale cached copies are ignored — bump this prefix again on any column-shape change.
  cities: "dz-traffic:v22:cities.csv",
  hourly: "dz-traffic:v22:hourly.csv",
  monthly: "dz-traffic:v22:monthly.csv",
} as const;

export type DatasetKey = keyof typeof STORAGE_KEYS;

export const CSV_SCHEMA: Record<DatasetKey, string[]> = {
  cities: [
    "city",
    "wilaya",
    "population",
    "congestion_index",
    "previous_index",
    "time_lost_hours",
    "free_flow_min_per_10km",
    "peak_am_delay_min",
    "peak_pm_delay_min",
    "latitude",
    "longitude",
  ],
  hourly: ["city", "day_of_week", "hour", "congestion_index"],
  monthly: ["city", "year", "month", "congestion_index"],
};

/** Optional v2 datasets: fetched when present, silently skipped otherwise. */
async function fetchOptionalCsv(name: string): Promise<string | null> {
  try {
    const res = await fetch(`/data/${name}.csv`);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function readCsv(key: DatasetKey): Promise<{ text: string; uploaded: boolean }> {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEYS[key]);
    if (stored) return { text: stored, uploaded: true };
  }
  const res = await fetch(`/data/${key}.csv`);
  if (!res.ok) throw new Error(`Unable to load ${key}.csv`);
  return { text: await res.text(), uploaded: false };
}

export function parseDataset(
  citiesText: string,
  hourlyText: string,
  monthlyText: string,
): Pick<Dataset, "cities" | "hourly" | "monthly"> {
  const cities: CityRow[] = parseCsv(citiesText).map((r) => ({
    city: g(r, "city"),
    wilaya: g(r, "wilaya") || g(r, "city"),
    population: num(g(r, "population")),
    congestionIndex: num(g(r, "congestion_index")),
    previousIndex: num(g(r, "previous_index"), num(g(r, "congestion_index"))),
    // num() reads an empty cell as 0, so absence is checked on the raw text: a dataset
    // without the column reports NaN and the home card hides its change line.
    dayChange: g(r, "day_change").trim() === "" ? Number.NaN : num(g(r, "day_change")),
    freeFlowMinPer10km: num(g(r, "free_flow_min_per_10km")),
    peakAmDelayMin: num(g(r, "peak_am_delay_min")),
    peakPmDelayMin: num(g(r, "peak_pm_delay_min")),
    latitude: num(g(r, "latitude")),
    longitude: num(g(r, "longitude")),
    coveragePct: num(g(r, "coverage_pct"), 100),
    capacityKm: num(g(r, "capacity_km")),
    nAreas: num(g(r, "n_areas")),
    nSnapshots: num(g(r, "n_snapshots")),
    highwaySharePct: num(g(r, "highway_share_pct")),
  }));

  const hourly: HourlyRow[] = parseCsv(hourlyText).map((r) => ({
    city: g(r, "city"),
    dayOfWeek: num(g(r, "day_of_week")),
    hour: num(g(r, "hour")),
    congestionIndex: num(g(r, "congestion_index")),
  }));

  const monthly: MonthlyRow[] = parseCsv(monthlyText).map((r) => ({
    city: g(r, "city"),
    year: num(g(r, "year")),
    month: num(g(r, "month")),
    congestionIndex: num(g(r, "congestion_index")),
  }));

  return {
    cities: cities.filter((c) => c.city).sort((a, b) => b.congestionIndex - a.congestionIndex),
    hourly,
    monthly,
  };
}

function parseOptional(texts: {
  areas: string | null;
  colorComp: string | null;
  daily: string | null;
  roadClasses: string | null;
  hourlyDelta: string | null;
  roadClassesHourly: string | null;
}): {
  areas: AreaRow[];
  colorComp: ColorCompRow[];
  daily: DailyRow[];
  roadClasses: RoadClassRow[];
  hourlyDelta: HourlyDeltaRow[];
  roadClassesHourly: RoadClassHourlyRow[];
} {
  const areas: AreaRow[] = texts.areas
    ? parseCsv(texts.areas).map((r) => ({
        city: g(r, "city"),
        area: num(g(r, "area")),
        congestionIndex: num(g(r, "congestion_index")),
        freeflowRaw: num(g(r, "freeflow_raw")),
        capacityKm: num(g(r, "capacity_km")),
        avgCoveragePct: num(g(r, "avg_coverage_pct")),
        nSnapshots: num(g(r, "n_snapshots")),
      }))
    : [];
  const colorComp: ColorCompRow[] = texts.colorComp
    ? parseCsv(texts.colorComp).map((r) => ({
        city: g(r, "city"),
        class: g(r, "class") as ColorClass,
        normalPct: num(g(r, "normal_pct")),
        highwayPct: num(g(r, "highway_pct")),
      }))
    : [];
  const daily: DailyRow[] = texts.daily
    ? parseCsv(texts.daily).map((r) => ({
        city: g(r, "city"),
        date: g(r, "date"),
        dayOfWeek: num(g(r, "day_of_week")),
        congestionIndex: num(g(r, "congestion_index")),
      }))
    : [];
  const roadClasses: RoadClassRow[] = texts.roadClasses
    ? parseCsv(texts.roadClasses).map((r) => ({
        city: g(r, "city"),
        roadClass: g(r, "road_class") as "highway" | "normal",
        congestionIndex: num(g(r, "congestion_index")),
        calmFloor: num(g(r, "calm_floor")),
        coveragePct: num(g(r, "coverage_pct")),
        capacityKm: num(g(r, "capacity_km")),
      }))
    : [];
  const hourlyDelta: HourlyDeltaRow[] = texts.hourlyDelta
    ? parseCsv(texts.hourlyDelta).map((r) => ({
        city: g(r, "city"),
        fromHour: num(g(r, "from_hour")),
        toHour: num(g(r, "to_hour")),
        delta: num(g(r, "delta")),
      }))
    : [];
  const roadClassesHourly: RoadClassHourlyRow[] = texts.roadClassesHourly
    ? parseCsv(texts.roadClassesHourly).map((r) => ({
        city: g(r, "city"),
        roadClass: g(r, "road_class") as "highway" | "normal",
        dayOfWeek: num(g(r, "day_of_week")),
        hour: num(g(r, "hour")),
        congestionIndex: num(g(r, "congestion_index")),
      }))
    : [];
  return { areas, colorComp, daily, roadClasses, hourlyDelta, roadClassesHourly };
}

export async function loadDataset(): Promise<Dataset> {
  const [c, h, m, a, cc, d, rc, hd, rch] = await Promise.all([
    readCsv("cities"),
    readCsv("hourly"),
    readCsv("monthly"),
    fetchOptionalCsv("areas"),
    fetchOptionalCsv("color_composition"),
    fetchOptionalCsv("daily"),
    fetchOptionalCsv("road_classes"),
    fetchOptionalCsv("hourly_delta"),
    fetchOptionalCsv("road_classes_hourly"),
  ]);
  const base = parseDataset(c.text, h.text, m.text);
  const extra = parseOptional({
    areas: a,
    colorComp: cc,
    daily: d,
    roadClasses: rc,
    hourlyDelta: hd,
    roadClassesHourly: rch,
  });
  return {
    ...base,
    ...extra,
    source: c.uploaded || h.uploaded || m.uploaded ? "uploaded" : "bundled",
  };
}

export const datasetQuery = queryOptions({
  queryKey: ["traffic-dataset"],
  queryFn: loadDataset,
  staleTime: 5 * 60 * 1000,
});

/* ---------- derived helpers ---------- */

export type Level = "free" | "moderate" | "high" | "critical";

export function level(index: number): Level {
  if (index >= 14) return "critical";
  if (index >= 11) return "high";
  if (index >= 7) return "moderate";
  return "free";
}

export const LEVEL_LABEL_KEY = {
  critical: "level.critical",
  high: "level.high",
  moderate: "level.moderate",
  free: "level.free",
} as const satisfies Record<Level, string>;

export const LEVEL_VAR: Record<Level, string> = {
  critical: "var(--critical)",
  high: "var(--high)",
  moderate: "var(--moderate)",
  free: "var(--free)",
};

export const levelColor = (index: number) => LEVEL_VAR[level(index)];

/** The corpus's last 2-hour slot; a slot-to-slot change falls back to it. */
export const LAST_SLOT = 22;

/**
 * The 2-hour slot before `hour` on the app's calendar (Sun=0 … Sat=6): 00:00 follows
 * 22:00 of the previous day, so a slot-to-slot change never spans more than one step.
 */
export function previousSlot(hour: number, dayOfWeek: number) {
  return hour === 0
    ? { hour: LAST_SLOT, dayOfWeek: (dayOfWeek + 6) % 7 }
    : { hour: hour - 2, dayOfWeek };
}

export function nationalAverage(cities: CityRow[]) {
  if (!cities.length) return { index: 0, dayChange: Number.NaN };
  const weight = cities.reduce((s, c) => s + c.population, 0) || cities.length;
  const w = (pick: (c: CityRow) => number) =>
    cities.reduce((s, c) => s + pick(c) * (c.population || 1), 0) / weight;
  const index = w((c) => c.congestionIndex);
  // Day-over-day: the population weights are fixed, so the weighted mean of the per-city
  // day changes is the change of the weighted index itself. Cities without the figure
  // (an uploaded CSV) drop out rather than counting as zero.
  const measured = cities.filter((c) => Number.isFinite(c.dayChange));
  const dayChange = measured.length
    ? measured.reduce((s, c) => s + c.dayChange * (c.population || 1), 0) /
      measured.reduce((s, c) => s + (c.population || 1), 0)
    : Number.NaN;
  return { index, dayChange };
}

export function hourlyProfile(hourly: HourlyRow[], city?: string) {
  const rows = city ? hourly.filter((r) => r.city === city) : hourly;
  // measurements come in 2-hour slots; build the profile over 12 slots
  return Array.from({ length: 12 }, (_, s) => {
    const hour = s * 2;
    const workday = rows.filter((r) => r.hour === hour && r.dayOfWeek >= 0 && r.dayOfWeek <= 4);
    const weekend = rows.filter((r) => r.hour === hour && (r.dayOfWeek === 5 || r.dayOfWeek === 6));
    const avg = (list: HourlyRow[]) =>
      list.length ? list.reduce((sum, r) => sum + r.congestionIndex, 0) / list.length : 0;
    return {
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      workday: Number(avg(workday).toFixed(1)),
      weekend: Number(avg(weekend).toFixed(1)),
    };
  });
}

export function heatmapMatrix(hourly: HourlyRow[], city: string) {
  const rowsH = hourly.filter((r) => r.city === city);
  // 7 days x 12 two-hour slots
  const matrix: number[][] = Array.from({ length: 7 }, () => Array(12).fill(0));
  rowsH.forEach((r) => {
    const s = Math.floor(r.hour / 2);
    if (r.dayOfWeek >= 0 && r.dayOfWeek < 7 && s >= 0 && s < 12)
      matrix[r.dayOfWeek]![s] = r.congestionIndex;
  });
  return matrix;
}

export function monthlySeries(monthly: MonthlyRow[], city: string) {
  const rows = monthly
    .filter((r) => r.city === city)
    .sort((a, b) => a.year - b.year || a.month - b.month);
  return rows.map((r) => ({
    label: `${MONTHS[r.month - 1]} ${String(r.year).slice(2)}`,
    year: r.year,
    month: r.month,
    index: r.congestionIndex,
  }));
}

/* ---------- v2 dataset helpers ---------- */

/** Google traffic colors mapped onto the app's level palette. */
export const CLASS_COLOR: Record<ColorClass, string> = {
  green: "var(--free)",
  yellow: "var(--moderate)",
  red: "var(--high)",
  dark_red: "var(--critical)",
};

export const CLASS_LABEL_KEY = {
  green: "class.green",
  yellow: "class.yellow",
  red: "class.red",
  dark_red: "class.dark_red",
} as const satisfies Record<ColorClass, string>;

/** Per-date congestion series for one city (sorted by date). */
export function dailyCitySeries(daily: DailyRow[], city: string) {
  return daily
    .filter((r) => r.city === city)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((r) => ({ label: r.date.slice(5), value: r.congestionIndex }));
}

/**
 * First and last date of the daily series, formatted for `locale` — the window the
 * screenshots cover. Returns null when there is no series to bound it.
 */
export function captureWindow(
  daily: DailyRow[],
  locale: Locale,
): { from: string; to: string } | null {
  const dates = daily.map((r) => r.date).sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (!first || !last) return null;
  const dayMonthYear = new Intl.DateTimeFormat(BCP47[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  /** Parse a `YYYY-MM-DD` dataset date as local midnight (avoids a UTC day-shift). */
  const parse = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
  };
  return { from: dayMonthYear.format(parse(first)), to: dayMonthYear.format(parse(last)) };
}

/* ---------- rankings page: filters ---------- */

export type RankingFilters = {
  dayKey: "all" | "weekday" | "weekend";
  roadClass: "combined" | "highway" | "normal";
  /**
   * A 2-hour slot (0, 2, … 22) or null for every slot. Snapshots arrive roughly every two
   * hours, so these twelve slots are the finest time resolution the corpus carries — there
   * is no true hourly series to filter on.
   */
  hour: number | null;
  metric: "level" | "change";
};

export type RankingRow = {
  city: string;
  wilaya: string;
  /** Congestion index, or mean slot-to-slot change when the change metric is active. */
  congestion: number;
  coveragePct: number;
  capacityKm: number;
  nAreas: number;
};

/** The app's week: Sun–Thu (dow 0–4) is the work week, Fri–Sat (5–6) the weekend. */
const RANKING_DAYS: Record<RankingFilters["dayKey"], number[]> = {
  all: [0, 1, 2, 3, 4, 5, 6],
  weekday: [0, 1, 2, 3, 4],
  weekend: [5, 6],
};

export type RankingInput = Pick<Dataset, "cities" | "hourly" | "roadClasses" | "roadClassesHourly">;

/**
 * One row per city, ordered worst-first for the active filters.
 *
 * Level + all days + all roads reuses the canonical cities.csv index so the table agrees
 * with the home ranking and the city reports; any narrower window is recomputed from the
 * hourly series (the canonical figure is coverage-weighted, and the two differ by up to
 * ~1.3 pts). The hour filter narrows to a single 2-hour slot (or all of them). The change
 * metric compares the selected slot with the slot before it — the same slot-to-slot
 * transition the explorer's "how fast congestion changes" chart plots (positive = worse) —
 * averaged over the selected days and computed on the selected class's own series, so every
 * filter applies to it. "All hours" has no slot before it, so it falls back to the corpus's
 * last slot (22:00) and the page pins the dropdown to a slot while the metric is active.
 * Network size follows the road-class filter — each class carries its own reference network —
 * while monitored-area counts are city-wide and never move.
 */
export function rankedCityRows(data: RankingInput, filters: RankingFilters): RankingRow[] {
  const days = RANKING_DAYS[filters.dayKey];
  const inSlot = (hour: number) => filters.hour === null || hour === filters.hour;
  const canonical =
    filters.metric === "level" &&
    filters.dayKey === "all" &&
    filters.roadClass === "combined" &&
    filters.hour === null;
  const classRow = (city: string, roadClass: "highway" | "normal") =>
    data.roadClasses.find((r) => r.city === city && r.roadClass === roadClass);
  const avg = (values: number[]) =>
    values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

  const rows: RankingRow[] = data.cities.map((c) => {
    let congestion: number;
    if (filters.metric === "change") {
      const slot = filters.hour ?? LAST_SLOT;
      // One city × day × slot reading, from the class's own series when a class is picked.
      const at = (dayOfWeek: number, hour: number): number | null => {
        const values =
          filters.roadClass === "combined"
            ? data.hourly
                .filter((r) => r.city === c.city && r.dayOfWeek === dayOfWeek && r.hour === hour)
                .map((r) => r.congestionIndex)
            : data.roadClassesHourly
                .filter(
                  (r) =>
                    r.city === c.city &&
                    r.roadClass === filters.roadClass &&
                    r.dayOfWeek === dayOfWeek &&
                    r.hour === hour,
                )
                .map((r) => r.congestionIndex);
        return values.length ? avg(values) : null;
      };
      // A day whose earlier slot is missing (no capture) drops out instead of scoring the
      // slot as a fall from zero.
      const deltas = days
        .map((d) => {
          const before = previousSlot(slot, d);
          const now = at(d, slot);
          const prev = at(before.dayOfWeek, before.hour);
          return now === null || prev === null ? null : now - prev;
        })
        .filter((v): v is number => v !== null);
      congestion = avg(deltas);
    } else if (canonical) {
      congestion = c.congestionIndex;
    } else if (filters.roadClass === "combined") {
      congestion = avg(
        data.hourly
          .filter((r) => r.city === c.city && days.includes(r.dayOfWeek) && inSlot(r.hour))
          .map((r) => r.congestionIndex),
      );
    } else {
      congestion = avg(
        data.roadClassesHourly
          .filter(
            (r) =>
              r.city === c.city &&
              r.roadClass === filters.roadClass &&
              days.includes(r.dayOfWeek) &&
              inSlot(r.hour),
          )
          .map((r) => r.congestionIndex),
      );
    }
    // Visibility and network follow the selected class (the change metric now scores on that
    // class's own series too); the city-wide values apply to the combined case.
    const cls = filters.roadClass !== "combined" ? classRow(c.city, filters.roadClass) : undefined;
    return {
      city: c.city,
      wilaya: c.wilaya,
      congestion,
      coveragePct: cls ? cls.coveragePct : c.coveragePct,
      // Each class carries its own reference network, so the km figure follows the filter.
      capacityKm: cls ? cls.capacityKm : c.capacityKm,
      nAreas: c.nAreas,
    };
  });

  // Worst first. Array.sort is stable, so equal values keep their canonical order.
  return rows.sort((a, b) => b.congestion - a.congestion);
}

/** National mean per date across all cities (sorted by date). */
export function dailyNationalSeries(daily: DailyRow[]) {
  const byDate = new Map<string, { sum: number; n: number }>();
  for (const r of daily) {
    const e = byDate.get(r.date) ?? { sum: 0, n: 0 };
    e.sum += r.congestionIndex;
    e.n += 1;
    byDate.set(r.date, e);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, e]) => ({
      label: date.slice(5),
      value: Number((e.sum / e.n || 0).toFixed(1)),
    }));
}

/**
 * Filterable hourly profile: city x day-group x slot.
 * dayGroup: "all" | "workday" (Sun-Thu) | "weekend" (Fri-Sat) | a specific dow number.
 * roadClass: undefined = combined index; "highway"/"normal" = class-specific index
 * from road_classes_hourly.csv when available.
 */
export function filteredHourlyProfile(
  hourly: HourlyRow[],
  opts: { city?: string; days: number[] },
  roadClassesHourly?: RoadClassHourlyRow[],
  roadClass?: "highway" | "normal",
) {
  if (roadClass && roadClassesHourly?.length) {
    const rowsC = roadClassesHourly.filter(
      (r) =>
        (!opts.city || r.city === opts.city) &&
        opts.days.includes(r.dayOfWeek) &&
        r.roadClass === roadClass,
    );
    return Array.from({ length: 12 }, (_, s) => {
      const hour = s * 2;
      const at = rowsC.filter((r) => r.hour === hour);
      const avg = at.length ? at.reduce((sum, r) => sum + r.congestionIndex, 0) / at.length : 0;
      return {
        hour,
        label: `${String(hour).padStart(2, "0")}:00`,
        value: Number(avg.toFixed(1)),
      };
    });
  }
  const rows = hourly.filter(
    (r) => (!opts.city || r.city === opts.city) && opts.days.includes(r.dayOfWeek),
  );
  return Array.from({ length: 12 }, (_, s) => {
    const hour = s * 2;
    const at = rows.filter((r) => r.hour === hour);
    const avg = at.length ? at.reduce((sum, r) => sum + r.congestionIndex, 0) / at.length : 0;
    return {
      hour,
      label: `${String(hour).padStart(2, "0")}:00`,
      value: Number(avg.toFixed(1)),
    };
  });
}

/** Mean delta per slot transition, optionally filtered by city. */
export function deltaSeries(hourlyDelta: HourlyDeltaRow[], city?: string) {
  const rowsH = city ? hourlyDelta.filter((r) => r.city === city) : hourlyDelta;
  const byTransition = new Map<string, { sum: number; n: number }>();
  for (const r of rowsH) {
    const k = `${r.fromHour}->${r.toHour}`;
    const e = byTransition.get(k) ?? { sum: 0, n: 0 };
    e.sum += r.delta;
    e.n += 1;
    byTransition.set(k, e);
  }
  return [...byTransition.entries()].map(([k, e]) => {
    const [from, to] = k.split("->").map(Number);
    return {
      label: `${String(from).padStart(2, "0")}→${String(to).padStart(2, "0")}`,
      from,
      to,
      value: Number((e.sum / e.n).toFixed(2)),
    };
  });
}

export function peakHour(profile: ReturnType<typeof hourlyProfile>) {
  return profile.reduce((best, p) => (p.workday > best.workday ? p : best), profile[0]!);
}

export const slug = (city: string) =>
  city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const fmt = (n: number, digits = 1, locale: Locale = "en") =>
  formatNumber(n, digits, locale);
