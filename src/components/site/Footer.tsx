export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center">
        <div>
          <div className="mb-2 font-bold">DZ Traffic Index Project</div>
          <p className="max-w-sm text-sm text-muted-foreground">
            The first comprehensive traffic congestion measurement framework for Algeria, developed
            as an engineering internship initiative.
          </p>
        </div>
        <div className="flex gap-12">
          <div>
            <div className="label-xs mb-4">Data Source</div>
            <div className="text-sm font-medium">CSV telemetry export v1.02</div>
          </div>
          <div>
            <div className="label-xs mb-4">Coverage</div>
            <div className="text-sm font-medium">12 metropolitan areas</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
