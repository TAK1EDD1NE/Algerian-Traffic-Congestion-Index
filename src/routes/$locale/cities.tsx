import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CityReport } from "@/components/data/CityReport";
import { PageState } from "@/components/site/Panel";
import { datasetQuery } from "@/lib/traffic";
import { DEFAULT_LOCALE, isLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";

export const Route = createFileRoute("/$locale/cities")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    return {
      meta: [
        { title: t("meta.cities.title") },
        { name: "description", content: t("meta.cities.description") },
        { property: "og:title", content: t("meta.cities.ogTitle") },
        { property: "og:description", content: t("meta.cities.ogDescription") },
      ],
    };
  },
  component: CitiesPage,
});

const DEFAULT_CITY = "Alger";

function CitiesPage() {
  const { data, isLoading, error } = useQuery(datasetQuery);
  const [cityName, setCityName] = useState(DEFAULT_CITY);

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  const city = data.cities.find((c) => c.city === cityName) ?? data.cities[0]!;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <CityReport data={data} city={city} onSelectCity={setCityName} />
    </main>
  );
}
