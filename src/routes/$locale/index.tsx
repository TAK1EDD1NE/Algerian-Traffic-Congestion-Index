import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BCP47, DEFAULT_LOCALE, isLocale, useLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";
import { useFormat } from "@/i18n/format";
import { AlgeriaMap } from "@/components/data/AlgeriaMap";
import { CountUp } from "@/components/data/CountUp";
import { HourlyChart } from "@/components/data/HourlyChart";
import { RankingTable } from "@/components/data/RankingTable";
import { TrendChart } from "@/components/data/TrendChart";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import {
  datasetQuery,
  dailyNationalSeries,
  hourlyProfile,
  levelColor,
  nationalAverage,
  peakHour,
  slug,
} from "@/lib/traffic";

/** Parse a `YYYY-MM-DD` dataset date as local midnight (avoids UTC day-shift when formatting). */
function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export const Route = createFileRoute("/$locale/")({
  head: ({ params }) => {
    const t = translateFor(isLocale(params.locale) ? params.locale : DEFAULT_LOCALE);
    return {
      meta: [
        { title: t("meta.home.title") },
        { name: "description", content: t("meta.home.description") },
        { property: "og:title", content: t("meta.home.ogTitle") },
        { property: "og:description", content: t("meta.home.ogDescription") },
      ],
    };
  },
  component: Dashboard,
});

function Dashboard() {
  const locale = useLocale();
  const { t } = useTranslation();
  const { fmt } = useFormat();
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

  // Measurement-window bounds derived from the data (never a hardcoded month).
  const sortedDates = data.daily.map((d) => d.date).sort();
  const firstDate = sortedDates[0];
  const lastDate = sortedDates[sortedDates.length - 1];
  const dayMonth = new Intl.DateTimeFormat(BCP47[locale], { day: "numeric", month: "long" });
  const rangeFrom = firstDate ? dayMonth.format(parseIsoDate(firstDate)) : "";
  const rangeTo = lastDate ? dayMonth.format(parseIsoDate(lastDate)) : "";

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-4">
        <div className="space-y-6 lg:col-span-3">
          <div className="flex flex-col gap-1 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
            <h1 className="text-3xl font-bold tracking-tight">{t("home.title")}</h1>
            <p className="text-muted-foreground">
              {t("home.intro", { count: data.cities.length })}
            </p>
          </div>

          <AlgeriaMap cities={data.cities} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-ink p-6 text-ink-foreground shadow-panel animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_100ms_both]">
            <div className="label-xs mb-4 text-ink-muted">{t("home.nationalAverage")}</div>
            <div className="num text-5xl font-bold tracking-tighter">
              <CountUp value={national.index} />
              <span className="ml-1 text-xl font-medium text-ink-muted">%</span>
            </div>
            <div
              className="mt-2 flex items-center gap-2 text-sm font-medium"
              style={{ color: national.delta > 0 ? "var(--critical)" : "var(--free)" }}
            >
              <span>{national.delta > 0 ? "▲" : "▼"}</span>
              <span>{t("home.deltaVsPrevious", { value: fmt(Math.abs(national.delta)) })}</span>
            </div>
            <p className="mt-4 text-xs text-ink-muted">{t("home.weightedNote")}</p>
          </div>

          <Panel className="p-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_180ms_both]">
            <div className="label-xs mb-4">{t("home.monitoredNetwork")}</div>
            <div className="num text-3xl font-bold">
              <CountUp value={totalCapacityKm} digits={0} />
              <span className="ml-1 text-lg font-normal text-muted-foreground">
                {t("common.km")}
              </span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {t("home.roadTracked", { count: data.cities.length })}
            </div>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-signal transition-[width] duration-1000"
                style={{ width: `${Math.min(100, (totalCapacityKm / 6000) * 100)}%` }}
              />
            </div>
            <div className="num mt-3 flex justify-between text-[11px] text-muted-foreground">
              <span>{t("home.avgCoverage", { value: fmt(totalCoverage) })}</span>
              <span>{t("home.snapshots", { count: fmt(totalSnapshots, 0) })}</span>
            </div>
          </Panel>

          <Panel className="p-6 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_260ms_both]">
            <div className="label-xs mb-4">{t("home.mostCongested")}</div>
            <Link
              to="/$locale/city/$city"
              params={{ locale, city: slug(worst.city) }}
              className="text-xl font-bold transition-colors hover:text-signal"
            >
              {worst.city}
            </Link>
            <div className="text-sm text-muted-foreground">
              {t("home.indexRank", {
                value: fmt(worst.congestionIndex),
                total: data.cities.length,
              })}
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
            title={t("home.cityRanking")}
            action={
              <Link
                to="/$locale/cities"
                params={{ locale }}
                className="text-xs font-bold tracking-wider text-signal uppercase"
              >
                {t("home.allReports")}
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
              <h2 className="font-bold">{t("home.peakWindowDistribution")}</h2>
              <p className="text-xs text-muted-foreground">{t("home.nationalAvgPerWindow")}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-signal" /> {t("common.workday")}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground" /> {t("common.weekend")}
              </span>
            </div>
          </div>
          <HourlyChart hourly={data.hourly} />
          <div className="mt-6 rounded-xl bg-secondary p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              <span className="font-bold text-foreground">{t("home.analysisLabel")}</span>{" "}
              {t("home.analysisBody", { window: peak.label, pct: fmt(peak.workday) })}
            </p>
          </div>
        </Panel>
      </div>

      {nationalDaily.length > 1 && (
        <Panel className="mt-8 p-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-bold">{t("home.dayByDay")}</h2>
              <p className="text-xs text-muted-foreground">{t("home.nationalMeanWindow")}</p>
            </div>
            <div className="num text-xs text-muted-foreground">
              {t("home.daysRange", {
                count: nationalDaily.length,
                from: rangeFrom,
                to: rangeTo,
              })}
            </div>
          </div>
          <TrendChart
            data={nationalDaily}
            series={[{ key: "value", color: "var(--signal)" }]}
            height={240}
          />
        </Panel>
      )}
    </main>
  );
}
