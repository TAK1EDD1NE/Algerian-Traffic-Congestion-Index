import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { TrendChart } from "@/components/data/TrendChart";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import { datasetQuery, fmt, MONTHS } from "@/lib/traffic";

export const Route = createFileRoute("/historical")({
  head: () => ({
    meta: [
      { title: "Historical Data — DZ Traffic Index" },
      {
        name: "description",
        content:
          "Multi-year congestion trends for Algerian cities: month-by-month comparison, seasonal dips and year-over-year evolution.",
      },
      { property: "og:title", content: "Historical Data — DZ Traffic Index" },
      {
        property: "og:description",
        content: "Compare multi-year congestion trends across Algerian cities.",
      },
    ],
  }),
  component: HistoricalPage,
});

const PALETTE = [
  "var(--signal)",
  "var(--critical)",
  "var(--free)",
  "var(--high)",
  "var(--moderate)",
];

function HistoricalPage() {
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [selected, setSelected] = useState<string[]>([]);

  const cities = data?.cities ?? [];
  const active = selected.length ? selected : cities.slice(0, 3).map((c) => c.city);

  const series = useMemo(() => {
    if (!data) return [];
    const keys = Array.from(
      new Set(data.monthly.map((r) => `${r.year}-${String(r.month).padStart(2, "0")}`)),
    ).sort();
    return keys.map((key) => {
      const [year, month] = key.split("-").map(Number) as [number, number];
      const row: Record<string, string | number> = {
        label: `${MONTHS[month - 1]} ${String(year).slice(2)}`,
      };
      active.forEach((city) => {
        const m = data.monthly.find((r) => r.city === city && r.year === year && r.month === month);
        if (m) row[city] = m.congestionIndex;
      });
      return row;
    });
  }, [data, active]);

  if (isLoading || error || !data) return <PageState loading={isLoading} error={error as Error | null} />;

  const years = Array.from(new Set(data.monthly.map((r) => r.year))).sort();

  const toggle = (city: string) =>
    setSelected((prev) => {
      const base = prev.length ? prev : cities.slice(0, 3).map((c) => c.city);
      if (base.includes(city)) return base.length > 1 ? base.filter((c) => c !== city) : base;
      return base.length >= 5 ? base : [...base, city];
    });

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">Historical data</h1>
        <p className="mt-1 text-muted-foreground">
          Month-by-month index from {years[0]} to {years[years.length - 1]}. Compare up to five
          cities at once.
        </p>
      </header>

      <Panel className="p-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {cities.map((c) => {
            const on = active.includes(c.city);
            const color = PALETTE[active.indexOf(c.city) % PALETTE.length]!;
            return (
              <button
                key={c.city}
                onClick={() => toggle(c.city)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  on ? "border-transparent bg-ink text-ink-foreground" : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                {on && <span className="size-2 rounded-full" style={{ background: color }} />}
                {c.city}
              </button>
            );
          })}
        </div>
        <TrendChart
          data={series}
          height={360}
          series={active.map((city, i) => ({ key: city, color: PALETTE[i % PALETTE.length]! }))}
        />
      </Panel>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHeader title="Year-over-year averages" subtitle="Mean index per reporting year" />
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="label-xs px-6 py-3">City</th>
                  {years.map((y) => (
                    <th key={y} className="label-xs px-6 py-3 text-right">
                      {y}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cities.map((c) => (
                  <tr key={c.city} className="transition-colors hover:bg-secondary/60">
                    <td className="px-6 py-3 font-semibold">{c.city}</td>
                    {years.map((y) => {
                      const rows = data.monthly.filter((r) => r.city === c.city && r.year === y);
                      const avg = rows.length
                        ? rows.reduce((s, r) => s + r.congestionIndex, 0) / rows.length
                        : 0;
                      return (
                        <td key={y} className="num px-6 py-3 text-right">
                          {fmt(avg)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="font-bold">Seasonality</h2>
          <p className="mb-6 text-xs text-muted-foreground">
            National mean per calendar month, all years pooled
          </p>
          <div className="flex h-56 items-end gap-2">
            {MONTHS.map((m, i) => {
              const rows = data.monthly.filter((r) => r.month === i + 1);
              const avg = rows.length
                ? rows.reduce((s, r) => s + r.congestionIndex, 0) / rows.length
                : 0;
              const max = 40;
              return (
                <div key={m} className="group flex flex-1 flex-col items-center gap-2">
                  <span className="num text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    {fmt(avg)}
                  </span>
                  <div
                    className="w-full rounded-t-sm bg-signal/70 transition-all duration-500 group-hover:bg-signal"
                    style={{ height: `${(avg / max) * 100}%` }}
                  />
                  <span className="num text-[9px] text-muted-foreground">{m.slice(0, 1)}</span>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </main>
  );
}
