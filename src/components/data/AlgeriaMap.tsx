import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { type CityRow, level, LEVEL_LABEL_KEY, levelColor, slug } from "@/lib/traffic";
import { useLocale } from "@/i18n/locale";
import { useFormat } from "@/i18n/format";

const BOUNDS = { minLng: -3.2, maxLng: 9.2, minLat: 30.6, maxLat: 37.6 };
const W = 1000;
const H = 520;
/** Floating city card: fixed dimensions used to keep it inside the map box. */
const CARD_W = 224;
const CARD_H = 176;
const GAP = 14;

const project = (lng: number, lat: number) => ({
  x: ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * W,
  y: H - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * H,
});

const COAST: [number, number][] = [
  [-2.2, 35.1],
  [-1.6, 35.55],
  [-1.0, 35.7],
  [-0.35, 35.83],
  [0.35, 36.0],
  [1.05, 36.5],
  [1.9, 36.55],
  [2.6, 36.75],
  [3.4, 36.85],
  [4.2, 36.9],
  [5.1, 36.78],
  [5.9, 37.05],
  [6.6, 37.1],
  [7.3, 37.05],
  [8.0, 36.9],
  [8.6, 36.95],
];

const border: [number, number][] = [
  ...COAST,
  [8.9, 34.0],
  [8.3, 32.5],
  [7.5, 31.0],
  [5.0, 30.7],
  [2.0, 30.9],
  [-1.0, 31.6],
  [-2.4, 32.6],
  [-2.0, 34.0],
];

const path = (pts: [number, number][], close = false) =>
  pts
    .map(([lng, lat], i) => {
      const { x, y } = project(lng, lat);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + (close ? " Z" : "");

type Tooltip = { city: CityRow; left: number; top: number };

export function AlgeriaMap({ cities, selected }: { cities: CityRow[]; selected?: string }) {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const [tip, setTip] = useState<Tooltip | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();
  const locale = useLocale();
  const max = Math.max(...cities.map((c) => c.congestionIndex), 1);
  const min = Math.min(...cities.map((c) => c.congestionIndex));

  // A resize invalidates the measured position; drop the card until the next hover.
  useEffect(() => {
    const clear = () => setTip(null);
    window.addEventListener("resize", clear);
    return () => window.removeEventListener("resize", clear);
  }, []);

  /**
   * Anchor the card to the hovered city. The SVG viewBox is letterboxed inside its
   * box (preserveAspectRatio "meet"), so push the projected point through the same
   * scale + offset the renderer applies, then keep the card within the box bounds.
   */
  const place = (c: CityRow): Tooltip | null => {
    const box = boxRef.current;
    const svg = svgRef.current;
    if (!box || !svg) return null;
    const br = box.getBoundingClientRect();
    const sr = svg.getBoundingClientRect();
    const scale = Math.min(sr.width / W, sr.height / H);
    const offX = (sr.width - W * scale) / 2;
    const offY = (sr.height - H * scale) / 2;
    const p = project(c.longitude, c.latitude);
    const x = sr.left - br.left + offX + p.x * scale;
    const y = sr.top - br.top + offY + p.y * scale;

    const left = Math.max(8, Math.min(br.width - CARD_W - 8, x - CARD_W / 2));
    const above = y - GAP - CARD_H;
    const top = above >= 8 ? above : Math.max(8, Math.min(y + GAP, br.height - CARD_H - 8));
    return { city: c, left, top };
  };

  const show = (c: CityRow) => setTip(place(c));
  const hide = () => setTip(null);

  return (
    <div
      ref={boxRef}
      className="relative h-[520px] overflow-hidden rounded-2xl border border-border bg-card shadow-panel grid-paper"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="size-full"
        role="img"
        aria-label={t("map.ariaMap")}
      >
        <path
          d={path(border, true)}
          fill="var(--secondary)"
          stroke="var(--border)"
          strokeWidth={2}
        />
        <path d={path(COAST)} fill="none" stroke="var(--signal)" strokeWidth={2.5} opacity={0.5} />

        {cities.map((c, i) => {
          const { x, y } = project(c.longitude, c.latitude);
          const r = 9 + ((c.congestionIndex - min) / (max - min || 1)) * 22;
          const isActive = selected === c.city || tip?.city.city === c.city;
          const dimmed = tip !== null && !isActive;
          return (
            <g
              key={c.city}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={t("map.ariaCity", { city: c.city, value: fmt(c.congestionIndex) })}
              onMouseEnter={() => show(c)}
              onMouseLeave={hide}
              onFocus={() => show(c)}
              onBlur={hide}
              onClick={() =>
                navigate({
                  to: "/$locale/city/$city",
                  params: { locale, city: slug(c.city) },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate({
                    to: "/$locale/city/$city",
                    params: { locale, city: slug(c.city) },
                  });
                }
              }}
            >
              <g style={{ animation: `bubbleIn 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 45}ms both` }}>
                {/* halo pulse only on the active bubble */}
                {isActive && (
                  <circle
                    r={r + 10}
                    fill="none"
                    stroke={levelColor(c.congestionIndex)}
                    strokeWidth={1.5}
                    className="bubble-pulse"
                  />
                )}
                <circle
                  r={r}
                  fill={levelColor(c.congestionIndex)}
                  opacity={dimmed ? 0.07 : isActive ? 0.3 : 0.15}
                  style={{ transition: "opacity 200ms ease" }}
                />
                <circle
                  r={isActive ? 7 : 5}
                  fill={levelColor(c.congestionIndex)}
                  stroke="var(--card)"
                  strokeWidth={2}
                  style={{ transition: "r 200ms ease" }}
                />
                <text
                  x={0}
                  y={-r - 8}
                  textAnchor="middle"
                  className="num"
                  fontSize={13}
                  fill="var(--foreground)"
                  opacity={dimmed ? 0 : isActive ? 1 : 0.65}
                  style={{ transition: "opacity 200ms ease", pointerEvents: "none" }}
                >
                  {c.city}
                </text>
              </g>
              {/* generous invisible hit area */}
              <circle r={Math.max(r + 12, 24)} fill="transparent" />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute top-6 left-6 rounded-xl border border-border bg-card/90 p-4 shadow-float backdrop-blur">
        <div className="label-xs mb-1">{t("map.geospatialView")}</div>
        <div className="text-sm font-semibold">
          {t("map.northernCorridor", { count: cities.length })}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{t("map.bubbleLegend")}</div>
      </div>

      {tip && (
        <div
          key={tip.city.city}
          className="pointer-events-none absolute z-10 w-56 rounded-xl border border-border bg-card/95 p-4 shadow-float backdrop-blur animate-[rise_0.18s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ left: tip.left, top: tip.top }}
        >
          <div className="label-xs mb-1">{tip.city.wilaya}</div>
          <div className="text-lg font-bold">{tip.city.city}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className="num text-2xl font-bold"
              style={{ color: levelColor(tip.city.congestionIndex) }}
            >
              {fmt(tip.city.congestionIndex)}%
            </span>
            <span className="text-xs text-muted-foreground">
              {t(LEVEL_LABEL_KEY[level(tip.city.congestionIndex)])}
            </span>
          </div>
          <div className="num mt-2 text-xs text-muted-foreground">
            {t("map.areasNetwork", {
              count: tip.city.nAreas,
              km: fmt(tip.city.capacityKm, 0),
            })}
          </div>
          <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
            {t("map.clickToOpen")}
          </div>
        </div>
      )}

      <div className="absolute right-6 bottom-6 w-60 rounded-xl border border-border bg-card/90 p-4 shadow-float backdrop-blur">
        <div className="label-xs mb-3">{t("map.congestionScale")}</div>
        <div className="space-y-2.5">
          {(
            [
              ["map.scale.critical", "var(--critical)"],
              ["map.scale.high", "var(--high)"],
              ["map.scale.moderate", "var(--moderate)"],
              ["map.scale.free", "var(--free)"],
            ] as const
          ).map(([label, color]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs font-medium">{t(label)}</span>
              <span className="h-2 w-14 rounded-full" style={{ background: color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
