import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { RankingsTable } from "@/components/data/RankingsTable";
import { enUS, fr as frLocale } from "date-fns/locale";
import type { DateRange as PickerRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Panel, PageState } from "@/components/site/Panel";
import {
  datasetQuery,
  LAST_SLOT,
  datedDays,
  daysInRange,
  rankedCityRows,
  type DateRange,
} from "@/lib/traffic";
import { BCP47, DEFAULT_LOCALE, isLocale, type Locale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";
import { useFormat } from "@/i18n/format";

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

type RoadClassKey = "combined" | "highway" | "normal";
type MetricKey = "level" | "change";

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

/* ---------- day range helpers ---------- */

/** The shortest window the calendar accepts, in calendar days (inclusive). */
const MIN_RANGE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
const FALLBACK_DAY = "2026-01-01";

const pad2 = (value: number) => String(value).padStart(2, "0");
const toIso = (date: Date) =>
  `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;

/** Parse a `YYYY-MM-DD` dataset date as local midnight, so the calendar never shifts a day. */
const fromIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** Inclusive span in calendar days: the same day is 1, a week apart is 7. */
const spanDays = (from: Date, to: Date) => Math.round((to.getTime() - from.getTime()) / DAY_MS) + 1;

const dayFormatter = (locale: Locale) =>
  new Intl.DateTimeFormat(BCP47[locale], { day: "numeric", month: "short" });

/** date-fns locale for the calendar's own month/weekday labels (the picker is not i18next). */
const PICKER_LOCALE = { en: enUS, fr: frLocale } as const;

/**
 * The Days filter, as a calendar. `null` = every published day (the default, and the only state
 * in which the table shows the canonical cities.csv index); otherwise an inclusive date range
 * scored by `rankedCityRows` as that window's coverage-weighted mean.
 *
 * Two behaviours worth knowing:
 * - Days the corpus never captured are disabled, so the calendar only offers real days.
 * - A range shorter than a week is EXTENDED to a week instead of being refused: the click lands
 *   where it was meant to, and the minimum is enforced rather than the second click rejected.
 *   The range may then end past the last captured day — the table scores the days that exist.
 */
function DayRangePicker({
  range,
  onChange,
  days,
  locale,
  disabled,
}: {
  range: DateRange | null;
  onChange: (next: DateRange | null) => void;
  days: { dates: string[]; first: string; last: string } | null;
  locale: Locale;
  disabled: boolean;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  // The first click of a new range; the second commits it. Local on purpose: a half-made
  // selection must not recompute (and re-sort) the whole table on the way.
  const [anchor, setAnchor] = useState<Date | null>(null);

  const fmtDay = useMemo(() => dayFormatter(locale), [locale]);
  const available = useMemo(() => new Set(days?.dates ?? []), [days]);

  const captured = daysInRange(days?.dates ?? [], range).length;
  const label = anchor
    ? t("rankings.daysPickEnd", { from: fmtDay.format(anchor) })
    : range
      ? `${fmtDay.format(fromIso(range.from))} – ${fmtDay.format(fromIso(range.to))}`
      : t("rankings.allDays");

  // `selected` is DISPLAY only: the pending start shows as a one-day range so the calendar
  // highlights it, and the committed range as itself.
  const selected: PickerRange | undefined = anchor
    ? { from: anchor, to: anchor }
    : range
      ? { from: fromIso(range.from), to: fromIso(range.to) }
      : undefined;

  // DayPicker's own range state machine completes a selection on the first click (a single day
  // is {from: day, to: day}) and extends an existing range when you click next to it, so its
  // `selected` payload cannot say "start" vs "end". `triggerDate` is the day actually clicked:
  // the first click sets the start, the second closes the range. Order and the one-week
  // minimum are ours, which also makes clicking backwards (end before start) work.
  const pick = (_next: PickerRange | undefined, triggerDate: Date) => {
    const start = anchor;
    if (!start) {
      setAnchor(triggerDate);
      return;
    }
    const from = triggerDate < start ? triggerDate : start;
    const picked = triggerDate < start ? start : triggerDate;
    const to = spanDays(from, picked) < MIN_RANGE_DAYS ? addDays(from, MIN_RANGE_DAYS - 1) : picked;
    setAnchor(null);
    onChange({ from: toIso(from), to: toIso(to) });
  };

  const reset = () => {
    setAnchor(null);
    onChange(null);
  };

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-label={t("rankings.calendarAria")}
            className="group flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-left text-xs font-semibold outline-none transition-colors hover:bg-secondary data-[state=open]:border-signal disabled:cursor-not-allowed disabled:text-muted-foreground/50 disabled:hover:bg-background"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{label}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          </button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={pick}
            numberOfMonths={1}
            locale={PICKER_LOCALE[locale]}
            defaultMonth={fromIso(range ? range.from : (days?.first ?? FALLBACK_DAY))}
            disabled={[
              { before: fromIso(days?.first ?? FALLBACK_DAY) },
              { after: fromIso(days?.last ?? FALLBACK_DAY) },
              (date: Date) => !available.has(toIso(date)),
            ]}
            className="p-2"
          />
          <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2">
            <span className="text-[11px] text-muted-foreground">{t("rankings.minRange")}</span>
            <button
              type="button"
              onClick={reset}
              className="rounded-md px-2 py-1 text-[11px] font-semibold text-signal transition-colors hover:bg-secondary"
            >
              {t("rankings.allDays")}
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <p className="num mt-3 text-[11px] text-muted-foreground">
        {disabled
          ? t("rankings.daysUnavailable")
          : range
            ? t("rankings.daysCount", { days: captured })
            : t("rankings.daysNote")}
      </p>
    </div>
  );
}

/**
 * Hour picker. Built on the Radix Select the city switcher uses rather than a native
 * <select>: the popup gets the panel styling, a height cap and a scroll instead of the
 * browser default list. Deliberately the smallest of the four controls.
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
        className="group flex w-full max-w-[8rem] cursor-pointer items-center justify-between gap-1.5 rounded-lg border border-border bg-background px-2 py-1 text-[11px] font-semibold outline-none transition-colors hover:bg-secondary data-[state=open]:border-signal data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50 data-[disabled]:hover:bg-background"
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
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
                className="relative flex cursor-pointer select-none items-center rounded-md py-1 pl-2.5 pr-7 text-[11px] outline-none data-[disabled]:cursor-not-allowed data-[disabled]:text-muted-foreground/50 data-[highlighted]:bg-secondary data-[state=checked]:font-semibold"
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
  const { locale } = useFormat();
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [range, setRange] = useState<DateRange | null>(null);
  const [roadClass, setRoadClass] = useState<RoadClassKey>("combined");
  const [hour, setHour] = useState<number | null>(null);
  const [metric, setMetric] = useState<MetricKey>("level");

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  // The day window needs the dated series; on a dataset without it the control stays disabled
  // and every published day is scored (the undated aggregates cannot answer "these days").
  const days = datedDays(data.hourlyDated);
  const activeRange = days ? range : null;

  // Every filter applies to both metrics now: the change figure is the selected slot against
  // the slot before it, so it needs one slot — pick the corpus's last one on the way in.
  const changeMetric = metric === "change";
  const selectMetric = (next: MetricKey) => {
    setMetric(next);
    if (next === "change" && hour === null) setHour(LAST_SLOT);
  };

  const rows = rankedCityRows(data, { dates: activeRange, roadClass, hour, metric });
  // Cities the highways filter leaves out (see HIGHWAY_UNRANKED) — said in the UI so the
  // shorter table does not read as a broken page.
  const excluded = roadClass === "highway" ? data.cities.length - rows.length : 0;

  const fmtDay = dayFormatter(locale);
  const captured = daysInRange(days?.dates ?? [], activeRange).length;
  const activeClass = roadClass === "highway" ? t("common.highways") : t("common.normalRoutes");
  const summary = [
    activeRange
      ? t("rankings.daysRange", {
          from: fmtDay.format(fromIso(activeRange.from)),
          to: fmtDay.format(fromIso(activeRange.to)),
          days: captured,
        })
      : "",
    roadClass !== "combined" ? t("explore.classOnly", { class: activeClass }) : "",
    hour !== null ? slotLabel(hour) : "",
  ].filter(Boolean);

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-1 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">{t("rankings.title")}</h1>
        <p className="text-muted-foreground">{t("rankings.note", { count: rows.length })}</p>
      </div>

      <Panel className="mb-8 p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="label-xs mb-3">{t("explore.daysLabel")}</div>
            <DayRangePicker
              range={activeRange}
              onChange={setRange}
              days={days}
              locale={locale}
              disabled={!days}
            />
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
            {excluded > 0 && (
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {t("rankings.highwayExcluded", { count: excluded })}
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
        {summary.length > 0 && (
          <p className="num mt-1 text-[11px] text-muted-foreground">{summary.join(" · ")}</p>
        )}
        {activeRange && (
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            {t("rankings.daysRangeNote")}
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
