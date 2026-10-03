import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";
import { useFormat } from "@/i18n/format";
import { CSV_SCHEMA, STORAGE_KEYS, datasetQuery, type DatasetKey } from "@/lib/traffic";

export const Route = createFileRoute("/$locale/data")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.data.title") },
        { name: "description", content: t("meta.data.description") },
        { property: "og:title", content: t("meta.data.ogTitle") },
        { property: "og:description", content: t("meta.data.ogDescription") },
      ],
    };
  },
  component: DataPage,
});

type FileNoteKey = "data.files.cities.note" | "data.files.hourly.note" | "data.files.monthly.note";

const FILES: { key: DatasetKey; title: string; noteKey: FileNoteKey }[] = [
  { key: "cities", title: "cities.csv", noteKey: "data.files.cities.note" },
  { key: "hourly", title: "hourly.csv", noteKey: "data.files.hourly.note" },
  { key: "monthly", title: "monthly.csv", noteKey: "data.files.monthly.note" },
];

const HEADER_KEYS = [
  "data.hCity",
  "data.hWilaya",
  "data.hIndex",
  "data.hPrevious",
  "data.hNetwork",
  "data.hFreeFlow",
  "data.hAm",
  "data.hPm",
] as const;

function DataPage() {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const { data, isLoading, error } = useQuery(datasetQuery);
  const qc = useQueryClient();
  const [status, setStatus] = useState<string | null>(null);

  const onUpload = async (key: DatasetKey, file: File) => {
    const text = await file.text();
    const header =
      text
        .split(/\r?\n/)[0]
        ?.split(",")
        .map((h) => h.trim()) ?? [];
    const missing = CSV_SCHEMA[key].filter((c) => !header.includes(c));
    if (missing.length) {
      setStatus(t("data.statusMissing", { file: file.name, columns: missing.join(", ") }));
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS[key], text);
    await qc.invalidateQueries({ queryKey: datasetQuery.queryKey });
    setStatus(t("data.statusLoaded", { file: file.name, key }));
  };

  const reset = async () => {
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    await qc.invalidateQueries({ queryKey: datasetQuery.queryKey });
    setStatus(t("data.statusReset"));
  };

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">{t("data.title")}</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">{t("data.intro")}</p>
      </header>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span
          className="rounded-lg px-3 py-1.5 text-xs font-bold"
          style={{
            color: data.source === "uploaded" ? "var(--signal)" : "var(--free)",
            background:
              data.source === "uploaded"
                ? "color-mix(in oklab, var(--signal) 12%, transparent)"
                : "color-mix(in oklab, var(--free) 12%, transparent)",
          }}
        >
          {data.source === "uploaded" ? t("data.customActive") : t("data.referenceActive")}
        </span>
        <span className="num text-xs text-muted-foreground">
          {t("data.counts", {
            cities: fmt(data.cities.length, 0),
            hourly: fmt(data.hourly.length, 0),
            monthly: fmt(data.monthly.length, 0),
          })}
        </span>
        {data.source === "uploaded" && (
          <button
            onClick={reset}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
          >
            {t("data.restore")}
          </button>
        )}
      </div>

      {status && (
        <div className="mb-8 rounded-xl border border-border bg-secondary px-4 py-3 text-sm">
          {status}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {FILES.map((f, i) => (
          <Panel key={f.key} className="p-6">
            <div style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` }}>
              <div className="label-xs mb-2">{f.title}</div>
              <p className="mb-4 text-sm text-muted-foreground">{t(f.noteKey)}</p>
              <div className="mb-4 space-y-1">
                {CSV_SCHEMA[f.key].map((col) => (
                  <div
                    key={col}
                    className="num rounded-md bg-secondary px-2 py-1 text-[11px] text-muted-foreground"
                  >
                    {col}
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-ink-foreground transition-opacity hover:opacity-90">
                  {t("data.importCsv")}
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void onUpload(f.key, file);
                      e.target.value = "";
                    }}
                  />
                </label>
                <a
                  href={`/data/${f.key}.csv`}
                  download
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-secondary"
                >
                  {t("data.downloadSample")}
                </a>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8 overflow-hidden">
        <PanelHeader title={t("data.previewTitle")} subtitle={t("data.previewSubtitle")} />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondary/50">
                {HEADER_KEYS.map((h) => (
                  <th key={h} className="label-xs px-4 py-3">
                    {t(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.cities.slice(0, 8).map((c) => (
                <tr key={c.city} className="transition-colors hover:bg-secondary/60">
                  <td className="px-4 py-3 font-semibold">{c.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.wilaya}</td>
                  <td className="num px-4 py-3">{c.congestionIndex}</td>
                  <td className="num px-4 py-3 text-muted-foreground">{c.previousIndex}</td>
                  <td className="num px-4 py-3">{c.capacityKm} km</td>
                  <td className="num px-4 py-3">{c.freeFlowMinPer10km}</td>
                  <td className="num px-4 py-3">{c.peakAmDelayMin}</td>
                  <td className="num px-4 py-3">{c.peakPmDelayMin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </main>
  );
}
