import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartTooltip } from "./ChartTooltip";

export type TrendSeries = { key: string; color: string };

export function TrendChart({
  data,
  series,
  height = 300,
}: {
  data: Record<string, string | number>[];
  series: TrendSeries[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: -18, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          interval="preserveStartEnd"
          minTickGap={28}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          unit="%"
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
        />
        <Tooltip
          cursor={{ stroke: "var(--signal)", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip unit="%" />}
        />
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.key}
            stroke={s.color}
            strokeWidth={2.25}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--card)" }}
            animationDuration={1000}
            animationBegin={i * 120}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
