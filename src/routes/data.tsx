import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import { CSV_SCHEMA, STORAGE_KEYS, datasetQuery, type DatasetKey } from "@/lib/traffic";

export const Route = createFileRoute("/data")({
  head: () => ({
    meta: [
      { title: "Dataset & CSV Import — Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "Inspect the CSV schema behind the Algerian congestion index, import your own measurement files, or download the reference dataset.",
      },
      { property: "og:title", content: "Dataset & CSV Import — Algeria Urban Congestion Index" },
      {
        property: "og:description",
        content: "CSV schema, import tool and downloads for the Algerian congestion index.",
      },
    ],
  }),
  component: DataPage,
});

const FILES: { key: DatasetKey; title: string; note: string }[] = [
  { key: "cities", title: "cities.csv", note: "One row per monitored city — headline figures." },
  { key: "hourly", title: "hourly.csv", note: "One row per city × day of week × hour." },
  { key: "monthly", title: "monthly.csv", note: "One row per city × year × month." },
];

function DataPage() {
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
      setStatus(`${file.name}: missing column(s) ${missing.join(", ")}`);
      return;
    }
    window.localStorage.setItem(STORAGE_KEYS[key], text);
    await qc.invalidateQueries({ queryKey: datasetQuery.queryKey });
    setStatus(`${file.name} loaded into the index (${key}).`);
  };

  const reset = async () => {
    Object.values(STORAGE_KEYS).forEach((k) => window.localStorage.removeItem(k));
    await qc.invalidateQueries({ queryKey: datasetQuery.queryKey });
    setStatus("Reverted to the bundled reference dataset.");
  };

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">Dataset</h1>
        <p className="mt-1 max-w-2xl text-muted-foreground">
          Every figure on this site is computed in the browser from three CSV files. Replace them
          with your own measurement exports — the whole index recalculates instantly.
        </p>
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
          {data.source === "uploaded" ? "Custom CSV active" : "Reference dataset"}
        </span>
        <span className="num text-xs text-muted-foreground">
          {data.cities.length} cities · {data.hourly.length} hourly rows · {data.monthly.length}{" "}
          monthly rows
        </span>
        {data.source === "uploaded" && (
          <button
            onClick={reset}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-secondary"
          >
            Restore reference data
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
              <p className="mb-4 text-sm text-muted-foreground">{f.note}</p>
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
                  Import CSV
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
                  Download sample
                </a>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8 overflow-hidden">
        <PanelHeader title="cities.csv preview" subtitle="First rows as currently parsed" />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-secondary/50">
                {[
                  "City",
                  "Wilaya",
                  "Index",
                  "Previous",
                  "Network (km)",
                  "Free flow",
                  "AM",
                  "PM",
                ].map((h) => (
                  <th key={h} className="label-xs px-4 py-3">
                    {h}
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
