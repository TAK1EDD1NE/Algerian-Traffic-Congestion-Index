import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Panel } from "@/components/site/Panel";
import { DEFAULT_LOCALE, isLocale, useLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";
import { captureWindow, datasetQuery } from "@/lib/traffic";

export const Route = createFileRoute("/$locale/methodology")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.methodology.title") },
        { name: "description", content: t("meta.methodology.description") },
        { property: "og:title", content: t("meta.methodology.ogTitle") },
        { property: "og:description", content: t("meta.methodology.ogDescription") },
      ],
    };
  },
  component: MethodologyPage,
});

type MethodologyStepSlug = "capacity" | "share" | "baseline" | "aggregation";
type MethodologyStepKey = `methodology.steps.${MethodologyStepSlug}.${"title" | "body"}`;

const STEPS: { n: string; titleKey: MethodologyStepKey; bodyKey: MethodologyStepKey }[] = [
  {
    n: "01",
    titleKey: "methodology.steps.capacity.title",
    bodyKey: "methodology.steps.capacity.body",
  },
  { n: "02", titleKey: "methodology.steps.share.title", bodyKey: "methodology.steps.share.body" },
  {
    n: "03",
    titleKey: "methodology.steps.baseline.title",
    bodyKey: "methodology.steps.baseline.body",
  },
  {
    n: "04",
    titleKey: "methodology.steps.aggregation.title",
    bodyKey: "methodology.steps.aggregation.body",
  },
];

type MethodologyScaleSlug = "fluid" | "moderate" | "high" | "critical";
type MethodologyScaleKey =
  `methodology.scale.${MethodologyScaleSlug}` | `methodology.scale.${MethodologyScaleSlug}Range`;

const SCALE: {
  slug: MethodologyScaleSlug;
  labelKey: MethodologyScaleKey;
  rangeKey: MethodologyScaleKey;
  range: { min?: number; max?: number };
  color: string;
}[] = [
  {
    slug: "fluid",
    labelKey: "methodology.scale.fluid",
    rangeKey: "methodology.scale.fluidRange",
    range: { max: 7 },
    color: "var(--free)",
  },
  {
    slug: "moderate",
    labelKey: "methodology.scale.moderate",
    rangeKey: "methodology.scale.moderateRange",
    range: { min: 7, max: 11 },
    color: "var(--moderate)",
  },
  {
    slug: "high",
    labelKey: "methodology.scale.high",
    rangeKey: "methodology.scale.highRange",
    range: { min: 11, max: 14 },
    color: "var(--high)",
  },
  {
    slug: "critical",
    labelKey: "methodology.scale.critical",
    rangeKey: "methodology.scale.criticalRange",
    range: { min: 14 },
    color: "var(--critical)",
  },
];

type MethodologyTermSlug =
  | "congestionIndex"
  | "zone"
  | "snapshot"
  | "referenceNetwork"
  | "gridlockLoad"
  | "calmLevel"
  | "coverage"
  | "twoHourWindow"
  | "workday"
  | "weekend"
  | "roadClass"
  | "wilaya"
  | "congestionScale";

const TERMS: { key: MethodologyTermSlug }[] = [
  { key: "congestionIndex" },
  { key: "zone" },
  { key: "snapshot" },
  { key: "referenceNetwork" },
  { key: "gridlockLoad" },
  { key: "calmLevel" },
  { key: "coverage" },
  { key: "twoHourWindow" },
  { key: "workday" },
  { key: "weekend" },
  { key: "roadClass" },
  { key: "wilaya" },
  { key: "congestionScale" },
];

function MethodologyPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { data } = useQuery(datasetQuery);
  // The window the screenshots cover, read from the shipped daily series — never hardcoded.
  const captureRange = data ? captureWindow(data.daily, locale) : null;
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-10 max-w-3xl animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="label-xs mb-3">{t("methodology.technicalNote")}</div>
        <h1 className="text-3xl font-bold tracking-tight">{t("methodology.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("methodology.intro")}</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <Panel key={s.n} className="p-6">
            <div style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` }}>
              <div className="num mb-3 text-sm font-bold text-signal">{s.n}</div>
              <h2 className="mb-2 text-lg font-bold">{t(s.titleKey)}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{t(s.bodyKey)}</p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8 bg-ink p-8 text-ink-foreground">
        <div className="label-xs mb-4 text-ink-muted">{t("methodology.formulaLabel")}</div>
        <p className="num text-lg leading-relaxed">
          raw = ( 1·yellow + 2·red + 3·dark_red ) / K &nbsp;&nbsp;→&nbsp;&nbsp; index = ( raw − calm
          ) / ( max − calm ) × 100
        </p>
        <p className="mt-4 max-w-2xl text-sm text-ink-muted">{t("methodology.formulaNote")}</p>
      </Panel>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <h2 className="mb-4 font-bold">{t("methodology.scaleTitle")}</h2>
          <div className="space-y-3">
            {SCALE.map((entry) => (
              <div key={entry.slug} className="flex items-center gap-4">
                <span className="h-2 w-16 rounded-full" style={{ background: entry.color }} />
                <span className="text-sm font-semibold">{t(entry.labelKey)}</span>
                <span className="num ml-auto text-xs text-muted-foreground">
                  {t(entry.rangeKey, entry.range)}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="mb-4 font-bold">{t("methodology.limitationsTitle")}</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            {captureRange ? <li>{t("methodology.limitations.window", captureRange)}</li> : null}
            <li>{t("methodology.limitations.source")}</li>
            <li>{t("methodology.limitations.smallRoads")}</li>
            <li>{t("methodology.limitations.lowCoverage")}</li>
          </ul>
        </Panel>
      </div>

      <Panel className="mt-8 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-bold">{t("methodology.terminologyTitle")}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{t("methodology.terminologyNote")}</p>
        </div>
        <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          {TERMS.map(({ key }) => (
            <div key={key}>
              <dt className="mb-1 text-sm font-bold">{t(`methodology.terms.${key}.term`)}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">
                {t(`methodology.terms.${key}.definition`)}
              </dd>
            </div>
          ))}
        </dl>
      </Panel>
    </main>
  );
}
