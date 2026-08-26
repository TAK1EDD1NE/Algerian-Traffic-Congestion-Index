import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type HourlyRow, hourlyProfile } from "@/lib/traffic";
import { ChartTooltip } from "./ChartTooltip";

export function HourlyChart({ hourly, city }: { hourly: HourlyRow[]; city?: string }) {
  const data = hourlyProfile(hourly, city);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="workdayFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--signal)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--signal)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="label"
          interval={1}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 10, fill: "var(--muted-foreground)", fontFamily: "var(--font-mono)" }}
          unit="%"
        />
        <Tooltip
          cursor={{ stroke: "var(--signal)", strokeWidth: 1, strokeDasharray: "3 3" }}
          content={<ChartTooltip unit="%" />}
        />
        <Area
          type="monotone"
          dataKey="workday"
          name="Sun–Wed"
          stroke="var(--signal)"
          strokeWidth={2.5}
          fill="url(#workdayFill)"
          animationDuration={900}
        />
        <Area
          type="monotone"
          dataKey="weekend"
          name="Thu–Fri"
          stroke="var(--muted-foreground)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill="transparent"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
