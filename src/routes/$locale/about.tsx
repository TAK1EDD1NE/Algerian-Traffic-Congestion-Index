import { createFileRoute } from "@tanstack/react-router";
import { Panel } from "@/components/site/Panel";

export const Route = createFileRoute("/$locale/about")({
  head: () => ({
    meta: [
      { title: "About — Algeria Urban Congestion Index" },
      {
        name: "description",
        content:
          "The people and the school behind the Algeria Urban Congestion Index: Rehail Taki Eddine and Pr. Faical Azouaou, and ESTIN.",
      },
      { property: "og:title", content: "About — Algeria Urban Congestion Index" },
      {
        property: "og:description",
        content: "The team and the school behind the Algeria Urban Congestion Index.",
      },
    ],
  }),
  component: AboutPage,
});

type Person = {
  name: string;
  role: string;
  org: string;
  bio: string;
  links: { label: string; href: string; handle: string }[];
};

const TEAM: Person[] = [
  {
    name: "Rehail Taki Eddine",
    role: "5th-year student — Artificial Intelligence & Data Science",
    org: "ESTIN",
    bio: "I designed and built the measurement pipeline, the congestion index and this web application, from street-level image capture through to the published per-city reports.",
    links: [
      { label: "GitHub", href: "https://github.com/TAK1EDD1NE", handle: "github.com/TAK1EDD1NE" },
      {
        label: "",
        href: "https://www.linkedin.com/in/takieddine-rehail-274031274",
        handle: "Rehail Taki Eddine",
      },
      { label: "Email", href: "mailto:t_rehail@estin.dz", handle: "t_rehail@estin.dz" },
    ],
  },
  {
    name: "Pr. Faical Azouaou",
    role: "Professor & teacher — Adjunct Director in charge of Information & Communication Systems and External Relations",
    org: "ESTIN · Laboratoire LITAN",
    bio: "I am a professor and researcher at ESTIN. My published work covers Arabic natural language processing, information retrieval and low-resource AI, and I lead the school's external-relations activity.",
    links: [
      {
        label: "Google Scholar",
        href: "https://scholar.google.com/citations?hl=en&user=IaLjS0kAAAAJ",
        handle: "Faical AZOUAOU",
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/azouaou-fai%C3%A7al-bb47b010",
        handle: "Azouaou Faiçal",
      },
      { label: "Email", href: "mailto:azouaou@estin.dz", handle: "azouaou@estin.dz" },
    ],
  },
];

function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-10 max-w-3xl animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="label-xs mb-3">About</div>
        <h1 className="text-3xl font-bold tracking-tight">About this project</h1>
        <p className="mt-3 text-muted-foreground">
          The Algeria Urban Congestion Index measures urban road congestion across 27 Algerian
          metropolitan areas from street-level traffic imagery. It was developed as an engineering
          internship project at ESTIN, the École Supérieure en Sciences et Technologies de
          l'Informatique et du Numérique.
        </p>
      </header>

      <h2 className="label-xs mb-4">The team</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {TEAM.map((p, i) => (
          <Panel key={p.name} className="p-6">
            <div style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` }}>
              <div className="label-xs mb-2">{p.org}</div>
              <h3 className="text-xl font-bold tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm font-medium text-signal">{p.role}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.bio}</p>
              <div className="mt-5 space-y-2 border-t border-border pt-4">
                {p.links.map((l) => (
                  <a
                    key={l.label}
                    href={l.href}
                    target={l.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel={l.href.startsWith("mailto:") ? undefined : "noreferrer"}
                    className="flex items-center justify-between gap-4 text-sm transition-colors hover:text-signal"
                  >
                    <span className="label-xs">{l.label}</span>
                    <span className="num truncate text-muted-foreground">{l.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <h2 className="label-xs mt-10 mb-4">The school</h2>
      <Panel className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold tracking-tight">
              ESTIN — École Supérieure en Sciences et Technologies de l'Informatique et du Numérique
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              A public Algerian engineering school on the Amizour campus, Béjaïa. It recruits
              nationwide and, after a common core in computer science, students specialise in
              artificial intelligence / data science or cybersecurity. The school also hosts the
              LITAN research laboratory. This is the school where the project was built and where
              Rehail Taki Eddine is a 5th-year student.
            </p>
          </div>
          <div className="shrink-0">
            <a
              href="https://estin.dz/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-secondary"
            >
              estin.dz
            </a>
          </div>
        </div>
      </Panel>
    </main>
  );
}
