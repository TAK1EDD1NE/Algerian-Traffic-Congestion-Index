import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-card shadow-panel", className)}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <div>
        <h2 className="font-bold">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageState({ loading, error }: { loading: boolean; error: Error | null }) {
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-7xl px-6 py-24">
      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-panel">
        {loading ? (
          <>
            <div className="mx-auto mb-4 flex size-10 items-center justify-center">
              <span className="size-3 animate-[signal_1.6s_ease-in-out_infinite] rounded-full bg-signal" />
            </div>
            <p className="label-xs">{t("errors.datasetLoading")}</p>
          </>
        ) : (
          <>
            <p className="font-semibold text-destructive">{t("errors.datasetErrorTitle")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {error?.message ?? t("errors.datasetErrorUnknown")}
            </p>
          </>
        )}
      </div>
    </main>
  );
}
