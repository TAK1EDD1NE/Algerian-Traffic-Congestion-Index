import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RankingTable } from "@/components/data/RankingTable";
import { Panel, PanelHeader, PageState } from "@/components/site/Panel";
import { AlgeriaMap } from "@/components/data/AlgeriaMap";
import { datasetQuery, fmt, level, LEVEL_LABEL, type Level } from "@/lib/traffic";

export const Route = createFileRoute("/cities")({
  head: () => ({
    meta: [
      { title: "City Reports — DZ Traffic Index" },
      {
        name: "description",
        content:
          "Search and compare congestion levels, time lost and peak delays for every Algerian city in the index.",
      },
      { property: "og:title", content: "City Reports — DZ Traffic Index" },
      {
        property: "og:description",
        content: "Compare congestion levels and time lost across Algerian cities.",
      },
    ],
  }),
  component: CitiesPage,
});

const FILTERS: (Level | "all")[] = ["all", "critical", "high", "moderate", "free"];

function CitiesPage() {
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Level | "all">("all");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.cities.filter(
      (c) =>
        (filter === "all" || level(c.congestionIndex) === filter) &&
        (c.city.toLowerCase().includes(query.toLowerCase()) ||
          c.wilaya.toLowerCase().includes(query.toLowerCase())),
    );
  }, [data, query, filter]);

  if (isLoading || error || !data) return <PageState loading={isLoading} error={error as Error | null} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-8 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">City reports</h1>
        <p className="mt-1 text-muted-foreground">
          Full ranking of monitored hubs. Select a city for its hourly profile, weekly heatmap and
          multi-year trend.
        </p>
      </header>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlgeriaMap cities={filtered.length ? filtered : data.cities} />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          {(["critical", "high", "moderate", "free"] as Level[]).map((l) => {
            const group = data.cities.filter((c) => level(c.congestionIndex) === l);
            return (
              <Panel key={l} className="p-5">
                <div className="label-xs mb-2">{LEVEL_LABEL[l]} hubs</div>
                <div className="num text-2xl font-bold" style={{ color: `var(--${l})` }}>
                  {group.length}
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {group.map((g) => g.city).join(", ") || "—"}
                </div>
              </Panel>
            );
          })}
        </div>
      </div>

      <Panel className="overflow-hidden">
        <PanelHeader
          title="All monitored cities"
          subtitle={`${filtered.length} of ${data.cities.length} shown`}
          action={
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city or wilaya"
                className="w-48 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none transition-colors focus:border-signal"
              />
              <div className="hidden gap-1 md:flex">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                      filter === f
                        ? "bg-ink text-ink-foreground"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {f === "all" ? "All" : LEVEL_LABEL[f]}
                  </button>
                ))}
              </div>
            </div>
          }
        />
        <div className="overflow-x-auto">
          {filtered.length ? (
            <RankingTable cities={filtered} />
          ) : (
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              No city matches “{query}”.
            </p>
          )}
        </div>
      </Panel>

      <p className="num mt-6 text-xs text-muted-foreground">
        Weighted national index: {fmt(data.cities.reduce((s, c) => s + c.congestionIndex, 0) / data.cities.length)}%
        (unweighted mean)
      </p>
    </main>
  );
}
