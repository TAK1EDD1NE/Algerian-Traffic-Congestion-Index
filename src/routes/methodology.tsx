import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/site/Panel";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Methodology — Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "How the Algerian congestion index is computed: free-flow baselines, gridlock-equivalent load, the four-level congestion scale, and a glossary of every term used on the site.",
      },
      { property: "og:title", content: "Methodology — Algeria Urban Congestion Index" },
      {
        property: "og:description",
        content:
          "Free-flow baselines, gridlock-equivalent load and the congestion scale explained.",
      },
    ],
  }),
  component: MethodologyPage,
});

const STEPS = [
  {
    n: "01",
    title: "Zone capacity",
    body: "For every zone we take the 99th percentile of road length ever observed across its snapshots. That value becomes K, the reference network. Roads missing from a night snapshot count as free-flowing, not as missing data.",
  },
  {
    n: "02",
    title: "Weighted congestion share",
    body: "Each snapshot's colored segments collapse into a single number: yellow counts once, red twice, dark red three times, divided by K. The result is the share of the network at gridlock-equivalent load.",
  },
  {
    n: "03",
    title: "Calm baseline & anchoring",
    body: "Every zone has its own typical calm level: the 20th percentile of its raw values. The published index is how far the current state sits between that calm level and total saturation, scaled 0-100.",
  },
  {
    n: "04",
    title: "Aggregation",
    body: "Snapshots average into days weighted by how much road each actually saw, days into zones, zones into cities weighted by network size. Highways and normal routes are scored on their own capacities.",
  },
];

const TERMS: { term: string; definition: string }[] = [
  {
    term: "Congestion index",
    definition:
      "The headline 0–100 score for a city, zone or the whole network: how far the current state sits between that unit's calm level and total saturation.",
  },
  {
    term: "Zone (area)",
    definition:
      "A monitored district of a city. It is the unit each traffic-image snapshot is cropped to, and the smallest level we publish.",
  },
  {
    term: "Snapshot",
    definition:
      "One timestamped capture of a zone's street-level traffic imagery. Snapshots arrive roughly every two hours and are the raw input of the whole index.",
  },
  {
    term: "Reference network (K)",
    definition:
      "The 99th percentile of road length ever observed in a zone. It is the denominator of the congestion share, so a zone is always compared against its own busiest possible state.",
  },
  {
    term: "Gridlock-equivalent load (raw)",
    definition:
      "The weighted road length in trouble in one snapshot: (1 × yellow + 2 × red + 3 × dark_red) ÷ K. Red counts twice and dark red three times because standstill traffic costs more than slow traffic.",
  },
  {
    term: "Calm level",
    definition:
      "A zone's own free-flow baseline: the 20th percentile of its raw values. It removes the structural difference between a permanently busy city and a quiet one.",
  },
  {
    term: "Coverage",
    definition:
      "The share of a zone's reference network that a given snapshot actually saw. It weights the daily averages, so a thin night snapshot counts less than a full daytime one.",
  },
  {
    term: "2-hour window",
    definition:
      "The reporting slot of every curve on the site. Snapshots are binned into twelve two-hour windows per day, so a plotted point is an average, not a single measurement.",
  },
  {
    term: "Workday",
    definition: "Sunday to Thursday — the Algerian working week.",
  },
  {
    term: "Weekend",
    definition: "Friday and Saturday.",
  },
  {
    term: "Road class",
    definition:
      "The type of road a figure is computed on: a highway (motorway or expressway) or a normal route. Each class is scored on its own capacity and calm level.",
  },
  {
    term: "Wilaya",
    definition: "The Algerian administrative province a city belongs to.",
  },
  {
    term: "Congestion scale",
    definition: "Fluid below 7%, Moderate 7–11%, High 11–14%, Critical at 14% and above.",
  },
];

function MethodologyPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-10 max-w-3xl animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="label-xs mb-3">Technical note · v1.02</div>
        <h1 className="text-3xl font-bold tracking-tight">Methodology</h1>
        <p className="mt-3 text-muted-foreground">
          The Algeria Urban Congestion Index measures how congested a road network is compared with
          the same network under free-flow conditions. It is deliberately comparable with
          international travel-time indices so Algerian cities can be benchmarked abroad.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        {STEPS.map((s, i) => (
          <Panel key={s.n} className="p-6">
            <div style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` }}>
              <div className="num mb-3 text-sm font-bold text-signal">{s.n}</div>
              <h2 className="mb-2 text-lg font-bold">{s.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-8 bg-ink p-8 text-ink-foreground">
        <div className="label-xs mb-4 text-ink-muted">Index formula</div>
        <p className="num text-lg leading-relaxed">
          raw = ( 1·yellow + 2·red + 3·dark_red ) / K &nbsp;&nbsp;→&nbsp;&nbsp; index = ( raw − calm
          ) / ( max − calm ) × 100
        </p>
        <p className="mt-4 max-w-2xl text-sm text-ink-muted">
          where K is the zone's reference network (99th percentile of observed road length) and calm
          its 20th-percentile free-flow state. Peaks are reported separately for the morning
          (06:00–10:00) and evening (16:00–20:00) windows.
        </p>
      </Panel>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel className="p-6">
          <h2 className="mb-4 font-bold">Congestion scale</h2>
          <div className="space-y-3">
            {[
              ["Fluid", "Below 7%", "var(--free)"],
              ["Moderate", "7% – 11%", "var(--moderate)"],
              ["High", "11% – 14%", "var(--high)"],
              ["Critical", "14% and above", "var(--critical)"],
            ].map(([label, range, color]) => (
              <div key={label} className="flex items-center gap-4">
                <span className="h-2 w-16 rounded-full" style={{ background: color }} />
                <span className="text-sm font-semibold">{label}</span>
                <span className="num ml-auto text-xs text-muted-foreground">{range}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h2 className="mb-4 font-bold">Limitations</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              Coverage is concentrated on the northern corridor; Saharan wilayas have thinner
              sampling and wider confidence intervals.
            </li>
            <li>
              The working week is Sunday–Thursday; Friday and Saturday profiles are reported as the
              weekend series.
            </li>
            <li>
              Public-holiday and Ramadan periods shift peak hours substantially and are flagged but
              not removed from the monthly series.
            </li>
          </ul>
        </Panel>
      </div>

      <Panel className="mt-8 p-6 md:p-8">
        <div className="mb-6">
          <h2 className="font-bold">Terminology</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Every term the site and this methodology page use, in one place.
          </p>
        </div>
        <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
          {TERMS.map((t) => (
            <div key={t.term}>
              <dt className="mb-1 text-sm font-bold">{t.term}</dt>
              <dd className="text-sm leading-relaxed text-muted-foreground">{t.definition}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </main>
  );
}
