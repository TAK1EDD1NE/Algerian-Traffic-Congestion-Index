import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "@/components/data/ChartTooltip";
import { Panel, PageState } from "@/components/site/Panel";
import {
  datasetQuery,
  dailyCitySeries,
  dailyNationalSeries,
  deltaSeries,
  filteredHourlyProfile,
  fmt,
} from "@/lib/traffic";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Explorer — Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "Detailed congestion explorer: filter by city, weekday vs weekend and 2-hour time window; compare highways vs normal routes.",
      },
    ],
  }),
  component: ExplorerPage,
});

const DAY_GROUPS: { key: string; label: string; days: number[] }[] = [
  { key: "all", label: "All days", days: [0, 1, 2, 3, 4, 5, 6] },
  { key: "weekday", label: "Weekday (Sun–Thu)", days: [0, 1, 2, 3, 4] },
  { key: "weekend", label: "Weekend (Fri–Sat)", days: [5, 6] },
];
const ROAD_CLASSES: { key: "combined" | "highway" | "normal"; label: string }[] = [
  { key: "combined", label: "All roads" },
  { key: "highway", label: "Highways" },
  { key: "normal", label: "Normal routes" },
];
const DEFAULT_CITIES = ["Alger", "Oran", "Constantine", "Annaba"];
const LINE_COLORS = ["var(--signal)", "var(--critical)", "var(--moderate)", "var(--free)"];

const pill = (on: boolean) =>
  `rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
    on
      ? "bg-ink text-ink-foreground"
      : "border border-border text-muted-foreground hover:bg-secondary"
  }`;

function ExplorerPage() {
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [selected, setSelected] = useState<string[]>(DEFAULT_CITIES);
  const [dayKey, setDayKey] = useState("all");
  const [metric, setMetric] = useState<"level" | "change">("level");
  const [roadClass, setRoadClass] = useState<"combined" | "highway" | "normal">("combined");

  const cities = data?.cities ?? [];
  const toggleCity = (name: string) =>
    setSelected((prev) => {
      if (prev.includes(name)) return prev.filter((c) => c !== name);
      if (prev.length >= 4) return [...prev.slice(1), name];
      return [...prev, name];
    });

  const days = DAY_GROUPS.find((g) => g.key === dayKey)?.days ?? [0, 1, 2, 3, 4, 5, 6];

  const series = useMemo(() => {
    if (!data) return [];
    const targets = selected.length ? selected : [];
    return targets.map((city, i) => {
      const prof =
        metric === "level"
          ? filteredHourlyProfile(
              data.hourly,
              { city, days },
              data.roadClassesHourly,
              roadClass === "combined" ? undefined : roadClass,
            ).map((p) => ({
              label: p.label,
              value: p.value,
            }))
          : deltaSeries(data.hourlyDelta, city).map((d) => ({ label: d.label, value: d.value }));
      return { key: city, color: LINE_COLORS[i % LINE_COLORS.length], data: prof };
    });
  }, [data, selected, dayKey, metric, roadClass]);

  const merged = useMemo(() => {
    if (!series.length) return [];
    const labels = series[0]?.data.map((p) => p.label) ?? [];
    return labels.map((label, li) => {
      const row: Record<string, string | number> = { label };
      for (const s of series) row[s.key] = s.data[li]?.value ?? 0;
      return row;
    });
  }, [series]);

  const nationalDaily = useMemo(() => (data ? dailyNationalSeries(data.daily) : []), [data]);
  const singleDaily = useMemo(() => {
    const only = selected.length === 1 ? selected[0] : undefined;
    return data && only ? dailyCitySeries(data.daily, only) : [];
  }, [data, selected]);

  const classRows = useMemo(() => {
    if (!data || !selected.length) return [];
    return selected.map((city) => {
      const hwy = data.roadClasses.find((r) => r.city === city && r.roadClass === "highway");
      const nrm = data.roadClasses.find((r) => r.city === city && r.roadClass === "normal");
      return { city, highway: hwy?.congestionIndex ?? 0, normal: nrm?.congestionIndex ?? 0 };
    });
  }, [data, selected]);

  const worstWindow = useMemo(() => {
    if (!data) return null;
    let best: { city: string; label: string; value: number } | null = null;
    for (const city of selected.length ? selected : cities.map((c) => c.city)) {
      const prof = filteredHourlyProfile(
        data.hourly,
        { city, days },
        data.roadClassesHourly,
        roadClass === "combined" ? undefined : roadClass,
      );
      for (const p of prof) {
        if (!best || p.value > best.value) best = { city, label: p.label, value: p.value };
      }
    }
    return best;
  }, [data, selected, dayKey, roadClass]);

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">Explorer</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Slice the index by city, by weekday or weekend and by 2-hour window. Pick up to four
          cities to overlay their curves.
        </p>
      </header>

      {/* ---- filters ---- */}
      <Panel className="mb-8 p-6">
        <div className="mb-6">
          <div className="label-xs mb-3">
            Cities ({selected.length ? `${selected.length}/4 selected` : "national average shown"})
          </div>
          <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {cities.map((c) => {
              const on = selected.includes(c.city);
              return (
                <button
                  key={c.city}
                  onClick={() => toggleCity(c.city)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    on
                      ? "bg-ink text-ink-foreground"
                      : "border border-border text-muted-foreground hover:bg-secondary"
                  }`}
                  style={
                    on ? { background: "var(--signal)", color: "var(--background)" } : undefined
                  }
                >
                  {c.city}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="label-xs mb-3">Days</div>
            <div className="flex flex-col items-start gap-1.5">
              {DAY_GROUPS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setDayKey(g.key)}
                  className={pill(dayKey === g.key)}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-xs mb-3">Metric</div>
            <div className="flex flex-col items-start gap-1.5">
              {(["level", "change"] as const).map((m) => (
                <button key={m} onClick={() => setMetric(m)} className={pill(metric === m)}>
                  {m === "level" ? "Congestion level" : "Change vs previous window"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-xs mb-3">Road class</div>
            <div className="flex flex-col items-start gap-1.5">
              {ROAD_CLASSES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRoadClass(r.key)}
                  className={pill(roadClass === r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {roadClass !== "combined" && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Scored on that class's own capacity and calm level.
              </p>
            )}
          </div>
        </div>

        {worstWindow && metric === "level" && (
          <p className="num mt-6 text-[11px] text-muted-foreground">
            Worst window in view:{" "}
            <span className="font-semibold text-foreground">
              {worstWindow.city} {worstWindow.label}
            </span>{" "}
            at {fmt(worstWindow.value)}%
          </p>
        )}
      </Panel>

      {/* ---- main chart ---- */}
      <Panel className="mb-8 p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-bold">
              {metric === "level"
                ? "Congestion level by 2-hour window"
                : "How fast congestion changes"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {metric === "level"
                ? "Mean index for the selected days"
                : "Difference between consecutive 2-hour windows (positive = worsening)"}
              {" · "}
              {DAY_GROUPS.find((g) => g.key === dayKey)?.label}
              {roadClass !== "combined"
                ? ` · ${roadClass === "highway" ? "highways" : "normal routes"} only`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            {(selected.length ? series : []).map((s) => (
              <span key={s.key} className="flex items-center gap-1.5">
                <span
                  aria-hidden
                  className="inline-block h-1.5 w-4 rounded-full"
                  style={{ background: s.color }}
                />
                {s.key}
              </span>
            ))}
          </div>
        </div>
        {merged.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={merged} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                unit="%"
                tick={{
                  fontSize: 10,
                  fill: "var(--muted-foreground)",
                  fontFamily: "var(--font-mono)",
                }}
              />
              <Tooltip
                cursor={{ stroke: "var(--signal)", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={<ChartTooltip unit="%" />}
              />
              {series.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.key}
                  stroke={s.color}
                  strokeWidth={2.25}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
            Select one or more cities above to draw their curves.
          </div>
        )}
      </Panel>

      <div className="mb-8 grid gap-8 lg:grid-cols-2">
        {/* highways vs normal */}
        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Highways vs normal routes</h2>
            <p className="text-xs text-muted-foreground">
              Same index formula computed on each road class's own capacity
            </p>
          </div>
          {classRows.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={classRows} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="city"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={44}
                  unit="%"
                  tick={{
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                    fontFamily: "var(--font-mono)",
                  }}
                />
                <Tooltip
                  content={<ChartTooltip unit="%" />}
                  cursor={{ fill: "var(--secondary)" }}
                />
                <Bar dataKey="highway" name="Highways" fill="var(--high)" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="normal"
                  name="Normal routes"
                  fill="var(--signal)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
              Select cities to compare road classes.
            </div>
          )}
        </Panel>

        {/* daily trend for single selection */}
        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">
              {selected.length === 1 ? `${selected[0]} · day by day` : "National · day by day"}
            </h2>
            <p className="text-xs text-muted-foreground">Mean index per calendar day</p>
          </div>
          <TrendMini
            data={
              singleDaily.length
                ? singleDaily.map((p) => ({ label: p.label, value: p.value }))
                : nationalDaily
            }
          />
        </Panel>
      </div>
    </main>
  );
}

function TrendMini({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length)
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No daily data.
      </div>
    );
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={28}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          unit="%"
          domain={[0, "auto"]}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
        />
        <Tooltip
          content={<ChartTooltip unit="%" />}
          cursor={{ stroke: "var(--signal)", strokeWidth: 1, strokeDasharray: "3 3" }}
        />
        <Line
          type="monotone"
          dataKey="value"
          name="index"
          stroke="var(--signal)"
          strokeWidth={2.25}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
