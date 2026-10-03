import { Link } from "@tanstack/react-router";
import { useLocale } from "@/i18n/locale";

export function Footer() {
  const locale = useLocale();
  return (
    <footer className="mt-12 border-t border-border bg-card py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 font-bold">Algeria Urban Congestion Index</div>
          <p className="max-w-sm text-sm text-muted-foreground">
            An open measurement framework for urban road congestion across Algeria, built as an
            engineering internship initiative at ESTIN.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="label-xs mb-4">Data Source</div>
            <div className="text-sm font-medium">Bundled CSV reference dataset</div>
          </div>
          <div>
            <div className="label-xs mb-4">Coverage</div>
            <div className="text-sm font-medium">27 metropolitan areas</div>
          </div>
          <div>
            <div className="label-xs mb-4">About</div>
            <Link
              to="/$locale/about"
              params={{ locale }}
              className="text-sm font-medium transition-colors hover:text-signal"
            >
              Team &amp; school
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
