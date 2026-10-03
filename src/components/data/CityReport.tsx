import { useMemo } from "react";
import {
  type CityRow,
  type Dataset,
  fmt,
  hourlyProfile,
  LEVEL_LABEL,
  level,
  levelColor,
  peakHour,
} from "@/lib/traffic";
import { CountUp } from "@/components/data/CountUp";
import { Heatmap } from "@/components/data/Heatmap";
import { HourlyChart } from "@/components/data/HourlyChart";
import { AreasTable, ColorDistribution, CoveragePanel } from "@/components/data/NetworkPanels";
import { Panel, PanelHeader } from "@/components/site/Panel";
import { CitySwitcher } from "@/components/site/CitySwitcher";

/**
 * Detailed report for one city. Rendered by /cities (local switcher state, default
 * Alger) and by /city/$city (switcher navigates). The day-by-day series is gone.
 */
export function CityReport({
  data,
  city,
  onSelectCity,
}: {
  data: Dataset;
  city: CityRow;
  onSelectCity: (city: string) => void;
}) {
  const profile = hourlyProfile(data.hourly, city.city);
  const peak = peakHour(profile);
  const cityAreas = useMemo(
    () =>
      data.areas
        .filter((a) => a.city === city.city)
        .sort((a, b) => b.congestionIndex - a.congestionIndex),
    [data.areas, city.city],
  );
  const cityComp = useMemo(
    () => data.colorComp.filter((r) => r.city === city.city),
    [data.colorComp, city.city],
  );
  const rank = data.cities.findIndex((c) => c.city === city.city) + 1;
  const delta = city.congestionIndex - city.previousIndex;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="label-xs">City reports</span>
          <span>/</span>
          <span className="font-semibold text-foreground">{city.city}</span>
        </div>
        <label className="flex items-center gap-2">
          <span className="label-xs">Switch city</span>
          <CitySwitcher
            cities={data.cities.map((c) => c.city)}
            value={city.city}
            onSelect={onSelectCity}
          />
        </label>
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
          {
            label: "Congestion index",
            value: city.congestionIndex,
            unit: "%",
            digits: 1,
            ink: true,
          },
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
            <p className="text-xs text-muted-foreground">
              7 days × 2-hour slots, congestion intensity
            </p>
          </div>
          <Heatmap hourly={data.hourly} city={city.city} />
        </Panel>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Panel className="p-6">
          <div className="mb-6">
            <h2 className="font-bold">Coverage &amp; network</h2>
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

      {cityAreas.length > 0 && (
        <Panel className="mt-8 overflow-hidden">
          <PanelHeader
            title="Area breakdown"
            subtitle={`${cityAreas.length} monitored areas · sorted by congestion`}
          />
          <AreasTable areas={cityAreas} />
        </Panel>
      )}
    </>
  );
}
