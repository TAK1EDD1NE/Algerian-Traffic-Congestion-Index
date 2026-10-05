import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { RankingsTable } from "@/components/data/RankingsTable";
import { Panel, PageState } from "@/components/site/Panel";
import { datasetQuery } from "@/lib/traffic";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";

export const Route = createFileRoute("/$locale/rankings")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.rankings.title") },
        { name: "description", content: t("meta.rankings.description") },
        { property: "og:title", content: t("meta.rankings.ogTitle") },
        { property: "og:description", content: t("meta.rankings.ogDescription") },
      ],
    };
  },
  component: RankingsPage,
});

function RankingsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery(datasetQuery);

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-1 animate-[rise_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h1 className="text-3xl font-bold tracking-tight">{t("rankings.title")}</h1>
        <p className="text-muted-foreground">{t("rankings.note", { count: data.cities.length })}</p>
      </div>

      <Panel className="overflow-hidden">
        <div className="overflow-x-auto">
          <RankingsTable cities={data.cities} />
        </div>
      </Panel>
    </main>
  );
}
