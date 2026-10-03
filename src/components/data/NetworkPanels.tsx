import { useTranslation } from "react-i18next";
import {
  type AreaRow,
  type CityRow,
  type ColorCompRow,
  CLASS_COLOR,
  CLASS_LABEL_KEY,
  levelColor,
} from "@/lib/traffic";
import { useFormat } from "@/i18n/format";

const CLASSES = ["green", "yellow", "red", "dark_red"] as const;

/** Coverage gauge + highway/normal split for one city. */
export function CoveragePanel({ city }: { city: CityRow }) {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const hwy = Math.round(city.highwaySharePct);
  const nrm = 100 - hwy;
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label-xs mb-1">{t("network.roadNetworkMonitored")}</div>
          <div className="num text-3xl font-bold tracking-tighter">
            {fmt(city.capacityKm, 0)} {t("common.km")}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {t("network.referenceNetworkAcross", { count: city.nAreas })}
          </div>
        </div>
        <div className="text-right">
          <div className="label-xs mb-1">{t("network.avgVisibility")}</div>
          <div className="num text-lg font-semibold">{fmt(city.coveragePct)}%</div>
          <div className="num text-xs text-muted-foreground">
            {t("network.snapshots", { count: fmt(city.nSnapshots, 0) })}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">{t("common.highways")}</span>
          <span className="num text-muted-foreground">{fmt(hwy, 0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-signal transition-[width] duration-700"
            style={{ width: `${hwy}%` }}
          />
        </div>
        <div className="mt-3 mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold">{t("common.normalRoutes")}</span>
          <span className="num text-muted-foreground">{fmt(nrm, 0)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${nrm}%`, background: "var(--muted-foreground)" }}
          />
        </div>
      </div>

      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        {t("network.coverageNote")}
      </p>
    </div>
  );
}

/** Congestion level distribution across normal routes vs highways. */
export function ColorDistribution({ comp }: { comp: ColorCompRow[] }) {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const byClass = new Map(comp.map((r) => [r.class, r]));
  const rows = CLASSES.map((c) => byClass.get(c)).filter(Boolean) as ColorCompRow[];
  if (!rows.length) return null;

  return (
    <div>
      <div className="mb-5 grid grid-cols-2 gap-x-8 gap-y-4">
        {rows.map((r) => (
          <div key={r.class}>
            <div className="mb-1.5 flex items-baseline justify-between text-xs">
              <span className="font-medium">{t(CLASS_LABEL_KEY[r.class])}</span>
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
            <div className="num mt-1 text-[10px] text-muted-foreground">
              {t("network.normalRoutesNote")}
            </div>
          </div>
        ))}
      </div>

      <table className="w-full text-left text-xs">
        <thead>
          <tr className="bg-secondary/50">
            <th className="label-xs px-3 py-2">{t("network.tableLevel")}</th>
            <th className="label-xs px-3 py-2">{t("network.tableNormal")}</th>
            <th className="label-xs px-3 py-2">{t("network.tableHighway")}</th>
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
                  {t(CLASS_LABEL_KEY[r.class])}
                </span>
              </td>
              <td className="num px-3 py-2">{fmt(r.normalPct)}%</td>
              <td className="num px-3 py-2">{fmt(r.highwayPct)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        {t("network.colorNote")}
      </p>
    </div>
  );
}

/** Per-area breakdown table for one city. */
export function AreasTable({ areas }: { areas: AreaRow[] }) {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const max = Math.max(...areas.map((a) => a.congestionIndex), 1);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-secondary/50">
            <th className="label-xs px-4 py-3">{t("network.area")}</th>
            <th className="label-xs px-4 py-3">{t("network.congestion")}</th>
            <th className="label-xs px-4 py-3">{t("network.avgCoverage")}</th>
            <th className="label-xs px-4 py-3">{t("network.network")}</th>
            <th className="label-xs px-4 py-3">{t("network.calmLevel")}</th>
            <th className="label-xs px-4 py-3">{t("network.snapshotsCol")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {areas.map((a) => (
            <tr key={a.area} className="transition-colors hover:bg-secondary/60">
              <td className="num px-4 py-3 font-semibold">{t("network.zone", { area: a.area })}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="num w-10 font-semibold"
                    style={{ color: levelColor(a.congestionIndex) }}
                  >
                    {fmt(a.congestionIndex)}%
                  </span>
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(a.congestionIndex / max) * 100}%`,
                        background: levelColor(a.congestionIndex),
                      }}
                    />
                  </span>
                </div>
              </td>
              <td className="num px-4 py-3">{fmt(a.avgCoveragePct)}%</td>
              <td className="num px-4 py-3">
                {fmt(a.capacityKm)} {t("common.km")}
              </td>
              <td className="num px-4 py-3 text-muted-foreground">{fmt(a.freeflowRaw, 3)}</td>
              <td className="num px-4 py-3 text-muted-foreground">{fmt(a.nSnapshots, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
