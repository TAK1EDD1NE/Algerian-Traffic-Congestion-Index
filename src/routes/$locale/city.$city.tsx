import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_LOCALE, isLocale, useLocale } from "@/i18n/locale";
import { translateFor } from "@/i18n/createI18n";
import { CityReport } from "@/components/data/CityReport";
import { PageState } from "@/components/site/Panel";
import { datasetQuery, slug } from "@/lib/traffic";

export const Route = createFileRoute("/$locale/city/$city")({
  head: ({ params }) => {
    const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
    const t = translateFor(locale);
    const name = params.city.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: t("meta.city.title", { city: name }) },
        { name: "description", content: t("meta.city.description", { city: name }) },
        { property: "og:title", content: t("meta.city.ogTitle", { city: name }) },
        { property: "og:description", content: t("meta.city.ogDescription", { city: name }) },
      ],
    };
  },
  component: CityReportRoute,
});

function CityReportRoute() {
  const { city: citySlug } = Route.useParams();
  const { data, isLoading, error } = useQuery(datasetQuery);
  const navigate = useNavigate();
  const locale = useLocale();

  if (isLoading || error || !data)
    return <PageState loading={isLoading} error={error as Error | null} />;

  const city = data.cities.find((c) => slug(c.city) === citySlug);
  if (!city) throw notFound();

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <CityReport
        data={data}
        city={city}
        onSelectCity={(name) =>
          navigate({
            to: "/$locale/city/$city",
            params: { locale, city: slug(name) },
          })
        }
      />
    </main>
  );
}
