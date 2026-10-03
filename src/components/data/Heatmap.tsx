import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DAYS_KEY, type HourlyRow, heatmapMatrix, levelColor } from "@/lib/traffic";
import { useFormat } from "@/i18n/format";

export function Heatmap({ hourly, city }: { hourly: HourlyRow[]; city: string }) {
  const { t } = useTranslation();
  const { fmt } = useFormat();
  const matrix = heatmapMatrix(hourly, city);
  const max = Math.max(...matrix.flat(), 1);
  const [cell, setCell] = useState<{ d: number; h: number; v: number } | null>(null);

  return (
    <div>
      <div className="flex items-start gap-2">
        <div className="num flex flex-col gap-[3px] pt-[18px] text-[10px] text-muted-foreground">
          {DAYS_KEY.map((k) => (
            <span key={k} className="flex h-5 items-center">
              {t(k)}
            </span>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <div className="num mb-1 grid grid-cols-12 gap-[3px] text-[9px] text-muted-foreground">
            {Array.from({ length: 12 }, (_, s) => (
              <span key={s} className="text-center">
                {(s * 2) % 6 === 0 ? String(s * 2).padStart(2, "0") : ""}
              </span>
            ))}
          </div>
          <div className="flex flex-col gap-[3px]">
            {matrix.map((row, d) => (
              <div className="grid grid-cols-12 gap-[3px]">
                {row.map((v, h) => (
                  <button
                    key={h}
                    type="button"
                    onMouseEnter={() => setCell({ d, h, v })}
                    onMouseLeave={() => setCell(null)}
                    className="h-5 rounded-[3px] transition-transform duration-150 hover:scale-125"
                    style={{
                      background: levelColor(v),
                      opacity: 0.16 + (v / max) * 0.84,
                      outline:
                        cell?.d === d && cell?.h === h ? "2px solid var(--foreground)" : undefined,
                    }}
                    aria-label={t("heatmap.cellAria", {
                      day: t(DAYS_KEY[d]!),
                      hour: `${String(h * 2).padStart(2, "0")}:00`,
                      value: fmt(v),
                    })}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {cell ? (
            <span>
              {t("heatmap.cellValue", {
                day: t(DAYS_KEY[cell.d]!),
                hour: `${String(cell.h * 2).padStart(2, "0")}:00`,
                value: fmt(cell.v),
              })}
            </span>
          ) : (
            t("heatmap.hoverHint")
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="label-xs">{t("common.low")}</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
            <span
              key={o}
              className="size-3 rounded-[3px]"
              style={{ background: levelColor(max * o), opacity: 0.2 + o * 0.8 }}
            />
          ))}
          <span className="label-xs">{t("common.high")}</span>
        </div>
      </div>
    </div>
  );
}
