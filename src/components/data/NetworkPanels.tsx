import { type AreaRow, type CityRow, type ColorCompRow,
         CLASS_COLOR, CLASS_LABEL, fmt, levelColor } from "@/lib/traffic";

const CLASSES = ["green", "yellow", "red", "dark_red"] as const;

/** Coverage gauge + highway/normal split for one city. */
export function CoveragePanel({ city }: { city: CityRow }) {
  const hwy = Math.round(city.highwaySharePct);
  const nrm = 100 - hwy;
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label-xs mb-1">Road network monitored</div>
          <div className="num text-3xl font-bold tracking-tighter">{fmt(city.capacityKm, 0)} km</div>
          <div className="mt-1 text-xs text-muted-foreground">
            reference network across {city.nAreas} areas
          </div>
        </div>
        <div className="text-right">
          <div className="label-xs mb-1">Avg visibility</div>
          <div className="num text-lg font-semibold">{fmt(city.coveragePct)}%</div>
          <div className="num text-xs text-muted-foreground">{fmt(city.nSnapshots, 0)} snapshots</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Highways</span>
          <span className="num text-muted-foreground">{hwy}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-signal transition-[width] duration-700"
            style={{ width: `${hwy}%` }}
          />
        </div>
        <div className="mt-3 mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">Normal routes</span>
          <span className="num text-muted-foreground">{nrm}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${nrm}%`, background: "var(--muted-foreground)" }}
          />
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Google colors only roads with live traffic data, so night snapshots see fewer roads.
        Coverage compares what each snapshot actually saw against the zone's reference network
        (99th percentile of road length ever observed).
      </p>
    </div>
  );
}

/** Congestion level distribution across normal routes vs highways. */
export function ColorDistribution({ comp }: { comp: ColorCompRow[] }) {
  const byClass = new Map(comp.map((r) => [r.class, r]));
  const rows = CLASSES.map((c) => byClass.get(c)).filter(Boolean) as ColorCompRow[];
  if (!rows.length) return null;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-4">
        {rows.map((r) => (
          <div key={r.class}>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-medium">{CLASS_LABEL[r.class]}</span>
              <span className="num font-bold" style={{ color: CLASS_COLOR[r.class] }}>
                {fmt(r.normalPct)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, r.normalPct * 2)}%`,
                  background: CLASS_COLOR[r.class],
                }}
              />
            </div>
            <div className="num mt-1 text-[10px] text-muted-foreground">normal routes</div>
          </div>
        ))}
      </div>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-secondary/50">
            <th className="label-xs px-3 py-2">Level</th>
            <th className="label-xs px-3 py-2">Normal</th>
            <th className="label-xs px-3 py-2">Highway</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.class}>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-2 font-medium">
                  <span
                    aria-hidden
                    className="inline-block size-2 rounded-[2px]"
                    style={{ background: CLASS_COLOR[r.class] }}
                  />
                  {CLASS_LABEL[r.class]}
                </span>
              </td>
              <td className="num px-3 py-2">{fmt(r.normalPct)}%</td>
              <td className="num px-3 py-2">{fmt(r.highwayPct)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Share of each road class's capacity shown in every traffic color, averaged over the whole
        window. A dark-red share above zero means part of the network was at a standstill.
      </p>
    </div>
  );
}

/** Per-area breakdown table for one city. */
export function AreasTable({ areas }: { areas: AreaRow[] }) {
  const max = Math.max(...areas.map((a) => a.congestionIndex), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-secondary/50">
            <th className="label-xs px-4 py-3">Area</th>
            <th className="label-xs px-4 py-3">Congestion</th>
            <th className="label-xs px-4 py-3">Avg coverage</th>
            <th className="label-xs px-4 py-3">Network</th>
            <th className="label-xs px-4 py-3">Calm level</th>
            <th className="label-xs px-4 py-3">Snapshots</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {areas.map((a) => (
            <tr key={a.area} className="transition-colors hover:bg-secondary/60">
              <td className="num px-4 py-3 font-semibold">Zone {a.area}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="num w-10 font-semibold" style={{ color: levelColor(a.congestionIndex) }}>
                    {fmt(a.congestionIndex)}%
                  </span>
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${(a.congestionIndex / max) * 100}%`, background: levelColor(a.congestionIndex) }}
                    />
                  </span>
                </div>
              </td>
              <td className="num px-4 py-3">{fmt(a.avgCoveragePct)}%</td>
              <td className="num px-4 py-3">{fmt(a.capacityKm)} km</td>
              <td className="num px-4 py-3 text-muted-foreground">{a.freeflowRaw.toFixed(3)}</td>
              <td className="num px-4 py-3 text-muted-foreground">{a.nSnapshots}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
