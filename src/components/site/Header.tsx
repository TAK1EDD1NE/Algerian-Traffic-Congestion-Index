import { Link } from "@tanstack/react-router";

const NAV = [
  { to: "/", label: "Live Index" },
  { to: "/cities", label: "City Reports" },
  { to: "/explore", label: "Explorer" },
  { to: "/data", label: "Dataset" },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex shrink-0 items-center gap-3">
          <span className="grid size-8 place-items-center rounded-md bg-ink">
            <span className="size-3 rounded-full bg-signal" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-tight">
              AU<span className="text-signal">CI</span>
            </span>
            <span className="mt-1 hidden text-[9px] font-bold tracking-[0.14em] text-muted-foreground uppercase lg:block">
              Algeria Urban Congestion Index
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 text-[13px] font-medium text-muted-foreground md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="py-5 transition-colors hover:text-foreground data-[status=active]:border-b-2 data-[status=active]:border-signal data-[status=active]:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-free/25 bg-free/10 px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-[signal_2.4s_cubic-bezier(0.4,0,0.6,1)_infinite] rounded-full bg-free" />
            <span className="relative inline-flex size-2 rounded-full bg-free" />
          </span>
          <span className="text-[10px] font-bold tracking-wider text-free uppercase">
            Index Online
          </span>
        </div>
      </div>
    </header>
  );
}
