import { Link, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { type CityRow, levelColor, slug } from "@/lib/traffic";
import { useLocale } from "@/i18n/locale";
import { useFormat } from "@/i18n/format";

/**
 * Full rankings table: every monitored city ordered worst-first, one row per
 * city, with the network/coverage figures the city report's stat cards show.
 * The whole row opens the city report; the city name stays a real link so
 * keyboard, middle-click and open-in-new-tab still work.
 */
export function RankingsTable({ cities }: { cities: CityRow[] }) {
  const locale = useLocale();
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const navigate = useNavigate();

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="bg-secondary/50">
          <th className="label-xs px-6 py-3">{t("ranking.rank")}</th>
          <th className="label-xs px-6 py-3">{t("ranking.cityWilaya")}</th>
          <th className="label-xs px-6 py-3">{t("ranking.congestion")}</th>
          <th className="label-xs px-6 py-3">{t("ranking.roadNetwork")}</th>
          <th className="label-xs px-6 py-3">{t("cities.stat.areas")}</th>
          <th className="label-xs px-6 py-3">{t("cities.stat.visibility")}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border text-sm">
        {cities.map((c, i) => {
          const to = "/$locale/city/$city" as const;
          const params = { locale, city: slug(c.city) };
          return (
            <tr
              key={c.city}
              onClick={(event) => {
                // The name cell is already a link — let it handle its own click.
                if ((event.target as HTMLElement).closest("a")) return;
                void navigate({ to, params });
              }}
              className="group cursor-pointer transition-colors hover:bg-secondary/60"
              style={{ animation: `rise 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 30}ms both` }}
            >
              <td className="num px-6 py-4 text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </td>
              <td className="px-6 py-4">
                <Link
                  to={to}
                  params={params}
                  className="font-semibold transition-colors group-hover:text-signal"
                >
                  {c.city}
                </Link>
                <div className="text-xs text-muted-foreground">{c.wilaya}</div>
              </td>
              <td className="num px-6 py-4 font-semibold" style={{ color: levelColor(c.congestionIndex) }}>
                {fmt(c.congestionIndex)}%
              </td>
              <td className="num px-6 py-4">
                {fmt(c.capacityKm, 0)} {t("common.km")}
              </td>
              <td className="num px-6 py-4">{fmt(c.nAreas, 0)}</td>
              <td className="num px-6 py-4">{fmt(c.coveragePct)}%</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
