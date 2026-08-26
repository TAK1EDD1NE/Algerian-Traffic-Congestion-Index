import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlgeriaMap } from "@/components/data/AlgeriaMap";
import { CountUp } from "@/components/data/CountUp";
import { HourlyChart } from "@/components/data/HourlyChart";
import { RankingTable } from "@/components/data/RankingTable";
import { TrendChart } from "@/components/data/TrendChart";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import {
  datasetQuery,
  dailyNationalSeries,
  fmt,
  hourlyProfile,
  levelColor,
  nationalAverage,
  peakHour,
  slug,
} from "@/lib/traffic";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DZ Traffic Index — Algeria's Traffic Congestion Index" },
      {
        name: "description",
        content:
          "Congestion index for 27 Algerian metropolitan areas: rankings, peak-hour curves, time lost per driver and daily trends.",
      },
      { property: "og:title", content: "DZ Traffic Index — Algeria's Traffic Congestion Index" },
      {
        property: "og:description",
        content:
          "Congestion rankings, peak-hour analysis and time lost per driver across Algerian cities.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading, error } = useQuery(datasetQuery);

  if (isLoading || error || !data) {
    return <PageState loading={isLoading} error={error as Error | null} />;
  }

  const national = nationalAverage(data.cities);
  const worst = data.cities[0]!;
  const profile = hourlyProfile(data.hourly);
  const peak = peakHour(profile);
  const nationalDaily = dailyNationalSeries(data.daily);
  const totalCapacityKm = data.cities.reduce((s, c) => s + c.capacityKm, 0);
  const totalCoverage =
    data.cities.reduce((s, c) => s + c.coveragePct * c.capacityKm, 0) / (totalCapacityKm || 1);
  const totalSnapshots = data.cities.reduce((s, c) => s + c.nSnapshots, 0);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <div className="flex flex-col gap-1 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <h1 className="text-3xl font-bold tracking-tight">Algerian Traffic Index</h1>
            <p className="text-muted-foreground">
              Congestion across {data.cities.length} metropolitan areas, measured from street-level
              traffic imagery against each zone's own free-flow baseline.
            </p>
          </div>

          <AlgeriaMap cities={data.cities} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-panel animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_100ms_both]">
            <div className="label-xs mb-4 text-ink-muted">National average</div>
            <div className="num text-5xl font-bold tracking-tighter">
              <CountUp value={national.index} />
              <span className="ml-1 text-xl font-medium text-ink-muted">%</span>
            </div>
            <div
              className="mt-2 flex items-center gap-2 text-sm font-medium"
              style={{ color: national.delta > 0 ? "var(--critical)" : "var(--free)" }}
            >
              <span>{national.delta > 0 ? "▲" : "▼"}</span>
              <span>
                {fmt(Math.abs(national.delta))} pts vs previous period
              </span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">
              Population-weighted across all monitored hubs.
            </p>
          </div>

          <Panel className="p-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_180ms_both]">
            <div className="label-xs mb-4">Monitored network</div>
            <div className="num text-3xl font-bold">
              <CountUp value={totalCapacityKm} digits={0} />
              <span className="ml-1 text-lg font-normal text-muted-foreground">km</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              of road tracked across {data.cities.length} cities
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-1000"
                style={{ width: `${Math.min(100, (totalCapacityKm / 6000) * 100)}%` }}
              />
            </div>
            <div className="num mt-3 flex justify-between text-[11px] text-muted-foreground">
              <span>{fmt(totalCoverage)}% avg coverage</span>
              <span>{totalSnapshots.toLocaleString("en-US")} snapshots</span>
            </div>
          </Panel>

          <Panel className="p-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_260ms_both]">
            <div className="label-xs mb-4">Most congested city</div>
            <Link
              to="/city/$city"
              params={{ city: slug(worst.city) }}
              className="text-xl font-bold transition-colors hover:text-signal"
            >
              {worst.city}
            </Link>
            <div className="text-sm text-muted-foreground">
              {fmt(worst.congestionIndex)}% index · rank #1 of {data.cities.length}
            </div>
            <div className="mt-4 flex h-12 items-end gap-1">
              {data.cities.slice(0, 6).map((c) => (
                <span
                  key={c.city}
                  className="flex-1 rounded-t-sm transition-all duration-700"
                  style={{
                    height: `${(c.congestionIndex / worst.congestionIndex) * 100}%`,
                    background:
                      c.city === worst.city ? levelColor(c.congestionIndex) : "var(--secondary)",
                  }}
                  title={`${c.city} · ${fmt(c.congestionIndex)}%`}
                />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Panel className="overflow-hidden">
          <PanelHeader
            title="City ranking"
            action={
              <Link to="/cities" className="text-xs font-bold tracking-wider text-signal uppercase">
                All reports
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <RankingTable cities={data.cities} limit={6} />
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h2 className="font-bold">Peak window distribution</h2>
              <p className="text-xs text-muted-foreground">National average per 2-hour window</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-signal" /> Sun–Wed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground" /> Thu–Fri
              </span>
            </div>
          </div>
          <HourlyChart hourly={data.hourly} />
          <div className="mt-6 rounded-xl bg-secondary p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">Analysis:</span> the national peak lands in
              the <span className="num font-bold text-foreground">{peak.label}</span> window at{" "}
              <span className="num font-bold" style={{ color: levelColor(peak.workday) }}>
                {fmt(peak.workday)}%
              </span>{" "}
              above each zone's calm baseline. Thursday–Friday flows stay below weekday saturation,
              reflecting the Algerian working week.
            </p>
          </div>
        </Panel>
      </div>

      {nationalDaily.length > 1 && (
        <Panel className="mt-8 p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-bold">Day by day</h2>
              <p className="text-xs text-muted-foreground">
                National mean index across the measurement window
              </p>
            </div>
            <div className="num text-xs text-muted-foreground">
              {nationalDaily.length} days · June 9 to July 2
            </div>
          </div>
          <TrendChart data={nationalDaily} series={[{ key: "value", color: "var(--signal)" }]} height={240} />
        </Panel>
      )}
    </main>
  );
}
