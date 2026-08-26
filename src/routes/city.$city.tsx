import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CountUp } from "@/components/data/CountUp";
import { Heatmap } from "@/components/data/Heatmap";
import { HourlyChart } from "@/components/data/HourlyChart";
import { TrendChart } from "@/components/data/TrendChart";
import { AreasTable, ColorDistribution, CoveragePanel } from "@/components/data/NetworkPanels";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import {
  datasetQuery,
  dailyCitySeries,
  fmt,
  hourlyProfile,
  LEVEL_LABEL,
  level,
  levelColor,
  monthlySeries,
  peakHour,
  slug,
} from "@/lib/traffic";

export const Route = createFileRoute("/city/$city")({
  head: ({ params }) => {
    const name = params.city.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${name} congestion report — DZ Traffic Index` },
        {
          name: "description",
          content: `Hourly congestion profile, weekly heatmap, peak delays and multi-year trend for ${name}, Algeria.`,
        },
        { property: "og:title", content: `${name} congestion report — DZ Traffic Index` },
        {
          property: "og:description",
          content: `Peak delays, weekly heatmap and yearly trend for ${name}.`,
        },
      ],
    };
  },
  component: CityReport,
});

function CityReport() {
  const { city: citySlug } = Route.useParams();
  const { data, isLoading, error } = useQuery(datasetQuery);

  if (isLoading || error || !data) return <PageState loading={isLoading} error={error as Error | null} />;

  const city = data.cities.find((c) => slug(c.city) === citySlug);
  if (!city) throw notFound();

  const profile = hourlyProfile(data.hourly, city.city);
  const peak = peakHour(profile);
  const trend = monthlySeries(data.monthly, city.city).map((p) => ({
    label: p.label,
    [city.city]: p.index,
  }));
  const dailyData = useMemo(
    () => dailyCitySeries(data.daily, city.city).map((p) => ({ label: p.label, value: p.value })),
    [data.daily, city.city],
  );
  const cityAreas = useMemo(
    () =>
      data.areas
        .filter((a) => a.city === city.city)
        .sort((a, b) => b.congestionIndex - a.congestionIndex),
    [data.areas, city.city],
  );
  const cityComp = useMemo(() => data.colorComp.filter((r) => r.city === city.city), [data.colorComp, city.city]);
  const rank = data.cities.findIndex((c) => c.city === city.city) + 1;
  const delta = city.congestionIndex - city.previousIndex;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link to="/cities" className="transition-colors hover:text-signal">
          City reports
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">{city.city}</span>
      </div>

      <header className="mb-8 flex flex-wrap items-end justify-between gap-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div>
          <div className="label-xs mb-1">Wilaya of {city.wilaya}</div>
          <h1 className="text-4xl font-bold tracking-tight">{city.city}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Rank {rank} of {data.cities.length} · population{" "}
            <span className="num">{city.population.toLocaleString("en-US")}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="rounded-lg px-3 py-1.5 text-xs font-bold"
            style={{
              color: levelColor(city.congestionIndex),
              background: `color-mix(in oklab, ${levelColor(city.congestionIndex)} 12%, transparent)`,
            }}
          >
            {LEVEL_LABEL[level(city.congestionIndex)]}
          </span>
          <span
            className="num text-xs font-semibold"
            style={{ color: delta > 0 ? "var(--critical)" : "var(--free)" }}
          >
            {delta > 0 ? "+" : ""}
            {fmt(delta)} pts YoY
          </span>
        </div>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Congestion index", value: city.congestionIndex, unit: "%", digits: 1, ink: true },
          { label: "Monitored areas", value: city.nAreas, unit: "", digits: 0 },
          { label: "Road network", value: city.capacityKm, unit: "km", digits: 0 },
          { label: "Avg visibility", value: city.coveragePct, unit: "%", digits: 1 },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`rounded-2xl p-6 shadow-panel ${
              stat.ink ? "bg-ink text-ink-foreground" : "border border-border bg-card"
            }`}
            style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 80}ms both` }}
          >
            <div className={`label-xs mb-3 ${stat.ink ? "text-ink-muted" : ""}`}>{stat.label}</div>
            <div className="num text-3xl font-bold tracking-tighter">
              <CountUp value={stat.value} digits={stat.digits} />
              <span
                className={`ml-1 text-sm font-normal ${stat.ink ? "text-ink-muted" : "text-muted-foreground"}`}
              >
                {stat.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Congestion through the day</h2>
            <p className="text-xs text-muted-foreground">
              Mean index per 2-hour window · peak at{" "}
              <span className="num font-semibold text-foreground">{peak.label}</span>
            </p>
          </div>
          <HourlyChart hourly={data.hourly} city={city.city} />
        </Panel>

        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Weekly density heatmap</h2>
            <p className="text-xs text-muted-foreground">7 days × 2-hour slots, congestion intensity</p>
          </div>
          <Heatmap hourly={data.hourly} city={city.city} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Coverage & network</h2>
            <p className="text-xs text-muted-foreground">
              How much road each snapshot sees, and how the monitored network splits
            </p>
          </div>
          <CoveragePanel city={city} />
        </Panel>

        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Congestion level mix by road class</h2>
            <p className="text-xs text-muted-foreground">
              Google traffic colors across normal routes and highways
            </p>
          </div>
          {cityComp.length ? (
            <ColorDistribution comp={cityComp} />
          ) : (
            <p className="text-sm text-muted-foreground">No composition data available.</p>
          )}
        </Panel>
      </div>

      <Panel className="mt-8 p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-bold">Day by day</h2>
            <p className="text-xs text-muted-foreground">
              Daily mean index across the measurement window
            </p>
          </div>
          <div className="num text-xs text-muted-foreground">
            free-flow baseline {fmt(city.freeFlowMinPer10km)} min / 10 km
          </div>
        </div>
        {dailyData.length ? (
          <TrendChart data={dailyData} series={[{ key: "value", color: "var(--signal)" }]} height={260} />
        ) : (
          <>
            <TrendChart data={trend} series={[{ key: city.city, color: "var(--signal)" }]} />
            <p className="num mt-3 text-[11px] text-muted-foreground">
              Monthly aggregation shown (daily series unavailable).
            </p>
          </>
        )}
      </Panel>

      {cityAreas.length > 0 && (
        <Panel className="mt-8 overflow-hidden">
          <PanelHeader
            title="Area breakdown"
            subtitle={`${cityAreas.length} monitored areas · sorted by congestion`}
          />
          <AreasTable areas={cityAreas} />
        </Panel>
      )}
    </main>
  );
}
