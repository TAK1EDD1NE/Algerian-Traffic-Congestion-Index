import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useLocale } from "@/i18n/locale";

const NAV = [
  { to: "/", key: "nav.liveIndex" },
  { to: "/rankings", key: "nav.rankings" },
  { to: "/cities", key: "nav.cityReports" },
  { to: "/explore", key: "nav.explorer" },
  { to: "/data", key: "nav.dataset" },
  { to: "/methodology", key: "nav.methodology" },
  { to: "/about", key: "nav.about" },
] as const;

export function Header() {
  const locale = useLocale();
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/$locale" params={{ locale }} className="flex shrink-0 flex-col leading-none">
          <span className="text-xl font-bold tracking-tight">
            dz-<span className="text-signal">traffic</span>
          </span>
          <span className="mt-1 hidden text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:block">
            {t("nav.brandSub")}
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-[13px] font-medium text-muted-foreground md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={`/$locale${item.to === "/" ? "" : item.to}`}
              params={{ locale }}
              activeOptions={{ exact: item.to === "/" }}
              className="py-5 transition-colors hover:text-foreground data-[status=active]:border-b-2 data-[status=active]:border-signal data-[status=active]:text-foreground"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-free/25 bg-free/10 px-3 py-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-[signal_2.4s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-free" />
              <span className="relative inline-flex size-2 rounded-full bg-free" />
            </span>
            <span className="text-[10px] font-bold tracking-wider text-free uppercase">
              {t("nav.indexOnline")}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
