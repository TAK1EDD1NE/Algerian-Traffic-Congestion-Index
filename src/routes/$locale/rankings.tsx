import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { RankingsTable } from "@/components/data/RankingsTable";
import { Panel, PageState } from "@/components/site/Panel";
import { datasetQuery, LAST_SLOT, rankedCityRows } from "@/lib/traffic";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";

export const Route = createFileRoute("/$locale/rankings")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.rankings.title") },
        { name: "description", content: t("meta.rankings.description") },
        { property: "og:title", content: t("meta.rankings.ogTitle") },
        { property: "og:description", content: t("meta.rankings.ogDescription") },
      ],
    };
  },
  component: RankingsPage,
});

type DayKey = "all" | "weekday" | "weekend";
type RoadClassKey = "combined" | "highway" | "normal";
type MetricKey = "level" | "change";

const DAY_GROUPS: {
  key: DayKey;
  labelKey: "explore.allDays" | "explore.weekday" | "explore.weekend";
}[] = [
  { key: "all", labelKey: "explore.allDays" },
  { key: "weekday", labelKey: "explore.weekday" },
  { key: "weekend", labelKey: "explore.weekend" },
];

const ROAD_CLASSES: {
  key: RoadClassKey;
  labelKey: "common.allRoads" | "common.highways" | "common.normalRoutes";
}[] = [
  { key: "combined", labelKey: "common.allRoads" },
  { key: "highway", labelKey: "common.highways" },
  { key: "normal", labelKey: "common.normalRoutes" },
];

const METRICS: { key: MetricKey; labelKey: "explore.metricLevel" | "explore.metricChange" }[] = [
  { key: "level", labelKey: "explore.metricLevel" },
  { key: "change", labelKey: "explore.metricChange" },
];

const pill = (on: boolean) =>
  `rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold transition-colors ${
    on
      ? "bg-ink text-ink-foreground"
      : "border border-border text-muted-foreground hover:bg-secondary"
  }`;

/** The twelve 2-hour slots the corpus carries (`null` = every slot). */
const HOURS: (number | null)[] = [null, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];

const slotLabel = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

/**
 * Hour picker. Built on the Radix Select the city switcher uses rather than a native
 * <select>: the popup gets the panel styling, a height cap and a scroll instead of the
 * browser default list.
 *
 * `allHoursDisabled` retires the "all hours" row while the change metric is active: a
 * slot-to-slot change needs one slot to compare against.
 */
function HourSelect({
  value,
  onSelect,
  allHoursDisabled,
}: {
  value: number | null;
  onSelect: (hour: number | null) => void;
  allHoursDisabled: boolean;
}) {
  const { t } = useTranslation();
  return (
    <SelectPrimitive.Root
      value={value === null ? "all" : String(value)}
      onValueChange={(next) => onSelect(next === "all" ? null : Number(next))}
    >
      <SelectPrimitive.Trigger
        aria-label={t("rankings.hoursLabel")}
        className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold outline-none transition-colors hover:bg-secondary data-[state=open]:border-signal data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50 data-[disabled]:hover:bg-background"
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          align="start"
          sideOffset={6}
          className="z-50 max-h-[min(14rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-float"
        >
          <SelectPrimitive.Viewport className="max-h-[14rem] overflow-y-auto overscroll-contain p-1">
            {HOURS.map((h) => (
              <SelectPrimitive.Item
                key={h === null ? "all" : h}
                value={h === null ? "all" : String(h)}
                disabled={h === null && allHoursDisabled}
                className="relative flex cursor-pointer select-none items-center rounded-md py-1 pl-2.5 pr-7 text-xs outline-none data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50 data-[highlighted]:bg-secondary data-[state=checked]:font-semibold"
              >
                <SelectPrimitive.ItemText>
                  {h === null ? t("rankings.allHours") : slotLabel(h)}
                </SelectPrimitive.ItemText>
                <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center text-signal">
                  <SelectPrimitive.ItemIndicator>
                    <Check className="h-3.5 w-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

function RankingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [dayKey, setDayKey] = useState<DayKey>("all");
  const [roadClass, setRoadClass] = useState<RoadClassKey>("combined");
  const [hour, setHour] = useState<number | null>(null);
  const [metric, setMetric] = useState<MetricKey>("level");

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  // Every filter applies to both metrics now: the change figure is the selected slot against
  // the slot before it, so it needs one slot — pick the corpus's last one on the way in.
  const changeMetric = metric === "change";
  const selectMetric = (next: MetricKey) => {
    setMetric(next);
    if (next === "change" && hour === null) setHour(LAST_SLOT);
  };
  const narrowed = !(dayKey === "all" && roadClass === "combined" && hour === null);
  const rows = rankedCityRows(data, { dayKey, roadClass, hour, metric });
  const activeClass = roadClass === "highway" ? t("common.highways") : t("common.normalRoutes");
  const dayLabel = DAY_GROUPS.find((g) => g.key === dayKey)?.labelKey ?? "explore.allDays";

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-1 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">{t("rankings.title")}</h1>
        <p className="text-muted-foreground">{t("rankings.note", { count: data.cities.length })}</p>
      </div>

      <Panel className="mb-8 p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="label-xs mb-3">{t("explore.daysLabel")}</div>
            <div className="flex flex-col items-start gap-1.5">
              {DAY_GROUPS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setDayKey(g.key)}
                  className={pill(dayKey === g.key)}
                >
                  {t(g.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-xs mb-3">{t("explore.metricLabel")}</div>
            <div className="flex flex-col items-start gap-1.5">
              {METRICS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => selectMetric(m.key)}
                  className={pill(metric === m.key)}
                >
                  {t(m.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-xs mb-3">{t("explore.roadClassLabel")}</div>
            <div className="flex flex-col items-start gap-1.5">
              {ROAD_CLASSES.map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRoadClass(r.key)}
                  className={pill(roadClass === r.key)}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
            {roadClass !== "combined" && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                {t("explore.classScoredNote")}
              </p>
            )}
          </div>

          <div>
            <div className="label-xs mb-3">{t("rankings.hoursLabel")}</div>
            <HourSelect value={hour} onSelect={setHour} allHoursDisabled={changeMetric} />
            <p className="mt-3 text-[11px] text-muted-foreground">{t("rankings.hourNote")}</p>
          </div>
        </div>

        <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
          {t("rankings.staticNote")}
        </p>
        {changeMetric && (
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {t("rankings.changeNote")}
          </p>
        )}
        {narrowed && (
          <p className="num mt-1 text-[11px] text-muted-foreground">
            {t(dayLabel)}
            {roadClass !== "combined" ? ` · ${t("explore.classOnly", { class: activeClass })}` : ""}
            {hour !== null ? ` · ${slotLabel(hour)}` : ""}
          </p>
        )}
      </Panel>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <RankingsTable rows={rows} metric={metric} />
        </div>
      </Panel>
    </main>
  );
}
