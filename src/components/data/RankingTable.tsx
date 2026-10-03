import { Link } from "@tanstack/react-router";
import { type CityRow, LEVEL_LABEL, fmt, level, levelColor, slug } from "@/lib/traffic";
import { useLocale } from "@/i18n/locale";

export function RankingTable({ cities, limit }: { cities: CityRow[]; limit?: number }) {
  const locale = useLocale();
  const rows = limit ? cities.slice(0, limit) : cities;
  const max = Math.max(...cities.map((c) => c.congestionIndex), 1);

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-secondary/50">
          <th className="label-xs px-6 py-3">Rank</th>
          <th className="label-xs px-6 py-3">City / Wilaya</th>
          <th className="label-xs px-6 py-3">Congestion</th>
          <th className="label-xs px-6 py-3">Road network</th>
          <th className="label-xs px-6 py-3">Status</th>
          <th className="label-xs px-6 py-3 text-right">Trend</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border text-sm">
        {rows.map((c, i) => {
          const delta = c.congestionIndex - c.previousIndex;
          return (
            <tr
              key={c.city}
              className="group transition-colors hover:bg-secondary/60"
              style={{ animation: `rise 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms both` }}
            >
              <td className="num px-6 py-4 text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-6 py-4">
                <Link
                  to="/$locale/city/$city"
                  params={{ locale, city: slug(c.city) }}
                  className="font-semibold transition-colors group-hover:text-signal"
                >
                  {c.city}
                </Link>
                <div className="text-xs text-muted-foreground">{c.wilaya}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span
                    className="num w-12 font-semibold"
                    style={{ color: levelColor(c.congestionIndex) }}
                  >
                    {fmt(c.congestionIndex)}%
                  </span>
                  <span className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full transition-[width] duration-700"
                      style={{
                        width: `${(c.congestionIndex / max) * 100}%`,
                        background: levelColor(c.congestionIndex),
                      }}
                    />
                  </span>
                </div>
              </td>
              <td className="num px-6 py-4">{fmt(c.capacityKm, 0)} km</td>
              <td className="px-6 py-4">
                <span
                  className="rounded px-2 py-1 text-xs font-bold"
                  style={{
                    color: levelColor(c.congestionIndex),
                    background: `color-mix(in oklab, ${levelColor(c.congestionIndex)} 12%, transparent)`,
                  }}
                >
                  {LEVEL_LABEL[level(c.congestionIndex)]}
                </span>
              </td>
              <td
                className="num px-6 py-4 text-right"
                style={{
                  color:
                    Math.abs(delta) < 0.05
                      ? "var(--muted-foreground)"
                      : delta > 0
                        ? "var(--critical)"
                        : "var(--free)",
                }}
              >
                {delta > 0 ? "+" : ""}
                {fmt(delta)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
