import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useLocale } from "@/i18n/locale";
import { CityReport } from "@/components/data/CityReport";
import { PageState } from "@/components/site/Panel";
import { datasetQuery, slug } from "@/lib/traffic";

export const Route = createFileRoute("/$locale/city/$city")({
  head: ({ params }) => {
    const name = params.city.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${name} congestion report — Algeria Urban Congestion Index` },
        {
          name: "description",
          content: `Hourly congestion profile, weekly heatmap, road-network coverage and area breakdown for ${name}, Algeria.`,
        },
        {
          property: "og:title",
          content: `${name} congestion report — Algeria Urban Congestion Index`,
        },
        {
          property: "og:description",
          content: `Hourly profile, weekly heatmap and area breakdown for ${name}.`,
        },
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
