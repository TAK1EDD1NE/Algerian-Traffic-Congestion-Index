import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Panel } from "@/components/site/Panel";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";

export const Route = createFileRoute("/$locale/about")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.about.title") },
        { name: "description", content: t("meta.about.description") },
        { property: "og:title", content: t("meta.about.ogTitle") },
        { property: "og:description", content: t("meta.about.ogDescription") },
      ],
    };
  },
  component: AboutPage,
});

type PersonSlug = "rehail" | "azouaou";
type PersonKey = `about.people.${PersonSlug}.${"role" | "bio"}`;

type Person = {
  name: string;
  roleKey: PersonKey;
  org: string;
  bioKey: PersonKey;
  links: { label: string; href: string; handle: string }[];
};

const TEAM: Person[] = [
  {
    name: "Rehail Taki Eddine",
    roleKey: "about.people.rehail.role",
    org: "ESTIN",
    bioKey: "about.people.rehail.bio",
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
    roleKey: "about.people.azouaou.role",
    org: "ESTIN · Laboratoire LITAN",
    bioKey: "about.people.azouaou.bio",
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
  const { t } = useTranslation();
  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <header className="mb-10 max-w-3xl animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <div className="label-xs mb-3">{t("about.title")}</div>
        <h1 className="text-3xl font-bold tracking-tight">{t("about.heading")}</h1>
        <p className="mt-3 text-muted-foreground">{t("about.intro")}</p>
      </header>

      <h2 className="label-xs mb-4">{t("about.teamHeading")}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {TEAM.map((p, i) => (
          <Panel key={p.name} className="p-6">
            <div style={{ animation: `rise 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 90}ms both` }}>
              <div className="label-xs mb-2">{p.org}</div>
              <h3 className="text-xl font-bold tracking-tight">{p.name}</h3>
              <p className="mt-1 text-sm font-medium text-signal">{t(p.roleKey)}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t(p.bioKey)}</p>
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

      <h2 className="label-xs mt-10 mb-4">{t("about.schoolHeading")}</h2>
      <Panel className="p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-xl font-bold tracking-tight">{t("about.schoolName")}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t("about.schoolBody")}
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
