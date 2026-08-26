import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { type CityRow, levelColor, level, LEVEL_LABEL, slug, fmt } from "@/lib/traffic";

const BOUNDS = { minLng: -3.2, maxLng: 9.2, minLat: 30.6, maxLat: 37.6 };
const W = 1000;
const H = 520;

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

export function AlgeriaMap({ cities, selected }: { cities: CityRow[]; selected?: string }) {
  const [hover, setHover] = useState<CityRow | null>(null);
  const navigate = useNavigate();
  const max = Math.max(...cities.map((c) => c.congestionIndex), 1);
  const min = Math.min(...cities.map((c) => c.congestionIndex));

  return (
    <div className="relative h-[520px] overflow-hidden rounded-2xl border border-border bg-card shadow-panel grid-paper">
      <svg viewBox={`0 0 ${W} ${H}`} className="size-full" role="img" aria-label="Congestion map of northern Algeria">
        <path d={path(border, true)} fill="var(--secondary)" stroke="var(--border)" strokeWidth={2} />
        <path d={path(COAST)} fill="none" stroke="var(--signal)" strokeWidth={2.5} opacity={0.5} />

        {cities.map((c, i) => {
          const { x, y } = project(c.longitude, c.latitude);
          const r = 9 + ((c.congestionIndex - min) / (max - min || 1)) * 22;
          const isActive = selected === c.city || hover?.city === c.city;
          const dimmed = hover !== null && !isActive;
          return (
            <g
              key={c.city}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              tabIndex={0}
              role="button"
              aria-label={`${c.city}, congestion index ${fmt(c.congestionIndex)} percent`}
              onMouseEnter={() => setHover(c)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(c)}
              onBlur={() => setHover(null)}
              onClick={() => navigate({ to: "/city/$city", params: { city: slug(c.city) } })}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate({ to: "/city/$city", params: { city: slug(c.city) } });
                }
              }}
            >
              <g style={{ animation: `bubbleIn 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 45}ms both` }}>
                {/* halo pulse only on the active bubble */}
                {isActive && (
                  <circle r={r + 10} fill="none" stroke={levelColor(c.congestionIndex)} strokeWidth={1.5} className="bubble-pulse" />
                )}
                <circle r={r} fill={levelColor(c.congestionIndex)} opacity={dimmed ? 0.07 : isActive ? 0.30 : 0.15} style={{ transition: "opacity 200ms ease" }} />
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
        <div className="label-xs mb-1">Geospatial view</div>
        <div className="text-sm font-semibold">Northern corridor · {cities.length} cities</div>
        <div className="mt-1 text-xs text-muted-foreground">Bubble size and color = congestion index</div>
      </div>

      {hover && (
        <div className="pointer-events-none absolute top-6 right-6 w-56 rounded-xl border border-border bg-card/95 p-4 shadow-float backdrop-blur">
          <div className="label-xs mb-1">{hover.wilaya}</div>
          <div className="text-lg font-bold">{hover.city}</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="num text-2xl font-bold" style={{ color: levelColor(hover.congestionIndex) }}>
              {fmt(hover.congestionIndex)}%
            </span>
            <span className="text-xs text-muted-foreground">{LEVEL_LABEL[level(hover.congestionIndex)]}</span>
          </div>
          <div className="num mt-2 text-xs text-muted-foreground">{hover.nAreas} areas · {fmt(hover.capacityKm, 0)} km network</div>
          <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
            Click to open the city report
          </div>
        </div>
      )}

      <div className="absolute right-6 bottom-6 w-60 rounded-xl border border-border bg-card/90 p-4 shadow-float backdrop-blur">
        <div className="label-xs mb-3">Congestion scale</div>
        <div className="space-y-2.5">
          {[
            ["Critical (14%+)", "var(--critical)"],
            ["High (11–14%)", "var(--high)"],
            ["Moderate (7–11%)", "var(--moderate)"],
            ["Fluid (<7%)", "var(--free)"],
          ].map(([label, color]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs font-medium">{label}</span>
              <span className="h-2 w-14 rounded-full" style={{ background: color }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
