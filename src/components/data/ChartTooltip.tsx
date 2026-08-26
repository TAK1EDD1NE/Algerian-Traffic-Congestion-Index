type Item = { name?: string; value?: number | string; color?: string; stroke?: string };

export function ChartTooltip({
  active,
  payload,
  label,
  unit = "",
}: {
  active?: boolean;
  payload?: Item[];
  label?: string | number;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 px-3 py-2 shadow-float backdrop-blur">
      <div className="label-xs mb-1.5">{label}</div>
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-3 text-xs">
            <span
              className="size-2 rounded-full"
              style={{ background: p.color ?? p.stroke ?? "var(--signal)" }}
            />
            <span className="text-muted-foreground">{p.name}</span>
            <span className="num ml-auto font-semibold">
              {typeof p.value === "number" ? p.value.toFixed(1) : p.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
